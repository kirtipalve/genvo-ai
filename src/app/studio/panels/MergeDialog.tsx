import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/app/components/ui/dialog";
import { useStudio } from "@/app/studio/store/studioStore";
import { useStudioUI } from "@/app/studio/store/uiStore";
import { usePresence } from "@/app/studio/realtime/presence";
import { explainMerge, mergePrompts, settingsConflicts } from "@/app/studio/lib/prompt";
import { branchLabel, mainBranch } from "@/app/studio/lib/graph";
import type { StudioSettings } from "@/app/studio/types";

// "Combine": creates a new version with both selected versions as parents.
export function MergeDialog() {
  const pair = useStudioUI((s) => s.merge);
  const closeDialogs = useStudioUI((s) => s.closeDialogs);
  const focusNode = useStudioUI((s) => s.focusNode);
  const graph = useStudio((s) => s.graph);
  const mergeVersions = useStudio((s) => s.mergeVersions);
  const self = usePresence((s) => s.self);
  const setSelection = usePresence((s) => s.setSelection);

  const a = pair && graph ? graph.versions[pair[0]] : undefined;
  const b = pair && graph ? graph.versions[pair[1]] : undefined;

  const conflicts = useMemo(() => (a && b ? settingsConflicts(a, b) : []), [a?.id, b?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const summary = useMemo(() => (a && b ? explainMerge(a, b, a.title, b.title) : ""), [a?.id, b?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [picks, setPicks] = useState<Record<string, "a" | "b">>({});
  const [targetBranchId, setTargetBranchId] = useState("");
  const [streamed, setStreamed] = useState(0);

  useEffect(() => {
    if (!a || !b || !graph) return;
    setTitle(`${a.title} + ${b.title}`);
    setPrompt(mergePrompts(a.prompt, b.prompt));
    setPicks(Object.fromEntries(conflicts.map((c) => [c.field, c.field === "duration" && Number(c.b) > Number(c.a) ? "b" : "a"])));
    setTargetBranchId(mainBranch(graph)?.id ?? a.branchId);
    setStreamed(0);
    const t = setInterval(() => {
      setStreamed((n) => {
        if (n >= summary.length) {
          clearInterval(t);
          return n;
        }
        return n + 3;
      });
    }, 16);
    return () => clearInterval(t);
  }, [a?.id, b?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!graph || !a || !b) return null;

  const settings: StudioSettings = { ...a.settings };
  conflicts.forEach((c) => {
    (settings as unknown as Record<string, unknown>)[c.field] = picks[c.field] === "b" ? b.settings[c.field] : a.settings[c.field];
  });

  function submit() {
    const id = mergeVersions({ aId: a!.id, bId: b!.id, targetBranchId, title, prompt, settings, author: self });
    if (!id) return;
    toast(`Combining ${a!.title} + ${b!.title}`, { description: "Rendering the combined version" });
    closeDialogs();
    setSelection([id]);
    focusNode(id);
  }

  return (
    <Dialog open onOpenChange={(open) => !open && closeDialogs()}>
      <DialogContent className="gv-portal gv-dialog max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <div>
          <DialogTitle className="gv-dialog-title">Combine</DialogTitle>
          <DialogDescription className="gv-dialog-sub">
            Creates a new version from {a.title} and {b.title}. Both stay in the history.
          </DialogDescription>
        </div>

        <div className="gv-pair">
          {[a, b].map((v) => (
            <div key={v.id}>
              <div className="gv-pair-label"><span>{v.title}</span></div>
              <video src={v.videoUrl} poster={v.posterUrl} autoPlay muted loop playsInline />
            </div>
          ))}
        </div>

        <section>
          <h2 className="gv-h2">Summary</h2>
          <p className="gv-summary">
            {summary.slice(0, streamed)}
            {streamed < summary.length && <span className="gv-caret" />}
          </p>
        </section>

        {conflicts.length > 0 && (
          <section>
            <h2 className="gv-h2">Settings that differ</h2>
            {conflicts.map((c) => (
              <div key={c.field} className="gv-conflict">
                <span>{c.label}</span>
                {(["a", "b"] as const).map((side) => (
                  <button
                    key={side}
                    className={picks[c.field] === side ? "is-on" : ""}
                    onClick={() => setPicks((p) => ({ ...p, [c.field]: side }))}
                  >
                    {String(side === "a" ? c.a : c.b)}
                  </button>
                ))}
              </div>
            ))}
          </section>
        )}

        <section>
          <h2 className="gv-h2">Combined prompt</h2>
          <textarea className="gv-textarea" style={{ marginTop: 0 }} rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        </section>

        <div className="gv-dialog-footer">
          <label>
            Name
            <span className="gv-input" style={{ height: 28, width: 200 }}>
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </span>
          </label>
          <label>
            Add to
            <select className="gv-select" value={targetBranchId} onChange={(e) => setTargetBranchId(e.target.value)}>
              {Object.values(graph.branches)
                .sort((x, y) => x.lane - y.lane)
                .map((br) => (
                  <option key={br.id} value={br.id}>{branchLabel(graph, br)}</option>
                ))}
            </select>
          </label>
          <span className="gv-spacer" />
          <button className="gv-btn gv-btn-outline" onClick={closeDialogs}>Cancel</button>
          <button className="gv-btn gv-btn-primary" onClick={submit} disabled={!prompt.trim()}>Combine</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
