// Cloud projects in Supabase: the graph is stored one row per version/branch
// (graph_items), and every write keeps whichever copy of a row is newer.

import { supabase } from "@/app/lib/supabase";
import { BRANCH_COLORS, type Author, type ProjectGraph, type StudioBranch, type StudioSettings, type VersionNode } from "@/app/studio/types";
import { shortHash } from "@/app/studio/lib/graph";

export interface CloudProjectSummary {
  id: string;
  title: string;
  client: string | null;
  created_at: string;
}

interface GraphItemRow {
  kind: "version" | "branch";
  id: string;
  data: VersionNode | StudioBranch;
  updated_at: number;
}

function db() {
  if (!supabase) throw new Error("Cloud projects aren't configured.");
  return supabase;
}

export async function listProjects(): Promise<CloudProjectSummary[]> {
  const { data, error } = await db()
    .from("projects")
    .select("id, title, client, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// A first take the studio uploads as soon as the new project opens.
export interface PendingUpload {
  file: File;
  prompt: string;
  model: string;
}
const pendingUploads = new Map<string, PendingUpload>();
export function setPendingUpload(projectId: string, upload: PendingUpload) {
  pendingUploads.set(projectId, upload);
}
export function takePendingUpload(projectId: string): PendingUpload | undefined {
  const upload = pendingUploads.get(projectId);
  pendingUploads.delete(projectId);
  return upload;
}

// With a prompt, the first take starts queued and renders when the studio
// opens; without one the project starts empty (first take is an upload).
export async function createProject(input: {
  title: string;
  client?: string;
  prompt?: string;
  settings: StudioSettings;
  author: Author;
}): Promise<string> {
  const { data, error } = await db()
    .from("projects")
    .insert({ title: input.title.trim(), client: input.client?.trim() || null })
    .select("id")
    .single();
  if (error) throw error;
  if (!input.prompt?.trim()) return data.id;

  const now = Date.now();
  const rootId = shortHash();
  const main: StudioBranch = {
    id: "br-main",
    name: "main",
    color: BRANCH_COLORS[0],
    lane: 0,
    headId: rootId,
    createdBy: input.author,
    createdAt: now,
    updatedAt: now,
  };
  const root: VersionNode = {
    id: rootId,
    number: 1,
    title: "First take",
    parentIds: [],
    branchId: main.id,
    prompt: input.prompt!.trim(),
    settings: input.settings,
    status: "queued",
    progress: 0,
    approved: false,
    comments: [],
    author: input.author,
    createdAt: now,
    updatedAt: now,
  };
  await saveItems(data.id, [itemFor("branch", main), itemFor("version", root)]);
  return data.id;
}

export async function loadGraph(projectId: string): Promise<ProjectGraph | null> {
  const [{ data: project }, { data: rows, error }] = await Promise.all([
    db().from("projects").select("id, title, client").eq("id", projectId).maybeSingle(),
    db().from("graph_items").select("kind, id, data, updated_at").eq("project_id", projectId),
  ]);
  if (!project || error) return null;
  const graph: ProjectGraph = {
    id: project.id,
    title: project.title,
    client: project.client ?? undefined,
    versions: {},
    branches: {},
    updatedAt: 0,
  };
  for (const row of (rows ?? []) as GraphItemRow[]) {
    if (row.kind === "version") graph.versions[row.id] = row.data as VersionNode;
    else graph.branches[row.id] = row.data as StudioBranch;
    graph.updatedAt = Math.max(graph.updatedAt, row.updated_at);
  }
  return graph;
}

export async function inviteLink(projectId: string): Promise<string> {
  const { data, error } = await db().from("projects").select("invite_code").eq("id", projectId).single();
  if (error) throw error;
  return `${window.location.origin}/join/${data.invite_code}`;
}

export async function joinProject(code: string): Promise<string> {
  const { data, error } = await db().rpc("join_project", { code });
  if (error) throw error;
  return data as string;
}

function itemFor(kind: "version" | "branch", data: VersionNode | StudioBranch) {
  return { kind, id: data.id, data, updated_at: data.updatedAt };
}

async function saveItems(projectId: string, items: ReturnType<typeof itemFor>[]) {
  if (items.length === 0) return;
  const { error } = await db().rpc("save_graph_items", { p: projectId, items });
  if (error) throw error;
}

// Batches graph writes: rows that changed since the last commit are queued and
// flushed at most once per interval, so render progress doesn't flood the DB.
export function createCloudSaver(projectId: string, intervalMs = 800) {
  const pending = new Map<string, ReturnType<typeof itemFor>>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = async () => {
    timer = null;
    const items = [...pending.values()];
    pending.clear();
    try {
      await saveItems(projectId, items);
    } catch (err) {
      console.error("Saving to the cloud failed", err);
      // Requeue unless a newer copy arrived meanwhile.
      items.forEach((it) => {
        const key = `${it.kind}:${it.id}`;
        if (!pending.has(key)) pending.set(key, it);
      });
      if (!timer) timer = setTimeout(flush, intervalMs * 4);
    }
  };

  return {
    save(prev: ProjectGraph | null, next: ProjectGraph) {
      for (const v of Object.values(next.versions)) {
        if (prev?.versions[v.id]?.updatedAt !== v.updatedAt) pending.set(`version:${v.id}`, itemFor("version", v));
      }
      for (const b of Object.values(next.branches)) {
        if (prev?.branches[b.id]?.updatedAt !== b.updatedAt) pending.set(`branch:${b.id}`, itemFor("branch", b));
      }
      if (pending.size > 0 && !timer) timer = setTimeout(flush, intervalMs);
    },
    flushNow() {
      if (timer) clearTimeout(timer);
      if (pending.size > 0) void flush();
    },
  };
}
