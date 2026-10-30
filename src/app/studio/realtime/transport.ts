// Realtime transport abstraction. Local and demo projects use BroadcastChannel,
// which syncs every tab of the same browser with no backend. Cloud projects use
// a Supabase Realtime channel with the same interface.

import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type { Author, ProjectGraph } from "@/app/studio/types";

export interface CursorPosition {
  x: number; // flow coordinates, so cursors stay pinned to the canvas
  y: number;
}

export interface PeerPresence {
  user: Author;
  cursor: CursorPosition | null;
  selection: string[];
  isGhost?: boolean;
  lastSeen: number;
}

export type StudioMessage =
  | { type: "hello"; from: string }
  | { type: "graph"; from: string; graph: ProjectGraph }
  | { type: "presence"; from: string; peer: PeerPresence }
  | { type: "bye"; from: string; id: string };

export interface RealtimeTransport {
  kind: "local" | "cloud";
  send(msg: StudioMessage): void;
  subscribe(handler: (msg: StudioMessage) => void): () => void;
  close(): void;
}

class BroadcastTransport implements RealtimeTransport {
  kind = "local" as const;
  private channel: BroadcastChannel | null;
  private handlers = new Set<(msg: StudioMessage) => void>();

  constructor(room: string) {
    this.channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(room) : null;
    if (this.channel) {
      this.channel.onmessage = (e: MessageEvent<StudioMessage>) => {
        this.handlers.forEach((h) => h(e.data));
      };
    }
  }

  send(msg: StudioMessage) {
    this.channel?.postMessage(msg);
  }

  subscribe(handler: (msg: StudioMessage) => void) {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  close() {
    this.handlers.clear();
    this.channel?.close();
    this.channel = null;
  }
}

// Cloud projects: a Supabase Realtime broadcast channel per project, so
// collaborators on different machines share cursors and graph updates.
// Graph messages are coalesced (latest wins) so render progress stays cheap.
class SupabaseTransport implements RealtimeTransport {
  kind = "cloud" as const;
  private channel: RealtimeChannel;
  private handlers = new Set<(msg: StudioMessage) => void>();
  private queue: StudioMessage[] = [];
  private pendingGraph: StudioMessage | null = null;
  private graphTimer: ReturnType<typeof setTimeout> | null = null;
  private lastGraphSent = 0;
  private ready = false;

  constructor(client: SupabaseClient, projectId: string) {
    this.channel = client.channel(`project:${projectId}`, { config: { broadcast: { self: false } } });
    this.channel
      .on("broadcast", { event: "msg" }, ({ payload }) => {
        this.handlers.forEach((h) => h(payload as StudioMessage));
      })
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") return;
        this.ready = true;
        this.queue.splice(0).forEach((m) => this.post(m));
      });
  }

  private post(msg: StudioMessage) {
    if (!this.ready) {
      this.queue.push(msg);
      return;
    }
    void this.channel.send({ type: "broadcast", event: "msg", payload: msg });
  }

  send(msg: StudioMessage) {
    if (msg.type !== "graph") {
      this.post(msg);
      return;
    }
    this.pendingGraph = msg;
    if (this.graphTimer) return;
    const wait = Math.max(0, 250 - (Date.now() - this.lastGraphSent));
    this.graphTimer = setTimeout(() => {
      this.graphTimer = null;
      this.lastGraphSent = Date.now();
      if (this.pendingGraph) this.post(this.pendingGraph);
      this.pendingGraph = null;
    }, wait);
  }

  subscribe(handler: (msg: StudioMessage) => void) {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  close() {
    if (this.graphTimer) clearTimeout(this.graphTimer);
    if (this.pendingGraph && this.ready) void this.channel.send({ type: "broadcast", event: "msg", payload: this.pendingGraph });
    this.handlers.clear();
    void this.channel.unsubscribe();
  }
}

export function createTransport(projectId: string, cloud?: SupabaseClient | null): RealtimeTransport {
  if (cloud) return new SupabaseTransport(cloud, projectId);
  return new BroadcastTransport(`genvo:studio:${projectId}`);
}
