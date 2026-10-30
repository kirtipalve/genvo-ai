// Realtime transport abstraction. Today: BroadcastChannel, which syncs
// every tab of the same browser with no backend, so two windows side by
// side really are multiplayer. Later: a Liveblocks room that implements the
// same interface (room.broadcastEvent / room.subscribe("event")), selected
// in createTransport() when VITE_LIVEBLOCKS_PUBLIC_KEY is set.

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
  kind: "local" | "liveblocks";
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

export function createTransport(projectId: string): RealtimeTransport {
  return new BroadcastTransport(`genvo:studio:${projectId}`);
}
