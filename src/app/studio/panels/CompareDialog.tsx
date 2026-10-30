import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/app/components/ui/dialog";
import { useStudio } from "@/app/studio/store/studioStore";
import { useStudioUI } from "@/app/studio/store/uiStore";
import { usePresence } from "@/app/studio/realtime/presence";
import { diffPrompts, settingsConflicts } from "@/app/studio/lib/prompt";
import { versionMeta } from "@/app/studio/lib/graph";
import { PlayIcon } from "@/app/studio/canvas/VersionNodeCard";
import type { VersionNode } from "@/app/studio/types";

export function CompareDialog() {
  const pair = useStudioUI((s) => s.compare);
  const closeDialogs = useStudioUI((s) => s.closeDialogs);
  const openMerge = useStudioUI((s) => s.openMerge);
  const graph = useStudio((s) => s.graph);
  const toggleApprove = useStudio((s) => s.toggleApprove);
  const self = usePresence((s) => s.self);

  const refA = useRef<HTMLVideoElement>(null);
  const refB = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setPlaying(true);
    setTime(0);
  }, [pair]);

  const a = pair && graph ? graph.versions[pair[0]] : undefined;
  const b = pair && graph ? graph.versions[pair[1]] : undefined;
  if (!graph || !a || !b) return null;

  const both = () => [refA.current, refB.current].filter(Boolean) as HTMLVideoElement[];
  const togglePlay = () => {
    if (playing) both().forEach((v) => v.pause());
    else both().forEach((v) => v.play().catch(() => {}));
    setPlaying(!playing);
  };
  const seek = (t: number) => {
    both().forEach((v) => (v.currentTime = t));
    setTime(t);
  };

  const conflicts = settingsConflicts(a, b);

  const pane = (v: VersionNode, ref: React.RefObject<HTMLVideoElement>, master: boolean) => (
    <div>
      <div className="gv-pair-label">
        <span>
          {v.title}
          {v.approved && <span className="gv-approved" style={{ marginLeft: 6 }}><i>✓</i> Approved</span>}
        </span>
        <button className="gv-btn gv-btn-outline" style={{ height: 26, fontSize: 10 }} onClick={() => toggleApprove(v.id, self)}>
          {v.approved ? "Unapprove" : "Approve"}
        </button>
      </div>
      <video
        ref={ref}
        src={v.videoUrl}
        poster={v.posterUrl}
        autoPlay
        muted
        loop
        playsInline
        onTimeUpdate={master ? (e) => setTime(e.currentTarget.currentTime) : undefined}
        onLoadedMetadata={master ? (e) => setDuration(e.currentTarget.duration) : undefined}
      />
      <p className="gv-dialog-sub" style={{ marginTop: 6 }}>{versionMeta(graph, v)}</p>
    </div>
  );

  return (
    <Dialog open onOpenChange={(open) => !open && closeDialogs()}>
      <DialogContent className="gv-portal gv-dialog max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <div>
          <DialogTitle className="gv-dialog-title">Compare</DialogTitle>
          <DialogDescription className="gv-dialog-sub">
            {a.title} and {b.title}, played in sync.
          </DialogDescription>
        </div>

        <div className="gv-pair">
          {pane(a, refA, true)}
          {pane(b, refB, false)}
        </div>

        <div className="gv-scrub">
          <button className="gv-btn gv-btn-outline gv-btn-icon" style={{ height: 28, width: 28 }} onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
            {playing ? <span style={{ fontSize: 10 }}>❚❚</span> : <PlayIcon />}
          </button>
          <input type="range" min={0} max={duration || 1} step={0.01} value={time} onChange={(e) => seek(parseFloat(e.target.value))} />
          <time>{time.toFixed(1)}s</time>
        </div>

        <section>
          <h2 className="gv-h2">What changed</h2>
          <p className="gv-diff">
            {diffPrompts(a.prompt, b.prompt).map((t, i) => (
              <span key={i} className={t.op === "add" ? "is-added" : t.op === "remove" ? "is-removed" : undefined}>
                {t.text}
              </span>
            ))}
          </p>
          {conflicts.length > 0 && (
            <p className="gv-hint">{conflicts.map((c) => `${c.label}: ${c.a} → ${c.b}`).join(" · ")}</p>
          )}
        </section>

        <div className="gv-dialog-footer">
          <span className="gv-spacer" />
          <button className="gv-btn gv-btn-outline" onClick={closeDialogs}>Close</button>
          <button className="gv-btn gv-btn-primary" onClick={() => openMerge([a.id, b.id])}>Combine these</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
