import { getProject, getBranchesByProject } from "@/app/data/dataService";
import {
  BRANCH_COLORS,
  type Author,
  type ProjectGraph,
  type StudioBranch,
  type StudioSettings,
  type VersionNode,
} from "@/app/studio/types";

export const DEMO_PROJECT_ID = "aurora-runner";

export const DEMO_TEAMMATE: Author = { id: "ghost-teammate", name: "Maya Chen", color: "#ec4899" };

export const DEFAULT_SETTINGS: StudioSettings = {
  model: "veo3",
  aspectRatio: "16:9",
  duration: 6,
  style: "Commercial",
};

export function shortHash(): string {
  return Math.floor(Math.random() * 0xfffffff).toString(16).padStart(7, "0");
}

export function slugifyBranch(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "branch"
  );
}

export function uniqueBranchName(graph: ProjectGraph, name: string): string {
  const base = slugifyBranch(name);
  const taken = new Set(Object.values(graph.branches).map((b) => b.name));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

export function nextVersionNumber(graph: ProjectGraph): number {
  return Object.values(graph.versions).reduce((max, v) => Math.max(max, v.number), 0) + 1;
}

export function makeBranch(graph: ProjectGraph, name: string, headId: string, author: Author): StudioBranch {
  const lane = Object.keys(graph.branches).length;
  const now = Date.now();
  return {
    id: `br-${shortHash()}`,
    name: uniqueBranchName(graph, name),
    color: BRANCH_COLORS[lane % BRANCH_COLORS.length],
    lane,
    headId,
    createdBy: author,
    createdAt: now,
    updatedAt: now,
  };
}

export function sortedVersions(graph: ProjectGraph): VersionNode[] {
  return Object.values(graph.versions).sort((a, b) => a.number - b.number);
}

export function mainBranch(graph: ProjectGraph): StudioBranch | undefined {
  return Object.values(graph.branches).find((b) => b.lane === 0);
}

// ---- Seeds ----

export const DEMO_ROOT_PROMPT =
  "Hero product shot of the Aurora Runner sneaker, slow 360° turntable rotation, macro detail on the knit upper, soft key light, shallow depth of field, 4K commercial";

export function seedDemoGraph(): ProjectGraph {
  const now = Date.now();
  const rootId = shortHash();
  const main: StudioBranch = {
    id: "br-main",
    name: "main",
    color: BRANCH_COLORS[0],
    lane: 0,
    headId: rootId,
    createdBy: DEMO_TEAMMATE,
    createdAt: now,
    updatedAt: now,
  };
  const root: VersionNode = {
    id: rootId,
    number: 1,
    title: "Hero shot",
    parentIds: [],
    branchId: main.id,
    prompt: DEMO_ROOT_PROMPT,
    settings: DEFAULT_SETTINGS,
    status: "ready",
    progress: 100,
    videoUrl: "/demo-assets/hero.mp4?v=3",
    posterUrl: "/demo-assets/hero.jpg?v=3",
    approved: false,
    comments: [],
    author: DEMO_TEAMMATE,
    createdAt: now,
    updatedAt: now,
  };
  return {
    id: DEMO_PROJECT_ID,
    title: "Aurora Runner — Hero Spot",
    client: "Northline Athletics",
    versions: { [root.id]: root },
    branches: { [main.id]: main },
    updatedAt: now,
  };
}

// Converts a project from the older linear data model into a commit graph:
// versions become a chain on main, legacy branches fork from their base.
export function seedFromLegacyProject(projectId: string): ProjectGraph | null {
  const project = getProject(projectId);
  if (!project) return null;
  const now = Date.now();
  const author: Author = { id: "legacy", name: project.author.name, color: "#64748b" };
  const graph: ProjectGraph = {
    id: project.id,
    title: project.title,
    client: undefined,
    versions: {},
    branches: {},
    updatedAt: now,
  };
  const main: StudioBranch = {
    id: "br-main",
    name: "main",
    color: BRANCH_COLORS[0],
    lane: 0,
    headId: "",
    createdBy: author,
    createdAt: now,
    updatedAt: now,
  };
  graph.branches[main.id] = main;

  const legacyToNode = new Map<string, string>();
  let prev: string | null = null;
  let n = 1;
  const toSettings = (s: { duration: number; aspectRatio: StudioSettings["aspectRatio"]; style: string; model: string }) => ({
    ...DEFAULT_SETTINGS,
    ...s,
  });

  for (const v of [...project.versions].sort((a, b) => a.versionNumber - b.versionNumber)) {
    const id = shortHash();
    graph.versions[id] = {
      id,
      number: n,
      title: n === 1 ? "Original" : `Version ${n}`,
      parentIds: prev ? [prev] : [],
      branchId: main.id,
      prompt: v.prompt,
      settings: toSettings(v.settings),
      status: "ready",
      progress: 100,
      videoUrl: v.videoUrl,
      posterUrl: v.thumbnail,
      approved: false,
      comments: [],
      author,
      createdAt: new Date(v.createdAt).getTime() || now,
      updatedAt: now,
    };
    legacyToNode.set(v.id, id);
    prev = id;
    n++;
  }
  main.headId = prev ?? "";

  for (const b of getBranchesByProject(projectId)) {
    if (b.name === "main") continue;
    const parent = legacyToNode.get(b.baseVersionId) ?? prev;
    if (!parent) continue;
    const id = shortHash();
    const branch = makeBranch(graph, b.name, id, { ...author, name: b.author.name });
    graph.branches[branch.id] = branch;
    graph.versions[id] = {
      id,
      number: n++,
      title: humanize(b.name),
      parentIds: [parent],
      branchId: branch.id,
      prompt: b.prompt,
      settings: toSettings(b.settings),
      status: "ready",
      progress: 100,
      videoUrl: b.videoUrl,
      posterUrl: b.thumbnail,
      approved: false,
      comments: [],
      author: { ...author, name: b.author.name },
      createdAt: new Date(b.createdAt).getTime() || now,
      updatedAt: now,
    };
  }
  return graph;
}

// ---- Plain-language display helpers ----

export function humanize(slug: string): string {
  const s = slug.replace(/[-_]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// "seamless white studio background, soft light" -> "Seamless white studio"
export function titleFromChange(change: string): string {
  const words = change.split(",")[0].trim().split(/\s+/).slice(0, 3).join(" ");
  return humanize(words) || "Variation";
}

export function timeAgo(ts: number): string {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function formatDuration(sec: number): string {
  const s = Math.round(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function authorName(author: Author): string {
  return author.name.split(" ")[0];
}

export function childrenOf(graph: ProjectGraph, id: string): VersionNode[] {
  return Object.values(graph.versions).filter((v) => v.parentIds.includes(id));
}

// "Variation of Hero shot", "Refined from White studio", "Combined from 2 versions"
export function lineage(graph: ProjectGraph, v: VersionNode): string {
  if (v.parentIds.length === 0) return "Original";
  if (v.parentIds.length > 1) return `Combined from ${v.parentIds.length} versions`;
  const parent = graph.versions[v.parentIds[0]];
  if (!parent) return "Variation";
  return parent.branchId === v.branchId ? `Refined from ${parent.title}` : `Variation of ${parent.title}`;
}

export function versionMeta(graph: ProjectGraph, v: VersionNode): string {
  return [lineage(graph, v), authorName(v.author), timeAgo(v.createdAt)].join(" · ");
}

export function branchLabel(graph: ProjectGraph, branch: StudioBranch): string {
  if (branch.lane === 0) return "Main line";
  const first = sortedVersions(graph).find((v) => v.branchId === branch.id);
  return first?.title ?? humanize(branch.name);
}

// Once a take is approved, dead-end explorations fade so the canvas stays calm.
export function isDimmed(graph: ProjectGraph, v: VersionNode): boolean {
  if (v.approved || v.status !== "ready") return false;
  if (graph.branches[v.branchId]?.lane === 0) return false;
  if (childrenOf(graph, v.id).length > 0) return false;
  return Object.values(graph.versions).some((x) => x.approved);
}

// Older saved projects predate titles.
export function migrateGraph(graph: ProjectGraph): ProjectGraph {
  const versions = { ...graph.versions };
  let changed = false;
  for (const v of Object.values(versions)) {
    if (!v.title) {
      versions[v.id] = { ...v, title: v.parentIds.length === 0 ? "Original" : `Version ${v.number}` };
      changed = true;
    }
  }
  return changed ? { ...graph, versions } : graph;
}

// ---- Realtime merge: last-writer-wins per version and per branch ----

export function mergeGraphs(local: ProjectGraph, remote: ProjectGraph): ProjectGraph {
  const le = local.epoch ?? 0;
  const re = remote.epoch ?? 0;
  if (re > le) return remote;
  if (re < le) return local;
  const versions = { ...local.versions };
  for (const [id, rv] of Object.entries(remote.versions)) {
    const lv = versions[id];
    if (!lv || rv.updatedAt > lv.updatedAt) versions[id] = rv;
  }
  const branches = { ...local.branches };
  for (const [id, rb] of Object.entries(remote.branches)) {
    const lb = branches[id];
    if (!lb || rb.updatedAt > lb.updatedAt) branches[id] = rb;
  }
  const newer = remote.updatedAt > local.updatedAt ? remote : local;
  return {
    ...newer,
    versions,
    branches,
    updatedAt: Math.max(local.updatedAt, remote.updatedAt),
  };
}
