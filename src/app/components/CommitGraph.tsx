import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { Version, Branch } from "@/app/data/mockData";

interface CommitGraphProps {
  versions: Version[];
  branches: Branch[];
  selectedVersionId?: string;
  onSelectVersion?: (versionId: string) => void;
}

const BRANCH_COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];
const ROW_H = 72;
const SPINE_X = 18;
const LANE_W = 28;
const R = 7;

interface GraphRow {
  id: string;
  label: string;
  sublabel: string;
  lane: number;        // 0 = main
  row: number;         // visual row index
  baseRow?: number;    // row index of parent (for branches)
  color: string;
  isHead?: boolean;
  isMerged?: boolean;
  author?: { name: string; avatar: string };
  timestamp: string;
  type: "version" | "branch";
}

function buildGraph(versions: Version[], branches: Branch[]): GraphRow[] {
  const sorted = [...versions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const rows: GraphRow[] = sorted.map((v, i) => ({
    id: v.id,
    label: `v${v.versionNumber}`,
    sublabel: v.settings.model,
    lane: 0,
    row: i,
    color: "#000",
    isHead: i === sorted.length - 1,
    timestamp: v.createdAt,
    type: "version",
    author: { name: "You", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=user" },
  }));

  // Assign branches to lanes, one lane per branch
  const laneUsage: number[] = [];
  branches.forEach((branch, bi) => {
    const baseVersion = sorted.find((v) => v.id === branch.baseVersionId);
    if (!baseVersion) return;
    const baseRow = sorted.indexOf(baseVersion);

    // Find a free lane
    let lane = 1;
    while (laneUsage[lane]) lane++;
    laneUsage[lane] = 1;

    rows.push({
      id: branch.id,
      label: branch.name,
      sublabel: branch.author.name,
      lane,
      row: baseRow + 0.7 + bi * 0.01, // float row so branches appear between versions
      baseRow,
      color: BRANCH_COLORS[(bi) % BRANCH_COLORS.length],
      isMerged: branch.status === "completed",
      timestamp: branch.updatedAt,
      type: "branch",
      author: branch.author,
    });
  });

  return rows;
}

function nodeX(lane: number) {
  return SPINE_X + lane * LANE_W;
}

function nodeY(row: number) {
  return 24 + row * ROW_H;
}

export function CommitGraph({
  versions,
  branches,
  selectedVersionId,
  onSelectVersion,
}: CommitGraphProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const rows = buildGraph(versions, branches);
  const mainVersionRows = rows.filter((r) => r.type === "version");
  const branchRows = rows.filter((r) => r.type === "branch");

  const maxLane = Math.max(0, ...rows.map((r) => r.lane));
  const svgWidth = SPINE_X + (maxLane + 1) * LANE_W + 120;
  const svgHeight = nodeY(mainVersionRows.length - 1) + 40;

  const isDark = document.documentElement.classList.contains("dark");
  const mainColor = isDark ? "#fff" : "#000";

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        width={svgWidth}
        height={svgHeight}
        className="overflow-visible"
        style={{ minWidth: svgWidth }}
      >
        {/* Main spine line */}
        {mainVersionRows.length > 1 && (
          <line
            x1={nodeX(0)}
            y1={nodeY(0)}
            x2={nodeX(0)}
            y2={nodeY(mainVersionRows.length - 1)}
            stroke={mainColor}
            strokeWidth={2}
            strokeOpacity={0.2}
          />
        )}

        {/* Branch connector lines */}
        {branchRows.map((br) => {
          if (br.baseRow === undefined) return null;
          const x1 = nodeX(0);
          const y1 = nodeY(br.baseRow);
          const x2 = nodeX(br.lane);
          const y2 = nodeY(br.row);
          // Curved bezier path
          const cx = x1 + (x2 - x1) * 0.6;
          return (
            <path
              key={`line-${br.id}`}
              d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
              fill="none"
              stroke={br.color}
              strokeWidth={1.5}
              strokeOpacity={0.5}
              strokeDasharray={br.isMerged ? "0" : "4 3"}
            />
          );
        })}

        {/* Version nodes (main lane) */}
        {mainVersionRows.map((v) => {
          const cx = nodeX(0);
          const cy = nodeY(v.row);
          const isSelected = v.id === selectedVersionId;
          const isHov = hovered === v.id;

          return (
            <g
              key={v.id}
              style={{ cursor: onSelectVersion ? "pointer" : "default" }}
              onClick={() => onSelectVersion?.(v.id)}
              onMouseEnter={() => setHovered(v.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Outer ring when selected */}
              {(isSelected || v.isHead) && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={R + 4}
                  fill="none"
                  stroke={mainColor}
                  strokeWidth={1.5}
                  strokeOpacity={0.3}
                />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={isHov ? R + 1 : R}
                fill={isSelected ? mainColor : "transparent"}
                stroke={mainColor}
                strokeWidth={2}
                style={{ transition: "r 0.15s" }}
              />
              {/* HEAD label */}
              {v.isHead && (
                <text
                  x={cx}
                  y={cy - R - 10}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={600}
                  fill={mainColor}
                  opacity={0.5}
                  fontFamily="monospace"
                >
                  HEAD
                </text>
              )}
              {/* Version label */}
              <text
                x={cx + R + 8}
                y={cy + 1}
                dominantBaseline="middle"
                fontSize={12}
                fontWeight={isSelected ? 700 : 500}
                fill={mainColor}
                fontFamily="monospace"
              >
                {v.label}
              </text>
              <text
                x={cx + R + 8}
                y={cy + 14}
                dominantBaseline="middle"
                fontSize={10}
                fill={mainColor}
                opacity={0.4}
              >
                {v.sublabel}
              </text>
            </g>
          );
        })}

        {/* Branch nodes */}
        {branchRows.map((br) => {
          const cx = nodeX(br.lane);
          const cy = nodeY(br.row);
          const isHov = hovered === br.id;

          return (
            <g
              key={br.id}
              onMouseEnter={() => setHovered(br.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <circle
                cx={cx}
                cy={cy}
                r={isHov ? R + 1 : R}
                fill={br.isMerged ? br.color : "transparent"}
                stroke={br.color}
                strokeWidth={2}
                style={{ transition: "r 0.15s" }}
              />
              {/* Branch label */}
              <text
                x={cx + R + 8}
                y={cy - 5}
                dominantBaseline="middle"
                fontSize={11}
                fontWeight={600}
                fill={br.color}
                fontFamily="monospace"
              >
                {br.label}
              </text>
              <text
                x={cx + R + 8}
                y={cy + 8}
                dominantBaseline="middle"
                fontSize={10}
                fill={br.color}
                opacity={0.6}
              >
                {br.sublabel}
              </text>
              {br.isMerged && (
                <text
                  x={cx + R + 8}
                  y={cy + 18}
                  dominantBaseline="middle"
                  fontSize={9}
                  fill={br.color}
                  opacity={0.5}
                >
                  merged
                </text>
              )}
            </g>
          );
        })}

        {/* Tooltip on hover */}
        {hovered && (() => {
          const node = rows.find((r) => r.id === hovered);
          if (!node) return null;
          const cx = nodeX(node.lane);
          const cy = nodeY(node.row);
          const date = new Date(node.timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          return (
            <g>
              <rect
                x={cx + 16}
                y={cy - 22}
                width={110}
                height={36}
                rx={6}
                fill={isDark ? "#1a1a1a" : "#fff"}
                stroke={node.type === "branch" ? node.color : mainColor}
                strokeWidth={1}
                strokeOpacity={0.3}
                filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))"
              />
              <text
                x={cx + 24}
                y={cy - 8}
                fontSize={11}
                fontWeight={600}
                fill={node.type === "branch" ? node.color : mainColor}
              >
                {node.label}
              </text>
              <text
                x={cx + 24}
                y={cy + 6}
                fontSize={10}
                fill={mainColor}
                opacity={0.5}
              >
                {node.author?.name} · {date}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
