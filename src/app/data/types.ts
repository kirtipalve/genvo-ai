// Core types for Genvo - GitHub for AI Video

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "owner" | "admin" | "editor" | "viewer";
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  avatar?: string;
  members: TeamMember[];
  createdAt: string;
}

export interface TeamMember {
  userId: string;
  user: User;
  role: "owner" | "admin" | "editor" | "viewer";
  joinedAt: string;
}

export interface Comment {
  id: string;
  projectId: string;
  versionId?: string;
  branchId?: string;
  parentId?: string; // For replies
  author: User;
  content: string;
  timestamp: number; // Video timestamp in seconds (optional)
  createdAt: string;
  updatedAt: string;
  reactions: Reaction[];
  resolved?: boolean;
}

export interface Reaction {
  emoji: string;
  users: string[]; // user IDs
}

export interface Activity {
  id: string;
  projectId: string;
  type: ActivityType;
  actor: User;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export type ActivityType =
  | "project_created"
  | "version_generated"
  | "branch_created"
  | "branch_merged"
  | "comment_added"
  | "collaborator_added"
  | "project_forked"
  | "project_published"
  | "settings_changed";

export interface Asset {
  id: string;
  projectId: string;
  name: string;
  type: "image" | "video" | "audio";
  url: string;
  thumbnailUrl?: string;
  size: number;
  dimensions?: { width: number; height: number };
  duration?: number;
  uploadedBy: User;
  createdAt: string;
  tags: string[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  prompt: string;
  settings: GenerationSettings;
  tags: string[];
  usageCount: number;
  author: User;
  createdAt: string;
}

export interface GenerationSettings {
  duration: number;
  aspectRatio: "16:9" | "9:16" | "1:1";
  style: string;
  model: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "generating" | "completed" | "failed";
  isPublic: boolean;
  forks: number;
  views: number;
  stars: number;
  author: User;
  collaborators: TeamMember[];
  versions: Version[];
  prompt: string;
  settings: GenerationSettings;
  tags: string[];
  forkedFrom?: { projectId: string; projectTitle: string; author: User };
}

export interface Version {
  id: string;
  versionNumber: number;
  prompt: string;
  createdAt: string;
  videoUrl: string;
  thumbnail: string;
  settings: GenerationSettings;
  parentVersionId?: string;
  branchId?: string;
  commitMessage?: string;
  generationTime?: number; // in seconds
  seed?: number;
}

export interface Branch {
  id: string;
  name: string;
  projectId: string;
  baseVersionId: string;
  createdAt: string;
  updatedAt: string;
  author: User;
  prompt: string;
  settings: GenerationSettings;
  status: "draft" | "generating" | "completed";
  thumbnail?: string;
  videoUrl?: string;
  description?: string;
  isProtected?: boolean;
}

export interface MergeRequest {
  id: string;
  projectId: string;
  sourceBranchId: string;
  targetBranchId: string;
  title: string;
  description: string;
  author: User;
  status: "open" | "merged" | "closed";
  createdAt: string;
  updatedAt: string;
  mergedAt?: string;
  mergedBy?: User;
  reviewers: User[];
  approvals: string[]; // user IDs
  comments: Comment[];
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export type NotificationType =
  | "mention"
  | "comment"
  | "merge_request"
  | "generation_complete"
  | "collaborator_invite"
  | "fork";

export interface SearchResult {
  type: "project" | "version" | "branch" | "comment" | "user";
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  score: number;
  highlights: string[];
}

// Frame comparison
export interface FrameMarker {
  id: string;
  timestamp: number;
  label: string;
  color: string;
}

export interface ComparisonSession {
  id: string;
  versionAId: string;
  versionBId: string;
  markers: FrameMarker[];
  syncPlayback: boolean;
  createdAt: string;
}
