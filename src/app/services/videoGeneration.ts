// Video generation service using fal.ai
import { fal } from "@fal-ai/client";

// API Provider types
export type ApiProvider = "fal";

// Configure fal.ai client
export function configureFal(apiKey?: string) {
  if (apiKey) {
    fal.config({ credentials: apiKey });
  }
}

// Get API key from environment or localStorage
export function getApiKey(): string | null {
  if (typeof window !== "undefined") {
    const envKey = import.meta.env.VITE_FAL_API_KEY;
    if (envKey) return envKey;
    return localStorage.getItem("fal_api_key");
  }
  return null;
}

// Check if API key is configured
export function isApiKeyConfigured(): boolean {
  return !!getApiKey();
}

// Save API key to localStorage
export function saveApiKey(key: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("fal_api_key", key);
    configureFal(key);
  }
}

// Clear API key
export function clearApiKey(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("fal_api_key");
  }
}

// Available video generation models
export const VIDEO_MODELS = {
  veo3: {
    id: "fal-ai/veo3/fast",
    name: "Veo 3",
    description: "Google's latest video model",
    costPerVideo: "~$0.50",
    provider: "fal" as ApiProvider,
  },
  mochi: {
    id: "fal-ai/mochi-v1",
    name: "Mochi v1",
    description: "Open-source, high-fidelity motion",
    costPerVideo: "~$0.10",
    provider: "fal" as ApiProvider,
  },
  minimax: {
    id: "fal-ai/minimax/video-01-live",
    name: "MiniMax Video",
    description: "Fast, commercial-ready",
    costPerVideo: "~$0.50",
    provider: "fal" as ApiProvider,
  },
  hunyuan: {
    id: "fal-ai/hunyuan-video",
    name: "Hunyuan Video",
    description: "High visual quality",
    costPerVideo: "~$0.20",
    provider: "fal" as ApiProvider,
  },
} as const;

export type VideoModelKey = keyof typeof VIDEO_MODELS;

// Generation options
export interface GenerationOptions {
  prompt: string;
  model?: VideoModelKey;
  negativePrompt?: string;
  seed?: number;
  onProgress?: (status: string, logs?: string[]) => void;
}

// Generation result
export interface GenerationResult {
  videoUrl: string;
  seed?: number;
}

// Build input based on model type
function buildModelInput(
  model: VideoModelKey,
  prompt: string,
  negativePrompt?: string,
  seed?: number
): Record<string, unknown> {
  // Veo 3 has different input schema
  if (model === "veo3") {
    return {
      prompt,
      aspect_ratio: "16:9",
      duration: "8s",
      resolution: "720p",
      generate_audio: true,
      ...(negativePrompt && { negative_prompt: negativePrompt }),
      ...(seed !== undefined && { seed }),
    };
  }

  // Default input for other models (Mochi, MiniMax, Hunyuan)
  return {
    prompt,
    negative_prompt: negativePrompt || "",
    ...(seed !== undefined && { seed }),
    enable_prompt_expansion: true,
  };
}

// Generate video using fal.ai
async function generateWithFal(
  prompt: string,
  model: VideoModelKey,
  negativePrompt?: string,
  seed?: number,
  onProgress?: (status: string, logs?: string[]) => void
): Promise<GenerationResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("fal.ai API key not configured. Add your key in Settings.");
  }

  configureFal(apiKey);
  const modelConfig = VIDEO_MODELS[model];

  onProgress?.("Starting fal.ai generation...");
  const input = buildModelInput(model, prompt, negativePrompt, seed);

  const result = await fal.subscribe(modelConfig.id, {
    input,
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_QUEUE") {
        onProgress?.("Waiting in queue...");
      } else if (update.status === "IN_PROGRESS") {
        const logs = update.logs?.map((log) => log.message) || [];
        onProgress?.("Generating video...", logs);
      }
    },
  });

  const videoUrl = (result.data as { video?: { url?: string } })?.video?.url;
  if (!videoUrl) {
    throw new Error("No video URL returned from fal.ai");
  }

  return {
    videoUrl,
    seed: (result.data as { seed?: number })?.seed,
  };
}

// Main generate function
export async function generateVideo(
  options: GenerationOptions
): Promise<GenerationResult> {
  const { prompt, model = "veo3", negativePrompt, seed, onProgress } = options;

  try {
    onProgress?.("Starting generation...");
    return await generateWithFal(prompt, model, negativePrompt, seed, onProgress);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        throw new Error("Invalid API key. Please check your fal.ai API key.");
      }
      if (error.message.includes("402") || error.message.includes("Payment")) {
        throw new Error("Insufficient fal.ai credits.");
      }
      throw error;
    }
    throw new Error("Unknown error during video generation");
  }
}

// Simulate generation for demo mode (when no API key)
export async function simulateGeneration(
  onProgress: (progress: number, status: string) => void
): Promise<GenerationResult> {
  const steps = [
    { progress: 10, status: "Analyzing prompt..." },
    { progress: 30, status: "Preparing generation..." },
    { progress: 50, status: "Generating frames..." },
    { progress: 70, status: "Processing video..." },
    { progress: 90, status: "Finalizing..." },
    { progress: 100, status: "Complete!" },
  ];

  for (const step of steps) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    onProgress(step.progress, step.status);
  }

  // Return a placeholder
  return {
    videoUrl: "/videos/placeholder.mp4",
  };
}
