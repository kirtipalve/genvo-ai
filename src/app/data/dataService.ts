// Data service with localStorage persistence
import type { Project, Version, Branch, GenerationSettings } from "./mockData";
import { mockProjects, mockBranches } from "./mockData";

const STORAGE_KEYS = {
  PROJECTS: "genvo_projects",
  BRANCHES: "genvo_branches",
  INITIALIZED: "genvo_initialized",
};

// Generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize with mock data if first time
function initializeStorage(): void {
  if (typeof window === "undefined") return;

  const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!initialized) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(mockProjects));
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(mockBranches));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");
  }
}

// Projects CRUD
export function getProjects(): Project[] {
  if (typeof window === "undefined") return mockProjects;
  initializeStorage();

  const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return data ? JSON.parse(data) : mockProjects;
}

export function getProject(id: string): Project | undefined {
  const projects = getProjects();
  return projects.find((p) => p.id === id);
}

export function createProject(
  title: string,
  prompt: string,
  settings: GenerationSettings
): Project {
  const projects = getProjects();

  const newProject: Project = {
    id: generateId(),
    title: title || "Untitled Project",
    description: prompt.slice(0, 100) + (prompt.length > 100 ? "..." : ""),
    thumbnail: getPlaceholderThumbnail(settings.style),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "generating",
    isPublic: false,
    forks: 0,
    views: 0,
    author: {
      name: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
    },
    versions: [],
    prompt,
    settings,
  };

  projects.unshift(newProject);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));

  return newProject;
}

export function updateProject(id: string, updates: Partial<Project>): Project | undefined {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === id);

  if (index === -1) return undefined;

  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  return projects[index];
}

export function deleteProject(id: string): boolean {
  const projects = getProjects();
  const filtered = projects.filter((p) => p.id !== id);

  if (filtered.length === projects.length) return false;

  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));

  // Also delete associated branches
  const branches = getBranches();
  const filteredBranches = branches.filter((b) => b.projectId !== id);
  localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(filteredBranches));

  return true;
}

// Versions
export function addVersion(
  projectId: string,
  prompt: string,
  settings: GenerationSettings,
  videoUrl?: string,
  thumbnailUrl?: string
): Version | undefined {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === projectId);

  if (index === -1) return undefined;

  const project = projects[index];
  const versionNumber = project.versions.length + 1;

  const newVersion: Version = {
    id: generateId(),
    versionNumber,
    prompt,
    createdAt: new Date().toISOString(),
    videoUrl: videoUrl || "/videos/placeholder.mp4",
    thumbnail: thumbnailUrl || getPlaceholderThumbnail(settings.style),
    settings,
  };

  project.versions.push(newVersion);
  project.prompt = prompt;
  project.settings = settings;
  project.status = "completed";
  project.updatedAt = new Date().toISOString();
  project.thumbnail = newVersion.thumbnail;

  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  return newVersion;
}

// Branches CRUD
export function getBranches(): Branch[] {
  if (typeof window === "undefined") return mockBranches;
  initializeStorage();

  const data = localStorage.getItem(STORAGE_KEYS.BRANCHES);
  return data ? JSON.parse(data) : mockBranches;
}

export function getBranchesByProject(projectId: string): Branch[] {
  const branches = getBranches();
  return branches.filter((b) => b.projectId === projectId);
}

export function getBranch(id: string): Branch | undefined {
  const branches = getBranches();
  return branches.find((b) => b.id === id);
}

export function createBranch(
  projectId: string,
  name: string,
  baseVersionId: string,
  prompt: string,
  settings: GenerationSettings
): Branch {
  const branches = getBranches();

  const newBranch: Branch = {
    id: generateId(),
    name,
    projectId,
    baseVersionId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: {
      name: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
    },
    prompt,
    settings,
    status: "draft",
  };

  branches.push(newBranch);
  localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));

  return newBranch;
}

export function updateBranch(id: string, updates: Partial<Branch>): Branch | undefined {
  const branches = getBranches();
  const index = branches.findIndex((b) => b.id === id);

  if (index === -1) return undefined;

  branches[index] = {
    ...branches[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
  return branches[index];
}

export function deleteBranch(id: string): boolean {
  const branches = getBranches();
  const filtered = branches.filter((b) => b.id !== id);

  if (filtered.length === branches.length) return false;

  localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(filtered));
  return true;
}

export function generateBranchVideo(branchId: string): Branch | undefined {
  const branch = getBranch(branchId);
  if (!branch) return undefined;

  return updateBranch(branchId, {
    status: "completed",
    thumbnail: getPlaceholderThumbnail(branch.settings.style),
    videoUrl: "/videos/placeholder.mp4",
  });
}

// Merge branches
export function mergeBranches(
  projectId: string,
  sourceBranchId: string,
  targetBranchId: string,
  mergedPrompt: string,
  settings: GenerationSettings
): Version | undefined {
  // Add merged version to the project
  return addVersion(projectId, mergedPrompt, settings);
}

// Helper to get placeholder thumbnails based on style
function getPlaceholderThumbnail(style: string): string {
  const thumbnails: Record<string, string> = {
    Cinematic: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=225&fit=crop",
    Natural: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=225&fit=crop",
    Abstract: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=225&fit=crop",
    Anime: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=225&fit=crop",
    Product: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=225&fit=crop",
    Lofi: "https://images.unsplash.com/photo-1501999635878-71cb5379c2d8?w=400&h=225&fit=crop",
    Vintage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop",
    Neon: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=400&h=225&fit=crop",
    Minimalist: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400&h=225&fit=crop",
    Fantasy: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=225&fit=crop",
  };

  return thumbnails[style] || thumbnails.Cinematic;
}

// Reset to initial mock data
export function resetToMockData(): void {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(mockProjects));
  localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(mockBranches));
}

// Clear all data
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.PROJECTS);
  localStorage.removeItem(STORAGE_KEYS.BRANCHES);
  localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
}
