// Server-side video generation for cloud projects.
//   POST /api/generate            start a render  → { model, requestId } or { mode: "demo" }
//   GET  /api/generate?model&id   check a render  → { status: queued | running | done | failed, videoUrl? }
// The fal.ai key (FAL_KEY) never reaches the browser. Callers must send their
// Supabase access token; each POST spends one of the user's daily renders.

import { fal } from "@fal-ai/client";

// Keep in sync with VIDEO_MODELS in src/app/services/videoGeneration.ts.
const MODELS: Record<string, string> = {
  veo3: "fal-ai/veo3/fast",
  mochi: "fal-ai/mochi-v1",
  minimax: "fal-ai/minimax/video-01-live",
  hunyuan: "fal-ai/hunyuan-video",
};

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function supabaseAs(token: string, path: string, init: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: { apikey: SUPABASE_KEY ?? "", Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
}

// Returns the caller's token if Supabase accepts it.
async function authorize(request: Request): Promise<string | null> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || !SUPABASE_URL || !SUPABASE_KEY) return null;
  const res = await supabaseAs(token, "/auth/v1/user");
  return res.ok ? token : null;
}

function modelInput(model: string, prompt: string, aspectRatio?: string) {
  if (model === "veo3") {
    return {
      prompt,
      aspect_ratio: aspectRatio === "9:16" ? "9:16" : "16:9",
      duration: "8s",
      resolution: "720p",
      generate_audio: true,
    };
  }
  return { prompt, enable_prompt_expansion: true };
}

export async function POST(request: Request) {
  const token = await authorize(request);
  if (!token) return json({ error: "Sign in to render." }, 401);

  const body = (await request.json().catch(() => null)) as
    | { prompt?: unknown; settings?: { model?: string; aspectRatio?: string } }
    | null;
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim().slice(0, 2000) : "";
  if (!prompt) return json({ error: "Describe the shot first." }, 400);

  // No model provider configured yet: the client falls back to demo clips.
  if (!process.env.FAL_KEY) return json({ mode: "demo" });

  const model = body?.settings?.model && body.settings.model in MODELS ? body.settings.model : "veo3";
  const allowed = await supabaseAs(token, "/rest/v1/rpc/consume_generation", { method: "POST", body: "{}" })
    .then((r) => (r.ok ? r.json() : false))
    .catch(() => false);
  if (allowed !== true) {
    return json({ error: "You've used today's renders. They reset at midnight UTC." }, 429);
  }

  fal.config({ credentials: process.env.FAL_KEY });
  try {
    const { request_id } = await fal.queue.submit(MODELS[model], {
      // Inputs vary per model; fal's typed inputs are a union too narrow for this.
      input: modelInput(model, prompt, body?.settings?.aspectRatio) as never,
    });
    return json({ model, requestId: request_id });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Couldn't start the render." }, 502);
  }
}

export async function GET(request: Request) {
  const token = await authorize(request);
  if (!token) return json({ error: "Sign in to render." }, 401);

  const url = new URL(request.url);
  const model = url.searchParams.get("model") ?? "";
  const requestId = url.searchParams.get("id") ?? "";
  if (!(model in MODELS) || !requestId) return json({ error: "Unknown render." }, 400);
  if (!process.env.FAL_KEY) return json({ status: "failed", error: "Rendering isn't configured." });

  fal.config({ credentials: process.env.FAL_KEY });
  try {
    const status = await fal.queue.status(MODELS[model], { requestId });
    if (status.status === "IN_QUEUE") return json({ status: "queued" });
    if (status.status === "IN_PROGRESS") return json({ status: "running" });
    const result = await fal.queue.result(MODELS[model], { requestId });
    const videoUrl = (result.data as { video?: { url?: string } })?.video?.url;
    return videoUrl ? json({ status: "done", videoUrl }) : json({ status: "failed", error: "No video was returned." });
  } catch (err) {
    return json({ status: "failed", error: err instanceof Error ? err.message : "Render failed." });
  }
}
