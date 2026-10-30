// Project media in the private Supabase `media` bucket. Versions store the
// storage paths (`media`); videoUrl/posterUrl are short-lived signed links
// re-created whenever a project is opened.

import { supabase } from "@/app/lib/supabase";
import type { ProjectGraph, VersionMedia } from "@/app/studio/types";

const BUCKET = "media";
const LINK_TTL_SEC = 12 * 60 * 60;
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // Supabase free-plan file limit

function storage() {
  if (!supabase) throw new Error("Storage isn't configured.");
  return supabase.storage.from(BUCKET);
}

function extensionFor(type: string, fallback: string) {
  if (type === "video/quicktime") return "mov";
  if (type === "video/webm") return "webm";
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  return fallback;
}

export async function uploadMedia(projectId: string, file: Blob, fallbackExt = "mp4"): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Files can be up to 50 MB.");
  const path = `${projectId}/${crypto.randomUUID()}.${extensionFor(file.type, fallbackExt)}`;
  const { error } = await storage().upload(path, file, { contentType: file.type || "video/mp4", upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

export async function signedUrls(paths: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(paths)];
  if (unique.length === 0) return {};
  const { data, error } = await storage().createSignedUrls(unique, LINK_TTL_SEC);
  if (error) throw new Error(error.message);
  const out: Record<string, string> = {};
  data?.forEach((d) => {
    if (d.path && d.signedUrl) out[d.path] = d.signedUrl;
  });
  return out;
}

// Fill videoUrl/posterUrl from storage paths (fresh links on every open).
export async function resolveMediaLinks(graph: ProjectGraph): Promise<ProjectGraph> {
  const paths = Object.values(graph.versions).flatMap((v) => (v.media ? [v.media.video, v.media.poster ?? ""] : []));
  const links = await signedUrls(paths.filter(Boolean)).catch(() => ({} as Record<string, string>));
  const versions = { ...graph.versions };
  for (const v of Object.values(versions)) {
    if (!v.media) continue;
    versions[v.id] = {
      ...v,
      videoUrl: links[v.media.video] ?? v.videoUrl,
      posterUrl: (v.media.poster && links[v.media.poster]) || v.posterUrl,
    };
  }
  return { ...graph, versions };
}

// Duration and a first-frame JPEG, read in the browser.
export function probeVideo(src: Blob | string): Promise<{ duration: number; width: number; height: number; poster: Blob | null }> {
  return new Promise((resolve, reject) => {
    const url = typeof src === "string" ? src : URL.createObjectURL(src);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    const done = (fn: () => void) => {
      if (typeof src !== "string") URL.revokeObjectURL(url);
      fn();
    };
    video.onerror = () => done(() => reject(new Error("This file isn't a video the browser can read.")));
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(0.5, (video.duration || 1) / 4);
    };
    video.onseeked = () => {
      const { videoWidth: width, videoHeight: height, duration } = video;
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 640 / (width || 640));
      canvas.width = Math.round((width || 640) * scale);
      canvas.height = Math.round((height || 360) * scale);
      try {
        canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((poster) => done(() => resolve({ duration, width, height, poster })), "image/jpeg", 0.82);
      } catch {
        done(() => resolve({ duration, width, height, poster: null })); // cross-origin frame
      }
    };
    video.src = url;
  });
}

// Upload a clip plus its poster and return media paths and display links.
export async function storeClip(projectId: string, clip: Blob) {
  const meta = await probeVideo(clip);
  const video = await uploadMedia(projectId, clip);
  const poster = meta.poster ? await uploadMedia(projectId, meta.poster, "jpg") : undefined;
  const media: VersionMedia = { video, poster, width: meta.width, height: meta.height };
  const links = await signedUrls([video, poster ?? ""].filter(Boolean));
  return { media, duration: meta.duration, videoUrl: links[video], posterUrl: poster ? links[poster] : undefined };
}
