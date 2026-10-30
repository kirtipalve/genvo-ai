import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useStudio } from "@/app/studio/store/studioStore";
import { useStudioUI } from "@/app/studio/store/uiStore";
import { usePresence } from "@/app/studio/realtime/presence";
import { useDemoMode, loadDemoManifest, type DemoPreset } from "@/app/studio/demo/demoMode";
import { MODEL_OPTIONS } from "@/app/studio/providers";
import { titleFromChange } from "@/app/studio/lib/graph";
import type { StudioBranch, VersionNode } from "@/app/studio/types";

// Grow with the text, up to about 4 lines, so the whole change stays visible.
function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, 76)}px`;
}

interface Props {
  version: VersionNode;
  branch: StudioBranch;
  isHead: boolean;
}

// "Describe what to change…" — one box. The change is appended to the
// parent's prompt; the full prompt and model are one click away.
export function VariationForm({ version, branch, isHead }: Props) {
  const createVersion = useStudio((s) => s.createVersion);
  const self = usePresence((s) => s.self);
  const setSelection = usePresence((s) => s.setSelection);
  const focusNode = useStudioUI((s) => s.focusNode);
  const variationFocus = useStudioUI((s) => s.variationFocus);
  const demo = useDemoMode((s) => s.enabled);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [change, setChange] = useState("");
  const [preset, setPreset] = useState<DemoPreset | null>(null);
  const [refine, setRefine] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [promptOverride, setPromptOverride] = useState<string | null>(null);
  const [model, setModel] = useState(version.settings.model);
  const [presets, setPresets] = useState<DemoPreset[]>([]);

  useEffect(() => {
    if (demo) loadDemoManifest().then((m) => setPresets(m.presets)).catch(() => setPresets([]));
  }, [demo]);

  useEffect(() => {
    if (variationFocus) inputRef.current?.focus();
  }, [variationFocus]);

  const usingPreset = preset && change === preset.change;
  const prompt =
    promptOverride ?? (usingPreset ? preset.prompt : change.trim() ? `${version.prompt}, ${change.trim()}` : version.prompt);
  const title = usingPreset ? preset.title : titleFromChange(change);
  const canSubmit = change.trim().length > 0 || (promptOverride !== null && promptOverride.trim() !== version.prompt);

  function submit() {
    if (!canSubmit) return;
    const asRefinement = refine && isHead;
    const id = createVersion({
      parentId: version.id,
      target: asRefinement ? { kind: "existing", branchId: branch.id } : { kind: "new", name: title },
      title,
      prompt,
      settings: { ...version.settings, model },
      author: self,
    });
    if (!id) return;
    toast(asRefinement ? `Refining ${version.title}` : `New variation: ${title}`, {
      description: demo ? "Rendering from cache" : "Rendering…",
    });
    setChange("");
    if (inputRef.current) inputRef.current.style.height = "";
    setPreset(null);
    setPromptOverride(null);
    setAdvanced(false);
    setSelection([id]);
    focusNode(id);
  }

  return (
    <form
      className="gv-variation"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="gv-variation-head">
        <span>{refine && isHead ? "Refine this version" : "Try a variation"}</span>
        {isHead && (
          <button type="button" className={refine ? "is-on" : ""} onClick={() => setRefine(!refine)}>
            {refine ? "Refining ✓" : "Refine instead"}
          </button>
        )}
      </div>

      {demo && presets.length > 0 && (
        <div className="gv-chips">
          {presets.map((p) => (
            <button
              key={p.title}
              type="button"
              onClick={() => {
                setPreset(p);
                setChange(p.change);
                setPromptOverride(null);
                inputRef.current?.focus();
                requestAnimationFrame(() => inputRef.current && autoGrow(inputRef.current));
              }}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}

      <div className="gv-input gv-input-grow">
        <textarea
          ref={inputRef}
          rows={1}
          value={change}
          onChange={(e) => {
            setChange(e.target.value);
            autoGrow(e.currentTarget);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Describe what to change…"
        />
        <button type="submit" aria-label="Create variation" disabled={!canSubmit}>↵</button>
      </div>

      <div className="gv-variation-foot">
        <label>
          Model
          <select className="gv-select" value={model} onChange={(e) => setModel(e.target.value)}>
            {MODEL_OPTIONS.map((m) => (
              <option key={m.key} value={m.key}>{m.name}</option>
            ))}
          </select>
          <span className="gv-hint" style={{ marginTop: 0 }}>
            {MODEL_OPTIONS.find((m) => m.key === model)?.cost} per render
          </span>
        </label>
        <button type="button" className="gv-link" style={{ marginTop: 0 }} onClick={() => setAdvanced(!advanced)}>
          {advanced ? "Hide full prompt" : "Edit full prompt"}
        </button>
      </div>
      {advanced && (
        <textarea
          className="gv-textarea"
          rows={5}
          value={prompt}
          onChange={(e) => setPromptOverride(e.target.value)}
        />
      )}
    </form>
  );
}
