import { create } from "zustand";

// Demo Mode swaps live providers for pre-cached clips and enables the
// scripted teammate, so a screen recording never waits on API latency.
// Enable via the top-bar switch, ⌘⇧D, or `?demo=1` in the URL.

const KEY = "genvo_demo_mode";

function readInitial(): boolean {
  try {
    const param = new URLSearchParams(window.location.search).get("demo");
    if (param === "1" || param === "true") {
      localStorage.setItem(KEY, "1");
      return true;
    }
    if (param === "0" || param === "false") {
      localStorage.setItem(KEY, "0");
      return false;
    }
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

interface DemoModeState {
  enabled: boolean;
  autoTeammate: boolean; // ghost teammate joins after your first branch
  setEnabled: (enabled: boolean) => void;
  toggle: () => void;
  setAutoTeammate: (on: boolean) => void;
}

export const useDemoMode = create<DemoModeState>((set, get) => ({
  enabled: readInitial(),
  autoTeammate: true,
  setEnabled: (enabled) => {
    try {
      localStorage.setItem(KEY, enabled ? "1" : "0");
    } catch {
      /* storage unavailable */
    }
    set({ enabled });
  },
  toggle: () => get().setEnabled(!get().enabled),
  setAutoTeammate: (autoTeammate) => set({ autoTeammate }),
}));

export function isDemoMode(): boolean {
  return useDemoMode.getState().enabled;
}

// ---- Manifest of pre-cached assets in /public/demo-assets ----

export interface DemoClip {
  id: string;
  src: string;
  poster: string;
  durationSec: number;
  matchAll: string[][]; // clip matches if every keyword of any group is in the prompt
  kinds?: string[]; // generation kinds this clip is the default for
}

export interface DemoPreset {
  title: string; // version title, e.g. "White studio"
  change: string; // what the user "types" into Try a variation
  prompt: string; // full prompt used for the render
}

export interface DemoManifest {
  clips: DemoClip[];
  fallback: string;
  presets: DemoPreset[];
}

let manifestPromise: Promise<DemoManifest> | null = null;

export function loadDemoManifest(): Promise<DemoManifest> {
  if (!manifestPromise) {
    manifestPromise = fetch("/demo-assets/manifest.json", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`manifest ${r.status}`);
        return r.json() as Promise<DemoManifest>;
      })
      .catch((err) => {
        manifestPromise = null;
        throw err;
      });
  }
  return manifestPromise;
}

export function pickDemoClip(manifest: DemoManifest, prompt: string, kind?: string): DemoClip {
  const text = prompt.toLowerCase();
  const byKeywords = manifest.clips.find((clip) =>
    clip.matchAll.some((group) => group.length > 0 && group.every((kw) => text.includes(kw)))
  );
  if (byKeywords) return byKeywords;
  const byKind = kind ? manifest.clips.find((c) => c.kinds?.includes(kind)) : undefined;
  if (byKind) return byKind;
  return manifest.clips.find((c) => c.id === manifest.fallback) ?? manifest.clips[0];
}
