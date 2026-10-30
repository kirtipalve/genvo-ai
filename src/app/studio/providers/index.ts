// Model-agnostic generation layer. Every backend (fal.ai today, Runway,
// Luma, Kling or a self-hosted model later) implements VideoProvider, and
// the store never knows which one produced a clip.

import { fal } from "@fal-ai/client";
import { VIDEO_MODELS, getApiKey, type VideoModelKey } from "@/app/services/videoGeneration";
import { isDemoMode, loadDemoManifest, pickDemoClip } from "@/app/studio/demo/demoMode";
import type { StudioSettings } from "@/app/studio/types";

export type GenerationKind = "root" | "iterate" | "branch" | "merge";

export interface GenerationRequest {
  prompt: string;
  settings: StudioSettings;
  kind: GenerationKind;
  signal?: AbortSignal;
}

export interface GenerationProgress {
  progress: number; // 0-100
  stage: string;
}

export interface GenerationOutput {
  videoUrl: string;
  posterUrl?: string;
  durationSec?: number;
}

export interface VideoProvider {
  id: string;
  label: string;
  generate(
    req: GenerationRequest,
    onProgress: (p: GenerationProgress) => void
  ): Promise<GenerationOutput>;
}

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

// ---- Demo: instant, deterministic, pre-cached clips ----

const DEMO_STAGES: Array<{ stage: string; to: number; ms: number }> = [
  { stage: "Analyzing prompt", to: 12, ms: 350 },
  { stage: "Loading model", to: 30, ms: 450 },
  { stage: "Generating frames", to: 78, ms: 1100 },
  { stage: "Rendering", to: 94, ms: 450 },
  { stage: "Finalizing", to: 100, ms: 250 },
];

export const demoProvider: VideoProvider = {
  id: "demo",
  label: "Demo (cached)",
  async generate(req, onProgress) {
    const manifest = await loadDemoManifest();
    const clip = pickDemoClip(manifest, req.prompt, req.kind);
    let from = 0;
    for (const s of DEMO_STAGES) {
      const steps = 6;
      for (let i = 1; i <= steps; i++) {
        await wait(s.ms / steps, req.signal);
        onProgress({ stage: s.stage, progress: Math.round(from + ((s.to - from) * i) / steps) });
      }
      from = s.to;
    }
    return { videoUrl: clip.src, posterUrl: clip.poster, durationSec: clip.durationSec };
  },
};

// ---- fal.ai: live generation ----

export const falProvider: VideoProvider = {
  id: "fal",
  label: "fal.ai",
  async generate(req, onProgress) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("No fal.ai key configured. Add one in Settings or turn on Demo Mode.");
    }
    fal.config({ credentials: apiKey });

    const modelKey = (req.settings.model in VIDEO_MODELS ? req.settings.model : "veo3") as VideoModelKey;
    const input: Record<string, unknown> =
      modelKey === "veo3"
        ? {
            prompt: req.prompt,
            aspect_ratio: req.settings.aspectRatio,
            duration: "8s",
            resolution: "720p",
            generate_audio: true,
          }
        : { prompt: req.prompt, enable_prompt_expansion: true };

    // fal reports queue state but not percent, so progress creeps toward 90%.
    let progress = 2;
    onProgress({ progress, stage: "Queued" });
    const creep = setInterval(() => {
      progress = Math.min(90, progress + (90 - progress) * 0.04);
      onProgress({ progress: Math.round(progress), stage: "Generating frames" });
    }, 1000);

    try {
      const result = await fal.subscribe(VIDEO_MODELS[modelKey].id, {
        // Inputs vary per model; the union of fal's typed inputs is too narrow here.
        input: input as never,
        logs: true,
        abortSignal: req.signal,
        onQueueUpdate: (update) => {
          if (update.status === "IN_QUEUE") onProgress({ progress: Math.round(progress), stage: "Waiting in queue" });
        },
      });
      const videoUrl = (result.data as { video?: { url?: string } })?.video?.url;
      if (!videoUrl) throw new Error("No video URL returned from fal.ai");
      onProgress({ progress: 100, stage: "Finalizing" });
      return { videoUrl };
    } finally {
      clearInterval(creep);
    }
  },
};

export function getProvider(): VideoProvider {
  return isDemoMode() ? demoProvider : falProvider;
}

export const MODEL_OPTIONS = Object.entries(VIDEO_MODELS).map(([key, m]) => ({
  key,
  name: m.name,
  cost: m.costPerVideo,
}));

export function modelName(key: string): string {
  return MODEL_OPTIONS.find((m) => m.key === key)?.name ?? key;
}
