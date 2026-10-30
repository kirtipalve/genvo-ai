import type { ProjectGraph } from "@/app/studio/types";
import { sortedVersions } from "./graph";

// Left-to-right timeline graph: x = step in the history, y = row.
// The main line is the top row; each variation opens a row below.
// Deterministic, so every collaborator sees the identical graph.

export const NODE_WIDTH = 216;
export const NODE_HEIGHT = 182;
const COL_GAP = 72;
const LANE_GAP = 48;

export interface NodePosition {
  x: number;
  y: number;
}

export function layoutGraph(graph: ProjectGraph): Record<string, NodePosition> {
  const depth: Record<string, number> = {};
  const occupied = new Set<string>();
  const positions: Record<string, NodePosition> = {};

  for (const v of sortedVersions(graph)) {
    const parentDepth = Math.max(-1, ...v.parentIds.map((p) => depth[p] ?? -1));
    const lane = graph.branches[v.branchId]?.lane ?? 0;
    let d = parentDepth + 1;
    while (occupied.has(`${d}:${lane}`)) d++;
    occupied.add(`${d}:${lane}`);
    depth[v.id] = d;
    positions[v.id] = {
      x: d * (NODE_WIDTH + COL_GAP),
      y: lane * (NODE_HEIGHT + LANE_GAP),
    };
  }
  return positions;
}

export function nodeCenter(pos: NodePosition): NodePosition {
  return { x: pos.x + NODE_WIDTH / 2, y: pos.y + NODE_HEIGHT / 2 };
}
