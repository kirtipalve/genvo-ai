import { useState } from "react";
import { toast } from "sonner";
import { useStudio } from "@/app/studio/store/studioStore";
import { useStudioUI } from "@/app/studio/store/uiStore";
import { usePresence } from "@/app/studio/realtime/presence";
import { diffPrompts } from "@/app/studio/lib/prompt";
import { authorName, formatDuration, sortedVersions, timeAgo, versionMeta } from "@/app/studio/lib/graph";
import { modelName } from "@/app/studio/providers";
import type { ProjectGraph, VersionNode } from "@/app/studio/types";
import { VariationForm } from "./VariationForm";

export function Inspector() {
  const graph = useStudio((s) => s.graph);
  const selection = usePresence((s) => s.selection);
  if (!graph) return <aside className="gv-inspector" />;

  const selected = selection.map((id) => graph.versions[id]).filter(Boolean);

  return (
    <aside className="gv-inspector">
      {selected.length === 1 ? (
        <VersionDetails key={selected[0].id} graph={graph} version={selected[0]} />
      ) : selected.length === 2 ? (
        <PairSummary graph={graph} a={selected[0]} b={selected[1]} />
      ) : (
        <ProjectOverview graph={graph} />
      )}
    </aside>
  );
}

function Topline({ label, onClose }: { label: string; onClose?: () => void }) {
  return (
    <div className="gv-topline">
      <span>{label}</span>
      {onClose && (
        <button aria-label="Close panel" onClick={onClose}>×</button>
      )}
    </div>
  );
}

function VersionDetails({ graph, version: v }: { graph: ProjectGraph; version: VersionNode }) {
  const toggleApprove = useStudio((s) => s.toggleApprove);
  const retryVersion = useStudio((s) => s.retryVersion);
  const addComment = useStudio((s) => s.addComment);
  const openCompare = useStudioUI((s) => s.openCompare);
  const setComparePick = useStudioUI((s) => s.setComparePick);
  const comparePick = useStudioUI((s) => s.comparePick);
  const self = usePresence((s) => s.self);
  const setSelection = usePresence((s) => s.setSelection);
  const [comment, setComment] = useState("");

  const branch = graph.branches[v.branchId];
  const parent = v.parentIds[0] ? graph.versions[v.parentIds[0]] : undefined;
  const busy = v.status === "queued" || v.status === "generating";
  const ready = v.status === "ready";

  return (
    <>
      <Topline label="Selected version" onClose={() => setSelection([])} />

      {ready && v.videoUrl ? (
        <div className="gv-player">
          <video key={v.videoUrl} src={v.videoUrl} poster={v.posterUrl} controls autoPlay muted loop playsInline />
        </div>
      ) : busy ? (
        <div className="gv-player is-empty">
          Rendering · {Math.round(v.progress)}%
          <div className="gv-progress"><i style={{ width: `${v.progress}%` }} /></div>
        </div>
      ) : (
        <div className="gv-player is-empty" style={{ color: "#9b3b3b" }}>Render failed</div>
      )}

      <div className="gv-selection">
        <div>
          <h1>{v.title}</h1>
          <p>{versionMeta(graph, v)}</p>
        </div>
        {v.approved && (
          <span className="gv-approved" style={{ fontSize: 9, marginTop: 2 }}><i>✓</i> Approved</span>
        )}
      </div>

      <section className="gv-section">
        <h2 className="gv-h2">Prompt</h2>
        <p className="gv-prompt">
          {parent
            ? diffPrompts(parent.prompt, v.prompt)
                .filter((t) => t.op !== "remove")
                .map((t, i) => (
                  <span key={i} className={t.op === "add" ? "is-added" : undefined}>{t.text}</span>
                ))
            : v.prompt}
        </p>
        <p className="gv-model">
          Made with {modelName(v.settings.model)} · {v.settings.aspectRatio} · {formatDuration(v.settings.duration)}
        </p>
        {parent && parent.status === "ready" && ready && (
          <button className="gv-link" onClick={() => openCompare([parent.id, v.id])}>
            Compare with {parent.title} <span>↗</span>
          </button>
        )}
        {v.error && <p className="gv-hint" style={{ color: "#9b3b3b" }}>{v.error}</p>}
      </section>

      <div className="gv-decision">
        {v.status === "failed" && v.source !== "uploaded" ? (
          <button className="gv-approve" onClick={() => retryVersion(v.id)}>Retry render</button>
        ) : (
          <button
            className={`gv-approve ${v.approved ? "is-active" : ""}`}
            disabled={!ready}
            onClick={() => {
              toggleApprove(v.id, self);
              if (!v.approved) toast(`${v.title} approved`, { description: "Ready to send to the editor" });
            }}
          >
            {v.approved ? "Approved" : "Approve"}
          </button>
        )}
        <button
          className="gv-compare"
          disabled={!ready}
          onClick={() => setComparePick(comparePick === v.id ? null : v.id)}
        >
          {comparePick === v.id ? "Cancel compare" : "Compare"}
        </button>
      </div>

      <section className="gv-section">
        <h2 className="gv-h2">
          <span>Comments{v.comments.length > 0 && <span className="gv-count">{v.comments.length}</span>}</span>
        </h2>
        {v.comments.map((c) => (
          <div key={c.id} className="gv-comment">
            <div className="gv-comment-avatar">{c.author.name.slice(0, 1)}</div>
            <div>
              <p className="gv-comment-author">
                {c.author.name}
                <time>{timeAgo(c.createdAt)}</time>
              </p>
              <p>{c.text}</p>
            </div>
          </div>
        ))}
        <form
          className="gv-input"
          onSubmit={(e) => {
            e.preventDefault();
            addComment(v.id, comment, self);
            setComment("");
          }}
        >
          <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment…" />
          <button type="submit" aria-label="Post comment" disabled={!comment.trim()}>↵</button>
        </form>
      </section>

      {ready && <VariationForm version={v} branch={branch} isHead={branch.headId === v.id} />}
    </>
  );
}

