import { useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/app/components/ui/sheet";
import { useStudio } from "@/app/studio/store/studioStore";
import { useStudioUI } from "@/app/studio/store/uiStore";
import { usePresence } from "@/app/studio/realtime/presence";
import { assetFileName } from "@/app/studio/nle/NleDrawer";
import { buildEditorPackage } from "@/app/studio/nle/exportPremiere";
import { formatDuration } from "@/app/studio/lib/graph";

// Cloud "Send to editor": download approved takes plus a timeline XML.
export function ExportDrawer() {
  const open = useStudioUI((s) => s.nleOpen);
  const setOpen = useStudioUI((s) => s.setNleOpen);
  const graph = useStudio((s) => s.graph);
  const markSynced = useStudio((s) => s.markSynced);
  const self = usePresence((s) => s.self);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  if (!graph) return null;
  const approved = Object.values(graph.versions)
    .filter((v) => v.approved && v.status === "ready")
    .sort((a, b) => (a.approvedAt ?? 0) - (b.approvedAt ?? 0));

  async function download() {
    if (!graph || approved.length === 0) return;
    setProgress({ done: 0, total: approved.length });
    try {
      const pkg = await buildEditorPackage(graph, approved, (done, total) => setProgress({ done, total }));
      const url = URL.createObjectURL(pkg.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = pkg.fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      approved.forEach((v) => markSynced(v.id, self, pkg.sequence));
      toast("Editor package downloaded", { description: `Unzip it, then import ${pkg.sequence}.xml in your editor.` });
    } catch (err) {
      toast("Export failed", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setProgress(null);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="gv-portal w-[420px] gap-0 p-0 sm:max-w-[420px]">
        <div className="border-b border-[#ededed] px-5 py-4">
          <SheetTitle className="text-sm font-semibold">Send to editor</SheetTitle>
          <SheetDescription className="mt-1 text-xs text-[#8a8a8a]">
            Approved takes, named and in order, with a timeline file for Premiere Pro, DaVinci Resolve or Final Cut.
          </SheetDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {approved.length === 0 ? (
            <p className="px-2 py-10 text-center text-xs text-[#8a8a8a]">
              Nothing approved yet. Select a version and click Approve to add it here.
            </p>
          ) : (
            approved.map((v, i) => (
              <div key={v.id} className="flex items-center gap-3 rounded-md px-2 py-2">
                <span className="w-4 text-right text-[11px] text-[#a3a3a3]">{i + 1}</span>
                {v.posterUrl ? (
                  <img src={v.posterUrl} alt="" className="h-9 w-16 rounded object-cover" />
                ) : (
                  <span className="h-9 w-16 rounded bg-[#f0f0f0]" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{v.title}</p>
                  <p className="truncate font-mono text-[10px] text-[#8a8a8a]">{assetFileName(graph, v)}</p>
                </div>
                <span className="text-[11px] text-[#8a8a8a]">{formatDuration(v.settings.duration)}</span>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-[#ededed] p-4">
          <button className="gv-btn gv-btn-primary w-full justify-center" disabled={approved.length === 0 || !!progress} onClick={download}>
            {progress
              ? `Preparing ${Math.min(progress.done + 1, progress.total)} of ${progress.total}…`
              : `Download for editor (${approved.length} clip${approved.length === 1 ? "" : "s"})`}
          </button>
          <p className="mt-2 text-[11px] text-[#a3a3a3]">A live Premiere panel that syncs approvals automatically is coming next.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
