// Collaboration service for comments, activities, and team management
import type {
  Comment,
  Activity,
  ActivityType,
  User,
  TeamMember,
  Notification,
  Asset,
  MergeRequest,
} from "./types";

const STORAGE_KEYS = {
  COMMENTS: "genvo_comments",
  ACTIVITIES: "genvo_activities",
  NOTIFICATIONS: "genvo_notifications",
  ASSETS: "genvo_assets",
  MERGE_REQUESTS: "genvo_merge_requests",
  CURRENT_USER: "genvo_current_user",
};

// Generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Current user (mock for now)
export function getCurrentUser(): User {
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (stored) {
    return JSON.parse(stored);
  }

  const defaultUser: User = {
    id: "user-1",
    name: "You",
    email: "you@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
    role: "owner",
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
  return defaultUser;
}

// Mock team members
export function getMockCollaborators(): TeamMember[] {
  return [
    {
      userId: "user-2",
      user: {
        id: "user-2",
        name: "Sarah Chen",
        email: "sarah@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        role: "editor",
        createdAt: "2024-01-01T00:00:00Z",
      },
      role: "editor",
      joinedAt: "2024-01-10T00:00:00Z",
    },
    {
      userId: "user-3",
      user: {
        id: "user-3",
        name: "John Park",
        email: "john@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        role: "editor",
        createdAt: "2024-01-01T00:00:00Z",
      },
      role: "editor",
      joinedAt: "2024-01-12T00:00:00Z",
    },
    {
      userId: "user-4",
      user: {
        id: "user-4",
        name: "Alex Rivera",
        email: "alex@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
        role: "viewer",
        createdAt: "2024-01-01T00:00:00Z",
      },
      role: "viewer",
      joinedAt: "2024-01-15T00:00:00Z",
    },
  ];
}

// ============ COMMENTS ============

export function getComments(): Comment[] {
  const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
  return data ? JSON.parse(data) : [];
}

export function getCommentsByProject(projectId: string): Comment[] {
  return getComments().filter((c) => c.projectId === projectId);
}

export function getCommentsByVersion(projectId: string, versionId: string): Comment[] {
  return getComments().filter(
    (c) => c.projectId === projectId && c.versionId === versionId
  );
}

export function addComment(
  projectId: string,
  content: string,
  options: {
    versionId?: string;
    branchId?: string;
    parentId?: string;
    timestamp?: number;
  } = {}
): Comment {
  const comments = getComments();
  const user = getCurrentUser();

  const newComment: Comment = {
    id: generateId(),
    projectId,
    versionId: options.versionId,
    branchId: options.branchId,
    parentId: options.parentId,
    author: user,
    content,
    timestamp: options.timestamp,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reactions: [],
    resolved: false,
  };

  comments.push(newComment);
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));

  // Log activity
  logActivity(projectId, "comment_added", {
    commentId: newComment.id,
    content: content.slice(0, 100),
    versionId: options.versionId,
  });

  return newComment;
}

export function updateComment(commentId: string, content: string): Comment | null {
  const comments = getComments();
  const index = comments.findIndex((c) => c.id === commentId);

  if (index === -1) return null;

  comments[index] = {
    ...comments[index],
    content,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  return comments[index];
}

export function deleteComment(commentId: string): boolean {
  const comments = getComments();
  const filtered = comments.filter((c) => c.id !== commentId);

  if (filtered.length === comments.length) return false;

  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(filtered));
  return true;
}

export function resolveComment(commentId: string, resolved: boolean): Comment | null {
  const comments = getComments();
  const index = comments.findIndex((c) => c.id === commentId);

  if (index === -1) return null;

  comments[index].resolved = resolved;
  comments[index].updatedAt = new Date().toISOString();

  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  return comments[index];
}

