import { BaseEdge, getSmoothStepPath, type Edge, type EdgeProps } from "@xyflow/react";

// Thin orthogonal connector with small rounded elbows ("subway map").
// Variations drop down right after their parent (marked with a dot);
// combines run along their row and rise just before the target.

export type TimelineEdgeData = {
  tone: "spine" | "branch" | "unused";
  turn: "source" | "target";
  busy: boolean;
};

export type TimelineFlowEdge = Edge<TimelineEdgeData, "timeline">;

const STROKES = { spine: "#c4c4c4", branch: "#d4d4d4", unused: "#e6e6e6" };
const ELBOW = 22;

export function TimelineEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps<TimelineFlowEdge>) {
  const turn = data?.turn ?? "source";
  const centerX = turn === "source" ? sourceX + ELBOW : targetX - ELBOW;
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    centerX,
    borderRadius: 8,
  });
  const tone = data?.tone ?? "branch";
  const vertical = Math.abs(targetY - sourceY) > 1;
  return (
    <>
      <BaseEdge
        path={path}
        style={{
          stroke: STROKES[tone],
          strokeWidth: 1.25,
          strokeDasharray: data?.busy ? "3 4" : undefined,
        }}
      />
      {vertical && turn === "source" && <circle className="gv-edge-dot" cx={centerX} cy={sourceY} r={2.5} />}
    </>
  );
}
