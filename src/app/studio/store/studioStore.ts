import { create } from "zustand";
import { getProvider, setCloudMode, type GenerationKind } from "@/app/studio/providers";
import { supabase } from "@/app/lib/supabase";
import { createCloudSaver, loadGraph as loadCloudGraph } from "@/app/studio/cloud/cloudProject";
import {
  DEMO_PROJECT_ID,
  makeBranch,
  mergeGraphs,
  migrateGraph,
  nextVersionNumber,
  seedDemoGraph,
  seedFromLegacyProject,
  shortHash,
} from "@/app/studio/lib/graph";
import {
  createTransport,
  type PeerPresence,
  type RealtimeTransport,
  type StudioMessage,
} from "@/app/studio/realtime/transport";
import { usePresence } from "@/app/studio/realtime/presence";
import type { Author, ProjectGraph, StudioSettings, VersionNode } from "@/app/studio/types";

// Single source of truth for an open project. Every mutation goes through
// commit(), which persists (localStorage, or Supabase for cloud projects) and
// broadcasts to collaborators.

const storageKey = (projectId: string) => `genvo_graph_${projectId}`;
const STALE_JOB_MS = 15_000;

function loadGraph(projectId: string): ProjectGraph | null {
  try {
    const raw = localStorage.getItem(storageKey(projectId));
    if (raw) return migrateGraph(JSON.parse(raw) as ProjectGraph);
  } catch {
    /* corrupt or unavailable */
  }
  if (projectId === DEMO_PROJECT_ID) return seedDemoGraph();
  return seedFromLegacyProject(projectId);
}

function persist(graph: ProjectGraph) {
  try {
    localStorage.setItem(storageKey(graph.id), JSON.stringify(graph));
  } catch {
    /* quota exceeded or unavailable */
  }
}

export type BranchTarget = { kind: "existing"; branchId: string } | { kind: "new"; name: string };

export interface CreateVersionInput {
  parentId: string;
  target: BranchTarget;
  title: string;
  prompt: string;
  settings: StudioSettings;
  author: Author;
}

export interface MergeInput {
  aId: string;
  bId: string;
  targetBranchId: string;
  title: string;
  prompt: string;
  settings: StudioSettings;
  author: Author;
}

type LoadStatus = "idle" | "loading" | "ready" | "not-found";

interface StudioState {
  graph: ProjectGraph | null;
  status: LoadStatus;
  cloud: boolean;
  open: (projectId: string, options?: { cloud?: boolean }) => void;
  close: () => void;
  createVersion: (input: CreateVersionInput) => string | null;
  mergeVersions: (input: MergeInput) => string | null;
  retryVersion: (id: string) => void;
  toggleApprove: (id: string, by: Author) => void;
  addComment: (id: string, text: string, by: Author) => void;
  markSynced: (id: string, by: Author, sequence: string) => void;
  resetProject: () => void;
}

let transport: RealtimeTransport | null = null;
let unsubscribe: (() => void) | null = null;
let heartbeat: ReturnType<typeof setInterval> | null = null;
let cloudSaver: ReturnType<typeof createCloudSaver> | null = null;
let openToken = 0;
const jobs = new Map<string, AbortController>();

