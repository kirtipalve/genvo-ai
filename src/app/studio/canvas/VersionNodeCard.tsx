import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { toast } from "sonner";
import { useStudio } from "@/app/studio/store/studioStore";
import { useStudioUI } from "@/app/studio/store/uiStore";
import { usePresence } from "@/app/studio/realtime/presence";
import { formatDuration } from "@/app/studio/lib/graph";
import type { VersionNode } from "@/app/studio/types";

export type VersionNodeData = {
  version: VersionNode;
  meta: string; // "Variation of Hero shot · Kirti · 2m ago"
  dimmed: boolean;
  viewers: string[]; // names of collaborators who have this selected
  pick: "none" | "source" | "target"; // compare-pick mode state
};

export type VersionFlowNode = Node<VersionNodeData, "version">;

export function PlayIcon({ className = "gv-icon-sm" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M9 7.2v9.6l8-4.8-8-4.8Z" fill="currentColor" />
    </svg>
  );
}

function VersionNodeCardImpl({ data, selected }: NodeProps<VersionFlowNode>) {
  const { version: v, meta, dimmed, viewers, pick } = data;
  const busy = v.status === "queued" || v.status === "generating";

  const classes = [
    "gv-card",
    selected && "is-selected",
    dimmed && "is-dimmed",
    busy && "is-busy",
    pick !== "none" && "is-picking",
    pick === "source" && "is-pick-source",
  ]
    .filter(Boolean)
    .join(" ");

  // Hover actions act on this card without changing the canvas selection first.
  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
  };
  const tryVariation = () => {
    usePresence.getState().setSelection([v.id]);
    useStudioUI.getState().focusVariationInput();
  };
  const compare = () => {
    usePresence.getState().setSelection([v.id]);
    useStudioUI.getState().setComparePick(v.id);
  };
  const approve = () => {
    const self = usePresence.getState().self;
    useStudio.getState().toggleApprove(v.id, self);
    if (!v.approved) toast(`${v.title} approved`, { description: "Ready to send to the editor" });
  };

  return (
    <div className={classes} aria-label={`Select ${v.title}`}>
      {viewers.length > 0 && (
        <div className="gv-viewers">
          {viewers.map((name) => (
            <span key={name} className="gv-viewer-chip">{name}</span>
          ))}
        </div>
      )}

      <div className="gv-thumb">
        {v.status === "ready" && v.videoUrl ? (
          <video key={v.videoUrl} src={v.videoUrl} poster={v.posterUrl} muted loop autoPlay playsInline />
        ) : v.posterUrl && !busy ? (
          <img src={v.posterUrl} alt="" />
        ) : null}

        {busy && (
          <>
            <div className="gv-rendering">Rendering · {Math.round(v.progress)}%</div>
            <div className="gv-progress"><i style={{ width: `${v.progress}%` }} /></div>
          </>
        )}
        {v.status === "failed" && <div className="gv-failed">Render failed</div>}

        {v.status === "ready" && (
          <>
            <span className="gv-duration">{formatDuration(v.settings.duration)}</span>
            <span className="gv-thumb-play"><PlayIcon /></span>
          </>
        )}
      </div>

      {v.status === "ready" && (
        <div className="gv-hover-actions">
          <button onClick={stop(tryVariation)}>Try a variation</button>
          <button onClick={stop(compare)}>Compare</button>
          <button onClick={stop(approve)}>{v.approved ? "Unapprove" : "Approve"}</button>
        </div>
      )}

      <div className="gv-card-copy">
        <div className="gv-card-heading">
          <span>{v.title}</span>
          {v.approved && (
            <span className="gv-approved"><i>✓</i> Approved</span>
          )}
        </div>
        <p>{v.nle ? `${meta} · In editor` : meta}</p>
      </div>

      <Handle type="target" position={Position.Left} className="gv-handle" />
      <Handle type="source" position={Position.Right} className="gv-handle" />
    </div>
  );
}

export const VersionNodeCard = memo(VersionNodeCardImpl);