export function addReaction(commentId: string, emoji: string): Comment | null {
  const comments = getComments();
  const index = comments.findIndex((c) => c.id === commentId);
  const user = getCurrentUser();

  if (index === -1) return null;

  const comment = comments[index];
  const reactionIndex = comment.reactions.findIndex((r) => r.emoji === emoji);

  if (reactionIndex === -1) {
    comment.reactions.push({ emoji, users: [user.id] });
  } else {
    const reaction = comment.reactions[reactionIndex];
    if (reaction.users.includes(user.id)) {
      reaction.users = reaction.users.filter((id) => id !== user.id);
      if (reaction.users.length === 0) {
        comment.reactions.splice(reactionIndex, 1);
      }
    } else {
      reaction.users.push(user.id);
    }
  }

  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  return comments[index];
}

// ============ ACTIVITIES ============

export function getActivities(): Activity[] {
  const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
  return data ? JSON.parse(data) : [];
}

export function getActivitiesByProject(projectId: string, limit = 50): Activity[] {
  return getActivities()
    .filter((a) => a.projectId === projectId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function logActivity(
  projectId: string,
  type: ActivityType,
  metadata: Record<string, unknown> = {}
): Activity {
  const activities = getActivities();
  const user = getCurrentUser();

  const newActivity: Activity = {
    id: generateId(),
    projectId,
    type,
    actor: user,
    metadata,
    createdAt: new Date().toISOString(),
  };

  activities.unshift(newActivity);
  // Keep only last 500 activities
  const trimmed = activities.slice(0, 500);
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(trimmed));

  return newActivity;
}

// ============ NOTIFICATIONS ============

export function getNotifications(): Notification[] {
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  return data ? JSON.parse(data) : [];
}

export function getUnreadNotifications(): Notification[] {
  return getNotifications().filter((n) => !n.read);
}

export function addNotification(
  type: Notification["type"],
  title: string,
  message: string,
  link?: string
): Notification {
  const notifications = getNotifications();
  const user = getCurrentUser();

  const newNotification: Notification = {
    id: generateId(),
    userId: user.id,
    type,
    title,
    message,
    link,
    read: false,
    createdAt: new Date().toISOString(),
  };

  notifications.unshift(newNotification);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications.slice(0, 100)));

  return newNotification;
}

export function markNotificationRead(notificationId: string): void {
  const notifications = getNotifications();
  const index = notifications.findIndex((n) => n.id === notificationId);

  if (index !== -1) {
    notifications[index].read = true;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }
}

export function markAllNotificationsRead(): void {
  const notifications = getNotifications().map((n) => ({ ...n, read: true }));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
}

// ============ ASSETS ============

export function getAssets(): Asset[] {
  const data = localStorage.getItem(STORAGE_KEYS.ASSETS);
  return data ? JSON.parse(data) : [];
}

export function getAssetsByProject(projectId: string): Asset[] {
  return getAssets().filter((a) => a.projectId === projectId);
}

export function addAsset(
  projectId: string,
  name: string,
  type: Asset["type"],
  url: string,
  options: Partial<Asset> = {}
): Asset {
  const assets = getAssets();
  const user = getCurrentUser();

  const newAsset: Asset = {
    id: generateId(),
    projectId,
    name,
    type,
    url,
    thumbnailUrl: options.thumbnailUrl,
    size: options.size || 0,
    dimensions: options.dimensions,
    duration: options.duration,
    uploadedBy: user,
    createdAt: new Date().toISOString(),
    tags: options.tags || [],
  };

  assets.push(newAsset);
  localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));

  return newAsset;
}

export function deleteAsset(assetId: string): boolean {
  const assets = getAssets();
  const filtered = assets.filter((a) => a.id !== assetId);

  if (filtered.length === assets.length) return false;

  localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(filtered));
  return true;
}

// ============ MERGE REQUESTS ============

export function getMergeRequests(): MergeRequest[] {
  const data = localStorage.getItem(STORAGE_KEYS.MERGE_REQUESTS);
  return data ? JSON.parse(data) : [];
}

export function getMergeRequestsByProject(projectId: string): MergeRequest[] {
  return getMergeRequests().filter((mr) => mr.projectId === projectId);
}

