// Core data model for the Studio canvas.
// A project is a commit graph: every video generation is a VersionNode,
// and branches are named pointers (heads) into that graph.

export type VersionStatus = "queued" | "generating" | "ready" | "failed";

export interface StudioSettings {
  model: string; // provider model key, e.g. "veo3"
  aspectRatio: "16:9" | "9:16" | "1:1";
  duration: number; // seconds
  style: string;
}

export interface Author {
  id: string;
  name: string;
  color: string;
}

export interface VersionComment {
  id: string;
  author: Author;
  text: string;
  createdAt: number;
}

export interface NleSync {
  syncedAt: number;
  sequence: string;
  track: string;
  syncedBy: Author;
}

export interface VersionNode {
  id: string; // short hash, e.g. "a3f9c1e"
  number: number; // v1, v2, ... in creation order
  title: string; // plain-language name shown on the canvas, e.g. "White studio"
  parentIds: string[]; // 0 = root, 1 = commit, 2 = merge commit
  branchId: string;
  prompt: string;
  settings: StudioSettings;
  status: VersionStatus;
  progress: number; // 0-100 while generating
  stage?: string; // human-readable generation stage
  error?: string;
  videoUrl?: string;
  posterUrl?: string;
  approved: boolean;
  approvedBy?: Author;
  approvedAt?: number;
  nle?: NleSync;
  comments: VersionComment[];
  author: Author;
  createdAt: number;
  updatedAt: number; // last-writer-wins key for realtime merges
}

export interface StudioBranch {
  id: string;
  name: string;
  color: string;
  lane: number; // vertical lane on the canvas, main = 0
  headId: string;
  createdBy: Author;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectGraph {
  id: string;
  title: string;
  client?: string;
  versions: Record<string, VersionNode>;
  branches: Record<string, StudioBranch>;
  updatedAt: number;
  epoch?: number; // bumped on reset; a higher epoch replaces instead of merging
}

export const BRANCH_COLORS = [
  "#6366f1", // main – indigo
  "#0ea5e9",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
];