export const useStudio = create<StudioState>((set, get) => {
  function commit(mutate: (g: ProjectGraph) => ProjectGraph) {
    const current = get().graph;
    if (!current) return;
    const next = { ...mutate(current), updatedAt: Date.now() };
    set({ graph: next });
    if (cloudSaver) cloudSaver.save(current, next);
    else persist(next);
    transport?.send({ type: "graph", from: usePresence.getState().self.id, graph: next });
  }

  function patchVersion(id: string, patch: Partial<VersionNode>) {
    commit((g) => {
      const v = g.versions[id];
      if (!v) return g;
      return { ...g, versions: { ...g.versions, [id]: { ...v, ...patch, updatedAt: Date.now() } } };
    });
  }

  async function runGeneration(id: string, kind: GenerationKind, resume?: VersionNode["job"]) {
    const v = get().graph?.versions[id];
    if (!v) return;
    jobs.get(id)?.abort();
    const controller = new AbortController();
    jobs.set(id, controller);
    patchVersion(id, { status: "generating", progress: 0, stage: "Starting", error: undefined });

    try {
      const out = await getProvider().generate(
        {
          prompt: v.prompt,
          settings: v.settings,
          kind,
          signal: controller.signal,
          resume,
          onJob: (job) => patchVersion(id, { job }),
        },
        (p) => patchVersion(id, { progress: p.progress, stage: p.stage })
      );
      patchVersion(id, {
        job: undefined,
        status: "ready",
        progress: 100,
        stage: undefined,
        videoUrl: out.videoUrl,
        posterUrl: out.posterUrl,
        settings: out.durationSec ? { ...v.settings, duration: out.durationSec } : v.settings,
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      patchVersion(id, {
        job: undefined,
        status: "failed",
        stage: undefined,
        error: err instanceof Error ? err.message : "Generation failed",
      });
    } finally {
      if (jobs.get(id) === controller) jobs.delete(id);
    }
  }

  function handleMessage(msg: StudioMessage) {
    const presence = usePresence.getState();
    if (msg.from === presence.self.id) return;
    switch (msg.type) {
      case "hello": {
        const graph = get().graph;
        if (graph) transport?.send({ type: "graph", from: presence.self.id, graph });
        transport?.send({ type: "presence", from: presence.self.id, peer: presence.selfPresence() });
        break;
      }
      case "graph": {
        const local = get().graph;
        if (!local || msg.graph.id !== local.id) return;
        const merged = mergeGraphs(local, msg.graph);
        set({ graph: merged });
        if (!cloudSaver) persist(merged); // cloud: the sender already saved its rows
        break;
      }
      case "presence":
        presence.upsertPeer({ ...msg.peer, lastSeen: Date.now() });
        break;
      case "bye":
        presence.removePeer(msg.id);
        break;
    }
  }

  function resumeStaleJobs(graph: ProjectGraph) {
    const now = Date.now();
    const selfId = usePresence.getState().self.id;
    const kindOf = (v: VersionNode): GenerationKind =>
      v.parentIds.length === 0 ? "root" : v.parentIds.length > 1 ? "merge" : "iterate";
    Object.values(graph.versions)
      .filter((v) => v.status === "queued" || v.status === "generating")
      .forEach((v) => {
        // Cloud renders cost money: resume the server job rather than starting another,
        // and only the author starts their own queued take.
        if (cloudSaver) {
          if (v.job) {
            if (now - v.updatedAt > STALE_JOB_MS || v.author.id === selfId) runGeneration(v.id, kindOf(v), v.job);
          } else if (v.status === "queued" && v.author.id === selfId) {
            runGeneration(v.id, kindOf(v));
          } else if (now - v.updatedAt > STALE_JOB_MS * 4) {
            patchVersion(v.id, { status: "failed", stage: undefined, error: "Render was interrupted. Retry to try again." });
          }
          return;
        }
        if (now - v.updatedAt > STALE_JOB_MS) runGeneration(v.id, kindOf(v));
      });
  }

  function connect(graph: ProjectGraph, cloud: boolean) {
    transport = createTransport(graph.id, cloud ? supabase : null);
    unsubscribe = transport.subscribe(handleMessage);
    const selfId = usePresence.getState().self.id;
    transport.send({ type: "hello", from: selfId });
    heartbeat = setInterval(() => {
      const p = usePresence.getState();
      transport?.send({ type: "presence", from: p.self.id, peer: p.selfPresence() });
      p.prunePeers();
    }, 2000);
    window.addEventListener("beforeunload", sayBye);
    resumeStaleJobs(graph);
  }

  return {
    graph: null,
    status: "idle",
    cloud: false,

    open: (projectId, options) => {
      get().close();
      const token = ++openToken;
      const cloud = !!options?.cloud;
      setCloudMode(cloud);
      if (!cloud) {
        const graph = loadGraph(projectId);
        if (!graph) {
          set({ graph: null, status: "not-found", cloud });
          return;
        }
        persist(graph);
        set({ graph, status: "ready", cloud });
        connect(graph, false);
        return;
      }
      set({ graph: null, status: "loading", cloud });
      loadCloudGraph(projectId).then((graph) => {
        if (token !== openToken) return; // closed or reopened meanwhile
        if (!graph) {
          set({ graph: null, status: "not-found" });
          return;
        }
        cloudSaver = createCloudSaver(projectId);
        set({ graph, status: "ready" });
        connect(graph, true);
      });
    },

    close: () => {
      openToken++;
      cloudSaver?.flushNow();
      cloudSaver = null;
      setCloudMode(false);
      sayBye();
      window.removeEventListener("beforeunload", sayBye);
      if (heartbeat) clearInterval(heartbeat);
      heartbeat = null;
      unsubscribe?.();
      unsubscribe = null;
      transport?.close();
      transport = null;
      jobs.forEach((c) => c.abort());
      jobs.clear();
      set({ graph: null, status: "idle", cloud: false });
      usePresence.setState({ peers: {}, selection: [], cursor: null });
    },

    createVersion: ({ parentId, target, title, prompt, settings, author }) => {
      const graph = get().graph;
      if (!graph?.versions[parentId]) return null;
      const id = shortHash();
      const now = Date.now();
      let branchId: string;
      let newBranch = null;
      if (target.kind === "new") {
        newBranch = makeBranch(graph, target.name, id, author);
        branchId = newBranch.id;
      } else {
        branchId = target.branchId;
      }
      const node: VersionNode = {
        id,
        number: nextVersionNumber(graph),
        title: title.trim() || `Version ${nextVersionNumber(graph)}`,
        parentIds: [parentId],
        branchId,
        prompt: prompt.trim(),
        settings,
        status: "queued",
        progress: 0,
        approved: false,
        comments: [],
        author,
        createdAt: now,
        updatedAt: now,
      };
      commit((g) => {
        const branches = { ...g.branches };
        if (newBranch) branches[newBranch.id] = newBranch;
        else branches[branchId] = { ...branches[branchId], headId: id, updatedAt: now };
        return { ...g, branches, versions: { ...g.versions, [id]: node } };
      });
      runGeneration(id, target.kind === "new" ? "branch" : "iterate");
      return id;
    },

    mergeVersions: ({ aId, bId, targetBranchId, title, prompt, settings, author }) => {
      const graph = get().graph;
      if (!graph?.versions[aId] || !graph.versions[bId] || !graph.branches[targetBranchId]) return null;
      const id = shortHash();
      const now = Date.now();
      const node: VersionNode = {
        id,
        number: nextVersionNumber(graph),
        title: title.trim() || "Combined",
        parentIds: [aId, bId],
        branchId: targetBranchId,
        prompt: prompt.trim(),
        settings,
        status: "queued",
        progress: 0,
        approved: false,
        comments: [],
        author,
        createdAt: now,
        updatedAt: now,
      };
      commit((g) => ({
        ...g,
        versions: { ...g.versions, [id]: node },
        branches: {
          ...g.branches,
          [targetBranchId]: { ...g.branches[targetBranchId], headId: id, updatedAt: now },
        },
      }));
      runGeneration(id, "merge");
      return id;
    },

    retryVersion: (id) => {
      const v = get().graph?.versions[id];
      if (v) runGeneration(id, v.parentIds.length > 1 ? "merge" : "iterate");
    },

    toggleApprove: (id, by) => {
      const v = get().graph?.versions[id];
      if (!v || v.status !== "ready") return;
      patchVersion(id, v.approved
        ? { approved: false, approvedBy: undefined, approvedAt: undefined }
        : { approved: true, approvedBy: by, approvedAt: Date.now() });
    },

    addComment: (id, text, by) => {
      const v = get().graph?.versions[id];
      if (!v || !text.trim()) return;
      patchVersion(id, {
        comments: [...v.comments, { id: shortHash(), author: by, text: text.trim(), createdAt: Date.now() }],
      });
    },

    markSynced: (id, by, sequence) => {
      patchVersion(id, { nle: { syncedAt: Date.now(), sequence, track: "V1", syncedBy: by } });
    },

    resetProject: () => {
      const graph = get().graph;
      if (!graph || get().cloud) return;
      jobs.forEach((c) => c.abort());
      jobs.clear();
      try {
        localStorage.removeItem(storageKey(graph.id));
      } catch {
        /* ignore */
      }
      const seeded = graph.id === DEMO_PROJECT_ID ? seedDemoGraph() : seedFromLegacyProject(graph.id);
      if (!seeded) return;
      // A newer epoch replaces every collaborator's copy instead of merging.
      const fresh = { ...seeded, epoch: Date.now() };
      set({ graph: fresh });
      persist(fresh);
      transport?.send({ type: "graph", from: usePresence.getState().self.id, graph: fresh });
      usePresence.setState({ selection: [] });
    },
  };
});

function sayBye() {
  const id = usePresence.getState().self.id;
  transport?.send({ type: "bye", from: id, id });
}

// Presence changes (cursor, selection) are broadcast immediately, throttled.
let lastPresenceSend = 0;
let pendingPresence: ReturnType<typeof setTimeout> | null = null;
usePresence.subscribe((state, prev) => {
  if (state.cursor === prev.cursor && state.selection === prev.selection && state.self === prev.self) return;
  const send = () => {
    lastPresenceSend = Date.now();
    pendingPresence = null;
    const p = usePresence.getState();
    transport?.send({ type: "presence", from: p.self.id, peer: p.selfPresence() });
  };
  const elapsed = Date.now() - lastPresenceSend;
  if (elapsed >= 40) send();
  else if (!pendingPresence) pendingPresence = setTimeout(send, 40 - elapsed);
});

// Ghost collaborators (Demo Mode) are broadcast like real peers.
export function broadcastPeer(peer: PeerPresence) {
  transport?.send({ type: "presence", from: peer.user.id, peer });
}

export function broadcastBye(id: string) {
  transport?.send({ type: "bye", from: id, id });
}