export function createMergeRequest(
  projectId: string,
  sourceBranchId: string,
  targetBranchId: string,
  title: string,
  description: string
): MergeRequest {
  const mergeRequests = getMergeRequests();
  const user = getCurrentUser();

  const newMR: MergeRequest = {
    id: generateId(),
    projectId,
    sourceBranchId,
    targetBranchId,
    title,
    description,
    author: user,
    status: "open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviewers: [],
    approvals: [],
    comments: [],
  };

  mergeRequests.push(newMR);
  localStorage.setItem(STORAGE_KEYS.MERGE_REQUESTS, JSON.stringify(mergeRequests));

  logActivity(projectId, "branch_merged", {
    mergeRequestId: newMR.id,
    sourceBranchId,
    targetBranchId,
  });

  return newMR;
}

export function approveMergeRequest(mrId: string): MergeRequest | null {
  const mergeRequests = getMergeRequests();
  const index = mergeRequests.findIndex((mr) => mr.id === mrId);
  const user = getCurrentUser();

  if (index === -1) return null;

  if (!mergeRequests[index].approvals.includes(user.id)) {
    mergeRequests[index].approvals.push(user.id);
    mergeRequests[index].updatedAt = new Date().toISOString();
  }

  localStorage.setItem(STORAGE_KEYS.MERGE_REQUESTS, JSON.stringify(mergeRequests));
  return mergeRequests[index];
}

export function completeMergeRequest(mrId: string): MergeRequest | null {
  const mergeRequests = getMergeRequests();
  const index = mergeRequests.findIndex((mr) => mr.id === mrId);
  const user = getCurrentUser();

  if (index === -1) return null;

  mergeRequests[index].status = "merged";
  mergeRequests[index].mergedAt = new Date().toISOString();
  mergeRequests[index].mergedBy = user;
  mergeRequests[index].updatedAt = new Date().toISOString();

  localStorage.setItem(STORAGE_KEYS.MERGE_REQUESTS, JSON.stringify(mergeRequests));
  return mergeRequests[index];
}

// ============ SEARCH ============

export function searchProjects(query: string): Array<{
  type: "project" | "version" | "branch";
  id: string;
  projectId?: string;
  title: string;
  description: string;
  thumbnail?: string;
  score: number;
}> {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  const results: Array<{
    type: "project" | "version" | "branch";
    id: string;
    projectId?: string;
    title: string;
    description: string;
    thumbnail?: string;
    score: number;
  }> = [];

  // Search in projects
  const projectsData = localStorage.getItem("genvo_projects");
  if (projectsData) {
    const projects = JSON.parse(projectsData);
    for (const project of projects) {
      let score = 0;

      if (project.title.toLowerCase().includes(lowerQuery)) {
        score += 10;
      }
      if (project.description?.toLowerCase().includes(lowerQuery)) {
        score += 5;
      }
      if (project.prompt?.toLowerCase().includes(lowerQuery)) {
        score += 3;
      }

      if (score > 0) {
        results.push({
          type: "project",
          id: project.id,
          title: project.title,
          description: project.description || project.prompt?.slice(0, 100) || "",
          thumbnail: project.thumbnail,
          score,
        });
      }

      // Search versions
      for (const version of project.versions || []) {
        if (version.prompt?.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: "version",
            id: version.id,
            projectId: project.id,
            title: `${project.title} v${version.versionNumber}`,
            description: version.prompt.slice(0, 100),
            thumbnail: version.thumbnail,
            score: 2,
          });
        }
      }
    }
  }

  // Search in branches
  const branchesData = localStorage.getItem("genvo_branches");
  if (branchesData) {
    const branches = JSON.parse(branchesData);
    for (const branch of branches) {
      let score = 0;

      if (branch.name.toLowerCase().includes(lowerQuery)) {
        score += 8;
      }
      if (branch.prompt?.toLowerCase().includes(lowerQuery)) {
        score += 3;
      }

      if (score > 0) {
        results.push({
          type: "branch",
          id: branch.id,
          projectId: branch.projectId,
          title: branch.name,
          description: branch.prompt?.slice(0, 100) || "",
          thumbnail: branch.thumbnail,
          score,
        });
      }
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 20);
}

