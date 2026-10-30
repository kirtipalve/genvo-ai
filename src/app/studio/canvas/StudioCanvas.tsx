import { useCallback, useEffect, useMemo, useRef } from "react";
import { Background, BackgroundVariant, ReactFlow, useReactFlow, useViewport } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useStudio } from "@/app/studio/store/studioStore";
import { useStudioUI } from "@/app/studio/store/uiStore";
import { usePresence } from "@/app/studio/realtime/presence";
import { layoutGraph, nodeCenter, NODE_HEIGHT, NODE_WIDTH } from "@/app/studio/lib/layout";
import { authorName, isDimmed, versionMeta } from "@/app/studio/lib/graph";
import { VersionNodeCard, type VersionFlowNode } from "./VersionNodeCard";
import { TimelineEdge, type TimelineFlowEdge } from "./TimelineEdge";
import { Cursors } from "@/app/studio/presence/Cursors";

const nodeTypes = { version: VersionNodeCard };
const edgeTypes = { timeline: TimelineEdge };

export function StudioCanvas() {
  const graph = useStudio((s) => s.graph);
  const selection = usePresence((s) => s.selection);
  const peers = usePresence((s) => s.peers);
  const selfId = usePresence((s) => s.self.id);
  const setSelection = usePresence((s) => s.setSelection);
  const setCursor = usePresence((s) => s.setCursor);
  const focusRequest = useStudioUI((s) => s.focusRequest);
  const comparePick = useStudioUI((s) => s.comparePick);
  const cloud = useStudio((s) => s.cloud);
  const rf = useReactFlow();
  const container = useRef<HTMLDivElement>(null);

  const positions = useMemo(() => (graph ? layoutGraph(graph) : {}), [graph]);

  const viewersByNode = useMemo(() => {
    const map: Record<string, string[]> = {};
    Object.values(peers).forEach((p) =>
      p.selection.forEach((id) => {
        (map[id] ??= []).push(authorName(p.user));
      })
    );
    return map;
  }, [peers, selfId]);

  const nodes: VersionFlowNode[] = useMemo(() => {
    if (!graph) return [];
    return Object.values(graph.versions).map((v) => ({
      id: v.id,
      type: "version",
      position: positions[v.id] ?? { x: 0, y: 0 },
      selected: selection.includes(v.id),
      data: {
        version: v,
        meta: versionMeta(graph, v),
        dimmed: isDimmed(graph, v),
        viewers: viewersByNode[v.id] ?? [],
        pick: comparePick ? (comparePick === v.id ? "source" : "target") : "none",
      },
    }));
  }, [graph, positions, selection, viewersByNode, selfId, comparePick]);

  const edges: TimelineFlowEdge[] = useMemo(() => {
    if (!graph) return [];
    return Object.values(graph.versions).flatMap((v) =>
      v.parentIds.map((parentId) => {
        const parent = graph.versions[parentId];
        const childLane = graph.branches[v.branchId]?.lane ?? 0;
        const parentLane = parent ? graph.branches[parent.branchId]?.lane ?? 0 : 0;
        const rejoin = parentLane > childLane; // rising back up, e.g. into a combine
        return {
          id: `${parentId}->${v.id}`,
          source: parentId,
          target: v.id,
          type: "timeline" as const,
          data: {
            tone: isDimmed(graph, v) ? "unused" : childLane === 0 && parentLane === 0 ? "spine" : "branch",
            turn: rejoin ? "target" : "source",
            busy: v.status === "queued" || v.status === "generating",
          },
        };
      })
    );
  }, [graph]);

  // Reframe when anyone (you, a teammate) adds a version, so new work is never off-screen.
  const versionCount = graph ? Object.keys(graph.versions).length : 0;
  const lastCount = useRef(versionCount);
  useEffect(() => {
    if (!graph) return;
    if (versionCount > lastCount.current && lastCount.current > 0) {
      const newest = Object.values(graph.versions).reduce((a, b) => (b.number > a.number ? b : a));
      useStudioUI.getState().focusNode(newest.id);
    }
    lastCount.current = versionCount;
  }, [versionCount, graph]);

  // When something asks for focus (new version, combine, ...): show the whole
  // graph if it fits at a readable zoom, otherwise pan to the node.
  useEffect(() => {
    if (!focusRequest) return;
    const pos = positions[focusRequest.id];
    const rect = container.current?.getBoundingClientRect();
    if (!pos || !rect) return;
    // Bounds come from the layout, not React Flow, because a node that was
    // just added hasn't been measured yet.
    const all = Object.values(positions);
    const minX = Math.min(...all.map((p) => p.x));
    const minY = Math.min(...all.map((p) => p.y));
    const width = Math.max(...all.map((p) => p.x)) - minX + NODE_WIDTH;
    const height = Math.max(...all.map((p) => p.y)) - minY + NODE_HEIGHT;
    const fitZoom = Math.min(1, rect.width / (width * 1.3), rect.height / (height * 1.35));
    if (fitZoom >= 0.55) {
      rf.setCenter(minX + width / 2, minY + height / 2, { zoom: fitZoom, duration: 700 });
    } else {
      const c = nodeCenter(pos);
      rf.setCenter(c.x, c.y, { zoom: Math.max(rf.getZoom(), 0.75), duration: 700 });
    }
  }, [focusRequest, positions, rf]);

  const onNodeClick = useCallback(
    (e: React.MouseEvent, node: VersionFlowNode) => {
      const ui = useStudioUI.getState();
      if (ui.comparePick) {
        if (ui.comparePick !== node.id) {
          const v = useStudio.getState().graph?.versions[node.id];
          if (v?.status === "ready") ui.openCompare([ui.comparePick, node.id]);
        } else {
          ui.setComparePick(null);
        }
        return;
      }
      const current = usePresence.getState().selection;
      if (e.shiftKey || e.metaKey || e.ctrlKey) {
        if (current.includes(node.id)) setSelection(current.filter((id) => id !== node.id));
        else setSelection([...current, node.id].slice(-2));
      } else {
        setSelection([node.id]);
      }
    },
    [setSelection]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => setCursor(rf.screenToFlowPosition({ x: e.clientX, y: e.clientY })),
    [rf, setCursor]
  );

  const pickTitle = comparePick ? graph?.versions[comparePick]?.title : undefined;

  return (
    <div
      ref={container}
      className="gv-canvas"
      onMouseMove={onMouseMove}
      onMouseLeave={() => setCursor(null)}
      onDragOver={(e) => {
        if (cloud && e.dataTransfer.types.includes("Files")) e.preventDefault();
      }}
      onDrop={(e) => {
        const file = [...e.dataTransfer.files].find((f) => f.type.startsWith("video/"));
        if (!cloud || !file) return;
        e.preventDefault();
        useStudioUI.getState().openUpload({ file });
      }}
    >
      {pickTitle ? (
        <div className="gv-canvas-label is-picking">
          Now click another version to compare with {pickTitle}
          <button onClick={() => useStudioUI.getState().setComparePick(null)}>Cancel</button>
        </div>
      ) : (
        <div className="gv-canvas-label">
          Workspace / {graph ? Object.keys(graph.versions).length : 0} versions
        </div>
      )}

      {cloud && graph && Object.keys(graph.versions).length === 0 && (
        <div className="gv-canvas-empty">
          <strong>Add your first take</strong>
          <span>Drop a video here, or use Upload take. Clips from Runway, Kling, Veo, Sora or any other tool work.</span>
          <button className="gv-btn gv-btn-primary" onClick={() => useStudioUI.getState().openUpload()}>Upload take</button>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={() => {
          setSelection([]);
          useStudioUI.getState().setComparePick(null);
        }}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
        nodesDraggable={false}
        nodesConnectable={false}
        selectionKeyCode={null}
        multiSelectionKeyCode={null}
        deleteKeyCode={null}
        minZoom={0.25}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Lines} gap={40} color="#f5f5f4" lineWidth={1} />
        <Cursors />
      </ReactFlow>

      <ZoomControls />
    </div>
  );
}

function ZoomControls() {
  const rf = useReactFlow();
  const { zoom } = useViewport();
  return (
    <div className="gv-zoom">
      <button aria-label="Zoom out" onClick={() => rf.zoomOut({ duration: 200 })}>−</button>
      <button className="gv-zoom-level" title="Fit to screen" onClick={() => rf.fitView({ padding: 0.3, maxZoom: 1, duration: 400 })}>
        {Math.round(zoom * 100)}%
      </button>
      <button aria-label="Zoom in" onClick={() => rf.zoomIn({ duration: 200 })}>+</button>
    </div>
  );
}
