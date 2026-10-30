import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/app/components/ui/dialog";
import { useStudio } from "@/app/studio/store/studioStore";
import { useStudioUI } from "@/app/studio/store/uiStore";
import { usePresence } from "@/app/studio/realtime/presence";
import { sortedVersions } from "@/app/studio/lib/graph";
import { MAX_UPLOAD_BYTES } from "@/app/studio/cloud/media";

// Tools teams generate in today; "Other" lets them type their own.
const TOOLS = ["Runway", "Kling", "Veo", "Sora", "Luma", "Pika", "Hailuo / MiniMax", "Seedance", "Midjourney", "Firefly"];

// "Upload a take": bring a clip made in any tool into the version graph.
export function UploadDialog() {
  const upload = useStudioUI((s) => s.upload);
  if (!upload) return null;
  return <UploadForm initialFile={upload.file} />;
}

function UploadForm({ initialFile }: { initialFile: File | null }) {
  const closeDialogs = useStudioUI((s) => s.closeDialogs);
  const focusNode = useStudioUI((s) => s.focusNode);
  const graph = useStudio((s) => s.graph);
  const addUpload = useStudio((s) => s.addUpload);
  const self = usePresence((s) => s.self);
  const selection = usePresence((s) => s.selection);
  const setSelection = usePresence((s) => s.setSelection);

  const [file, setFile] = useState<File | null>(initialFile);
  const [title, setTitle] = useState("");
  const [tool, setTool] = useState(TOOLS[0]);
  const [otherTool, setOtherTool] = useState("");
  const [prompt, setPrompt] = useState("");
  const [parentId, setParentId] = useState<string>(selection.length === 1 ? selection[0] : "");
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  if (!graph) return null;
  const versions = sortedVersions(graph).filter((v) => v.status === "ready");
  const tooBig = !!file && file.size > MAX_UPLOAD_BYTES;
  const model = tool === "Other" ? otherTool.trim() : tool;

  function pick(f: File | undefined) {
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").slice(0, 60));
  }

  function submit() {
    if (!file || tooBig) return;
    const id = addUpload({ file, parentId: parentId || null, title, prompt, model, author: self });
    if (!id) return;
    toast(`Uploading ${title || file.name}`, { description: "It appears on the canvas as soon as it's stored." });
    closeDialogs();
    setSelection([id]);
    focusNode(id);
  }

  return (
    <Dialog open onOpenChange={(open) => !open && closeDialogs()}>
      <DialogContent className="gv-portal gv-dialog max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <div>
          <DialogTitle className="gv-dialog-title">Upload a take</DialogTitle>
          <DialogDescription className="gv-dialog-sub">
            Add a clip from any tool. It becomes a version you can compare, comment on and approve.
          </DialogDescription>
        </div>

        {preview ? (
          <div className="gv-player" style={{ margin: 0 }}>
            <video key={preview} src={preview} controls muted autoPlay loop playsInline />
          </div>
        ) : (
          <label className="gv-dropzone">
            <input type="file" accept="video/mp4,video/quicktime,video/webm" hidden onChange={(e) => pick(e.target.files?.[0])} />
            <strong>Choose a video</strong>
            <span>MP4, MOV or WebM, up to 50 MB. You can also drop files onto the canvas.</span>
          </label>
        )}
        {file && (
          <p className="gv-hint" style={{ padding: 0, color: tooBig ? "#9b3b3b" : undefined }}>
            {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB{tooBig && " — too large (50 MB max)"}{" "}
            <label className="gv-link" style={{ display: "inline", cursor: "pointer" }}>
              Change
              <input type="file" accept="video/mp4,video/quicktime,video/webm" hidden onChange={(e) => pick(e.target.files?.[0])} />
            </label>
          </p>
        )}

        <section>
          <h2 className="gv-h2">Prompt (optional)</h2>
          <textarea
            className="gv-textarea"
            style={{ marginTop: 0 }}
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste the prompt you used, so the team can see what made this take."
          />
        </section>

        <div className="gv-dialog-footer" style={{ flexWrap: "wrap", rowGap: 10 }}>
          <label>
            Name
            <span className="gv-input" style={{ height: 28, width: 180 }}>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Take name" />
            </span>
          </label>
          <label>
            Made with
            <select className="gv-select" value={tool} onChange={(e) => setTool(e.target.value)}>
              {[...TOOLS, "Other"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          {tool === "Other" && (
            <span className="gv-input" style={{ height: 28, width: 120 }}>
              <input value={otherTool} onChange={(e) => setOtherTool(e.target.value)} placeholder="Tool name" />
            </span>
          )}
          <label>
            Branch from
            <select className="gv-select" value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">Nothing (new starting point)</option>
              {versions.map((v) => (
                <option key={v.id} value={v.id}>{v.title}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="gv-dialog-footer">
          <span className="gv-spacer" />
          <button className="gv-btn gv-btn-outline" onClick={closeDialogs}>Cancel</button>
          <button className="gv-btn gv-btn-primary" onClick={submit} disabled={!file || tooBig || !model}>
            Upload
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