function PairSummary({ graph, a, b }: { graph: ProjectGraph; a: VersionNode; b: VersionNode }) {
  const openCompare = useStudioUI((s) => s.openCompare);
  const openMerge = useStudioUI((s) => s.openMerge);
  const self = usePresence((s) => s.self);
  const setSelection = usePresence((s) => s.setSelection);
  const ready = a.status === "ready" && b.status === "ready";
  return (
    <>
      <Topline label="2 selected" onClose={() => setSelection([])} />
      <section className="gv-section" style={{ paddingTop: 4 }}>
        {[a, b].map((v) => (
          <div key={v.id} className="gv-list-row">
            <img src={v.posterUrl} alt="" />
            <div style={{ minWidth: 0 }}>
              <strong>{v.title}</strong>
              <small>{versionMeta(graph, v)}</small>
            </div>
          </div>
        ))}
      </section>
      <div className="gv-decision">
        <button className="gv-compare" disabled={!ready} onClick={() => openCompare([a.id, b.id])}>Compare</button>
        <button className="gv-approve" disabled={!ready} onClick={() => openMerge([a.id, b.id])}>Combine</button>
      </div>
      {!ready && <p className="gv-hint">Waiting for both renders to finish.</p>}
    </>
  );
}

function ProjectOverview({ graph }: { graph: ProjectGraph }) {
  const self = usePresence((s) => s.self);
  const setSelection = usePresence((s) => s.setSelection);
  const focusNode = useStudioUI((s) => s.focusNode);
  const versions = sortedVersions(graph);
  const approved = versions.filter((v) => v.approved).length;
  const people = new Set(versions.map((v) => authorName(v.author))).size;

  return (
    <>
      <Topline label="Project" />
      <div className="gv-selection" style={{ paddingTop: 4 }}>
        <div>
          <h1>{graph.title}</h1>
          {graph.client && <p>{graph.client}</p>}
          <p className="gv-stat">
            {versions.length} version{versions.length === 1 ? "" : "s"} · {people} {people === 1 ? "person" : "people"} · {approved} approved
          </p>
        </div>
      </div>
      <section className="gv-section">
        <h2 className="gv-h2">Versions</h2>
        {versions.map((v) => (
          <button
            key={v.id}
            className="gv-list-row"
            onClick={() => {
              setSelection([v.id]);
              focusNode(v.id);
            }}
          >
            {v.posterUrl ? <img src={v.posterUrl} alt="" /> : <span className="gv-list-thumb" />}
            <span style={{ minWidth: 0 }}>
              <strong>
                {v.title}
                {v.approved && <span className="gv-approved" style={{ marginLeft: 6 }}><i>✓</i></span>}
              </strong>
              <small>{versionMeta(graph, v)}</small>
            </span>
          </button>
        ))}
      </section>
      <p className="gv-hint" style={{ paddingBottom: 18 }}>
        Hover a version to try a variation, compare or approve. Shift-click two to combine them.
      </p>
    </>
  );
}
