import { create } from "zustand";

// Local-only UI state (never synced to collaborators).

type Pair = [string, string];

interface StudioUIState {
  compare: Pair | null;
  merge: Pair | null;
  comparePick: string | null; // "Compare" clicked on this version; waiting for a second pick
  nleOpen: boolean;
  upload: { file: File | null } | null; // "Upload a take" dialog
  focusRequest: { id: string; at: number } | null;
  variationFocus: number; // bumps to focus the "Try a variation" input
  openCompare: (pair: Pair) => void;
  openMerge: (pair: Pair) => void;
  closeDialogs: () => void;
  setComparePick: (id: string | null) => void;
  setNleOpen: (open: boolean) => void;
  openUpload: (file?: File | null) => void;
  focusNode: (id: string) => void;
  focusVariationInput: () => void;
}

export const useStudioUI = create<StudioUIState>((set) => ({
  compare: null,
  merge: null,
  comparePick: null,
  nleOpen: false,
  upload: null,
  focusRequest: null,
  variationFocus: 0,
  openCompare: (compare) => set({ compare, merge: null, comparePick: null }),
  openMerge: (merge) => set({ merge, compare: null, comparePick: null }),
  closeDialogs: () => set({ compare: null, merge: null, upload: null }),
  setComparePick: (comparePick) => set({ comparePick }),
  setNleOpen: (nleOpen) => set({ nleOpen }),
  openUpload: (file = null) => set({ upload: { file }, compare: null, merge: null, comparePick: null }),
  focusNode: (id) => set({ focusRequest: { id, at: Date.now() } }),
  focusVariationInput: () => set({ variationFocus: Date.now() }),
}));