// Initialize with mock data
export function initializeCollaborationData(projectId: string): void {
  const comments = getComments();
  const activities = getActivities();

  // Add mock comments if none exist
  if (comments.filter((c) => c.projectId === projectId).length === 0) {
    const mockUsers = getMockCollaborators().map((c) => c.user);

    const mockComments: Omit<Comment, "id">[] = [
      {
        projectId,
        versionId: "v2",
        author: mockUsers[0],
        content: "The neon lighting looks amazing! Could we try a cooler blue tone?",
        createdAt: "2024-01-16T10:30:00Z",
        updatedAt: "2024-01-16T10:30:00Z",
        reactions: [{ emoji: "👍", users: ["user-1", "user-3"] }],
        resolved: true,
      },
      {
        projectId,
        versionId: "v3",
        author: mockUsers[1],
        content: "Great progress! The flying cars add so much depth to the scene.",
        createdAt: "2024-01-18T14:45:00Z",
        updatedAt: "2024-01-18T14:45:00Z",
        reactions: [{ emoji: "🔥", users: ["user-1"] }],
      },
      {
        projectId,
        versionId: "v3",
        author: getCurrentUser(),
        content: "Thanks! I think we should add more holographic elements in the next iteration.",
        timestamp: 2.5,
        createdAt: "2024-01-18T15:00:00Z",
        updatedAt: "2024-01-18T15:00:00Z",
        reactions: [],
      },
    ];

    mockComments.forEach((c) => {
      comments.push({ ...c, id: generateId() });
    });

    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  }

  // Add mock activities if none exist
  if (activities.filter((a) => a.projectId === projectId).length === 0) {
    const mockUsers = getMockCollaborators().map((c) => c.user);

    const mockActivities: Omit<Activity, "id">[] = [
      {
        projectId,
        type: "project_created",
        actor: getCurrentUser(),
        metadata: { title: "Cyberpunk City Flythrough" },
        createdAt: "2024-01-15T10:30:00Z",
      },
      {
        projectId,
        type: "version_generated",
        actor: getCurrentUser(),
        metadata: { versionNumber: 1 },
        createdAt: "2024-01-15T11:00:00Z",
      },
      {
        projectId,
        type: "collaborator_added",
        actor: getCurrentUser(),
        metadata: { collaborator: mockUsers[0].name },
        createdAt: "2024-01-15T14:00:00Z",
      },
      {
        projectId,
        type: "version_generated",
        actor: getCurrentUser(),
        metadata: { versionNumber: 2 },
        createdAt: "2024-01-16T09:15:00Z",
      },
      {
        projectId,
        type: "comment_added",
        actor: mockUsers[0],
        metadata: { content: "The neon lighting looks amazing!" },
        createdAt: "2024-01-16T10:30:00Z",
      },
      {
        projectId,
        type: "branch_created",
        actor: mockUsers[0],
        metadata: { branchName: "blue-lighting" },
        createdAt: "2024-01-17T11:00:00Z",
      },
      {
        projectId,
        type: "branch_created",
        actor: mockUsers[1],
        metadata: { branchName: "more-traffic" },
        createdAt: "2024-01-17T12:00:00Z",
      },
      {
        projectId,
        type: "version_generated",
        actor: getCurrentUser(),
        metadata: { versionNumber: 3 },
        createdAt: "2024-01-18T14:22:00Z",
      },
      {
        projectId,
        type: "project_published",
        actor: getCurrentUser(),
        metadata: {},
        createdAt: "2024-01-18T15:00:00Z",
      },
    ];

    mockActivities.forEach((a) => {
      activities.push({ ...a, id: generateId() });
    });

    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }
}
