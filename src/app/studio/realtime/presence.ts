import { create } from "zustand";
import type { Author } from "@/app/studio/types";
import type { CursorPosition, PeerPresence } from "./transport";

const IDENTITY_KEY = "genvo_identity";
const DEFAULT_NAME = "Kirti"; // rename any tab from its avatar in the top bar
const COLORS = ["#0ea5e9", "#f97316", "#22c55e", "#a855f7", "#eab308", "#ef4444", "#14b8a6"];

// One identity per tab (sessionStorage), so two windows = two collaborators.
function loadIdentity(): Author {
  try {
    const saved = sessionStorage.getItem(IDENTITY_KEY);
    if (saved) return JSON.parse(saved) as Author;
  } catch {
    /* fall through */
  }
  const identity: Author = {
    id: `u-${Math.random().toString(36).slice(2, 9)}`,
    name: DEFAULT_NAME,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
  saveIdentity(identity);
  return identity;
}

function saveIdentity(identity: Author) {
  try {
    sessionStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  } catch {
    /* storage unavailable */
  }
}

export const PEER_TIMEOUT_MS = 8000;

interface PresenceState {
  self: Author;
  cursor: CursorPosition | null;
  selection: string[];
  peers: Record<string, PeerPresence>;
  renameSelf: (name: string) => void;
  setCursor: (cursor: CursorPosition | null) => void;
  setSelection: (selection: string[]) => void;
  upsertPeer: (peer: PeerPresence) => void;
  removePeer: (id: string) => void;
  prunePeers: () => void;
  selfPresence: () => PeerPresence;
}

export const usePresence = create<PresenceState>((set, get) => ({
  self: loadIdentity(),
  cursor: null,
  selection: [],
  peers: {},
  renameSelf: (name) => {
    const self = { ...get().self, name: name.trim() || get().self.name };
    saveIdentity(self);
    set({ self });
  },
  setCursor: (cursor) => set({ cursor }),
  setSelection: (selection) => set({ selection }),
  upsertPeer: (peer) => {
    if (peer.user.id === get().self.id) return;
    set((s) => ({ peers: { ...s.peers, [peer.user.id]: peer } }));
  },
  removePeer: (id) =>
    set((s) => {
      const peers = { ...s.peers };
      delete peers[id];
      return { peers };
    }),
  prunePeers: () => {
    const now = Date.now();
    const peers = get().peers;
    const stale = Object.values(peers).filter((p) => now - p.lastSeen > PEER_TIMEOUT_MS);
    if (stale.length === 0) return;
    const next = { ...peers };
    stale.forEach((p) => delete next[p.user.id]);
    set({ peers: next });
  },
  selfPresence: () => {
    const { self, cursor, selection } = get();
    return { user: self, cursor, selection, lastSeen: Date.now() };
  },
}));
