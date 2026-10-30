import { toast } from "sonner";
import { useStudio, broadcastPeer, broadcastBye } from "@/app/studio/store/studioStore";
import { usePresence } from "@/app/studio/realtime/presence";
import type { CursorPosition, PeerPresence } from "@/app/studio/realtime/transport";
import { layoutGraph, nodeCenter } from "@/app/studio/lib/layout";
import { DEMO_TEAMMATE } from "@/app/studio/lib/graph";
import { loadDemoManifest } from "./demoMode";

// Scripted collaborator for Demo Mode. Drives the same store actions and
// presence channel a real teammate would, so the recording shows genuine
// multiplayer UI: a moving cursor, a selection ring, a comment, and a new
// branch rendering live.

const COMMENT = "Clean look is great — but the client wants a night vibe. Trying a neon take off this.";

let running: AbortController | null = null;

export function isGhostRunning() {
  return running !== null;
}

export function stopGhostTeammate() {
  running?.abort();
  running = null;
  usePresence.getState().removePeer(DEMO_TEAMMATE.id);
  broadcastBye(DEMO_TEAMMATE.id);
}

export function startGhostTeammate() {
  if (running) return;
  const controller = new AbortController();
  running = controller;
  script(controller.signal)
    .catch(() => {
      /* aborted */
    })
    .finally(() => {
      if (running === controller) running = null;
    });
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(new Error("aborted"));
    const t = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new Error("aborted"));
    });
  });
}

let peer: PeerPresence = { user: DEMO_TEAMMATE, cursor: null, selection: [], isGhost: true, lastSeen: 0 };
let lastBroadcast = 0;

function publish(patch: Partial<PeerPresence>, force = false) {
  peer = { ...peer, ...patch, lastSeen: Date.now() };
  usePresence.getState().upsertPeer(peer);
  if (force || Date.now() - lastBroadcast > 50) {
    lastBroadcast = Date.now();
    broadcastPeer(peer);
  }
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

async function glide(to: CursorPosition, ms: number, signal: AbortSignal) {
  const from = peer.cursor ?? { x: to.x - 400, y: to.y - 250 };
  // A slight arc reads as a human hand rather than a robot line.
  const bend = { x: (to.y - from.y) * 0.15, y: (from.x - to.x) * 0.15 };
  const start = performance.now();
  await new Promise<void>((resolve, reject) => {
    const frame = (now: number) => {
      if (signal.aborted) return reject(new Error("aborted"));
      const t = Math.min(1, (now - start) / ms);
      const e = ease(t);
      const arc = Math.sin(Math.PI * t);
      publish({
        cursor: {
          x: from.x + (to.x - from.x) * e + bend.x * arc,
          y: from.y + (to.y - from.y) * e + bend.y * arc,
        },
      });
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
  publish({}, true);
}

const graph = () => useStudio.getState().graph!;
const centerOf = (id: string) => nodeCenter(layoutGraph(graph())[id]);

async function script(signal: AbortSignal) {
  const g = graph();
  if (!g) return;
  // Build on the user's latest draft so the edge visibly runs from their
  // card to Maya's; fall back to the original if they haven't made one.
  const target =
    Object.values(g.versions)
      .filter((v) => v.status === "ready" && v.author.id !== DEMO_TEAMMATE.id)
      .sort((a, b) => b.createdAt - a.createdAt)[0] ??
    Object.values(g.versions).find((v) => v.parentIds.length === 0);
  if (!target) return;

  // Pick the preset the user hasn't already taken.
  const manifest = await loadDemoManifest();
  const takenTitles = new Set(Object.values(g.versions).map((v) => v.title));
  const preset =
    manifest.presets.find((p) => p.title === "Neon" && !takenTitles.has(p.title)) ??
    manifest.presets.find((p) => !takenTitles.has(p.title)) ??
    manifest.presets[manifest.presets.length - 1];

  const targetCenter = centerOf(target.id);
  peer = { ...peer, cursor: { x: targetCenter.x - 520, y: targetCenter.y - 300 }, selection: [] };
  publish({}, true);
  toast(`${DEMO_TEAMMATE.name} joined the project`, { description: "Art Director" });

  await sleep(900, signal);
  await glide({ x: targetCenter.x + 30, y: targetCenter.y + 10 }, 2200, signal);
  publish({ selection: [target.id] }, true);
  await sleep(1200, signal);

  useStudio.getState().addComment(target.id, COMMENT, DEMO_TEAMMATE);
  toast(`${DEMO_TEAMMATE.name} commented on ${target.title}`, { description: COMMENT });
  await sleep(2600, signal);

  const id = useStudio.getState().createVersion({
    parentId: target.id,
    target: { kind: "new", name: preset.title },
    title: preset.title,
    prompt: preset.prompt,
    settings: target.settings,
    author: DEMO_TEAMMATE,
  });
  if (!id) return;
  publish({ selection: [id] }, true);
  await sleep(150, signal);
  const c = centerOf(id);
  await glide({ x: c.x + 40, y: c.y + 20 }, 1400, signal);

  // Hover while it renders, with small idle movements.
  for (let i = 0; i < 40 && graph().versions[id]?.status !== "ready"; i++) {
    await glide({ x: c.x + 40 + Math.sin(i) * 18, y: c.y + 20 + Math.cos(i) * 12 }, 450, signal);
  }
  await sleep(600, signal);
  publish({ selection: [] }, true);

  // Idle presence: drift near their branch until stopped.
  for (let i = 0; !signal.aborted; i++) {
    const anchor = centerOf(id);
    await glide({ x: anchor.x + 160 + Math.sin(i * 0.9) * 60, y: anchor.y + 150 + Math.cos(i * 0.7) * 40 }, 1600, signal);
    await sleep(1200, signal);
  }
}
