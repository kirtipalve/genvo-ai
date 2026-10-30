import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Film, Loader2, RefreshCw, UploadCloud } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/app/components/ui/sheet";
import { useStudio } from "@/app/studio/store/studioStore";
import { useStudioUI } from "@/app/studio/store/uiStore";
import { usePresence } from "@/app/studio/realtime/presence";
import type { ProjectGraph, VersionNode } from "@/app/studio/types";

// Simulated Premiere Pro / After Effects extension panel (UXP-style chrome).
// The production version is a UXP plugin talking to the same project API;
// here the "host" is mocked so the hand-off can be shown end-to-end.

const SEQUENCE = "AuroraRunner_HeroSpot_SEQ01";
const SYNC_STAGES = ["Conforming media (H.264 → ProRes 422)", "Importing to bin Genvo/Approved", "Placing on V1"];
const PX_PER_SEC = 22;

export function assetFileName(graph: ProjectGraph, v: VersionNode): string {
  const base = graph.title.split("—")[0].trim().replace(/[^A-Za-z0-9]+/g, "");
  const take = v.title.replace(/\+/g, "and").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${base}_${take || "take"}_v${v.number}.mp4`;
}

function timecode(sec: number) {
  const s = Math.floor(sec);
  const f = Math.round((sec - s) * 24);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `00:${pad(Math.floor(s / 60))}:${pad(s % 60)}:${pad(f)}`;
}

export function NleDrawer() {
  const open = useStudioUI((s) => s.nleOpen);
  const setOpen = useStudioUI((s) => s.setNleOpen);
  const graph = useStudio((s) => s.graph);
  const markSynced = useStudio((s) => s.markSynced);
  const self = usePresence((s) => s.self);
  const [syncing, setSyncing] = useState<Record<string, number>>({}); // id -> stage index

  if (!graph) return null;

  const approved = Object.values(graph.versions)
    .filter((v) => v.approved)
    .sort((a, b) => (a.approvedAt ?? 0) - (b.approvedAt ?? 0));
  const onTimeline = Object.values(graph.versions)
    .filter((v) => v.nle)
    .sort((a, b) => a.nle!.syncedAt - b.nle!.syncedAt);
  const clips = onTimeline.reduce<Array<{ v: VersionNode; start: number }>>((acc, v) => {
    const prev = acc[acc.length - 1];
    acc.push({ v, start: prev ? prev.start + prev.v.settings.duration : 0 });
    return acc;
  }, []);
  const totalSec = Math.max(24, ...clips.map((c) => c.start + c.v.settings.duration + 4));

  async function sync(v: VersionNode) {
    for (let i = 0; i < SYNC_STAGES.length; i++) {
      setSyncing((s) => ({ ...s, [v.id]: i }));
      await new Promise((r) => setTimeout(r, 650));
    }
    markSynced(v.id, self, SEQUENCE);
    setSyncing((s) => {
      const next = { ...s };
      delete next[v.id];
      return next;
    });
  }

  const pending = approved.filter((v) => !v.nle && syncing[v.id] === undefined);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-[440px] gap-0 border-l border-[#111] bg-[#232323] p-0 text-[#d4d4d4] sm:max-w-[440px] [&>button]:text-[#9a9a9a]"
      >
        {/* Host chrome */}
        <div className="flex items-center gap-2 border-b border-[#111] bg-[#1b1b1b] px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#8a8a8a]">
          <span className="h-2 w-2 rounded-full bg-[#9999ff]" />
          Premiere Pro · Extension panel
          <span className="ml-auto mr-6 normal-case tracking-normal text-[#6a6a6a]">preview</span>
        </div>

        <div className="border-b border-[#111] px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-sm font-semibold text-white">
            <Film className="h-4 w-4 text-[#9999ff]" /> Genvo · Approved assets
          </SheetTitle>
          <SheetDescription className="mt-0.5 text-[11px] text-[#8a8a8a]">
            {graph.title} → <span className="font-mono">{SEQUENCE}</span>
          </SheetDescription>
        </div>

        {/* Asset list */}
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {approved.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-xs text-[#8a8a8a]">
              <UploadCloud className="h-6 w-6" />
              No approved takes yet. Approve a version on the canvas and it appears here instantly.
            </div>
          )}
          <AnimatePresence initial={false}>
            {approved.map((v) => {
              const stage = syncing[v.id];
              const br = graph.branches[v.branchId];
              return (
                <motion.div
                  key={v.id}
                  layout
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  className="flex gap-3 rounded-md border border-transparent bg-[#2b2b2b] p-2 hover:border-[#3a3a3a]"
                >
                  <div className="relative w-24 shrink-0 overflow-hidden rounded-sm">
                    <img src={v.posterUrl} alt="" className="aspect-video w-full object-cover" />
                    <span className="absolute bottom-0 left-0 h-0.5 w-full" style={{ background: br?.color }} />
                  </div>
                  <div className="min-w-0 flex-1 text-[11px]">
                    <p className="truncate font-mono text-[#e8e8e8]">{assetFileName(graph, v)}</p>
                    <p className="text-[#8a8a8a]">
                      1280×720 · {v.settings.duration}s · 24 fps
                      {v.approvedBy && ` · approved by ${v.approvedBy.name}`}
                    </p>
                    <div className="mt-1.5">
                      {v.nle ? (
                        <span className="inline-flex items-center gap-1 text-[#7ee08b]">
                          <Check className="h-3 w-3" /> On {v.nle.track} · {v.nle.sequence}
                        </span>
                      ) : stage !== undefined ? (
                        <span className="inline-flex items-center gap-1 text-[#9999ff]">
                          <Loader2 className="h-3 w-3 animate-spin" /> {SYNC_STAGES[stage]}…
                        </span>
                      ) : (
                        <button
                          onClick={() => sync(v)}
                          className="inline-flex items-center gap-1 rounded-sm bg-[#2d8ceb] px-2 py-0.5 font-medium text-white hover:bg-[#3d9cfb]"
                        >
                          <RefreshCw className="h-3 w-3" /> Sync to Timeline
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {pending.length > 1 && (
          <div className="border-t border-[#111] p-2">
            <button
              onClick={() => pending.reduce((p, v) => p.then(() => sync(v)), Promise.resolve())}
              className="w-full rounded-sm bg-[#3a3a3a] py-1.5 text-[11px] font-medium text-white hover:bg-[#444]"
            >
              Sync all ({pending.length})
            </button>
          </div>
        )}

        {/* Mini timeline */}
        <div className="border-t border-[#111] bg-[#1e1e1e] p-3">
          <div className="mb-1.5 flex items-center justify-between text-[10px] text-[#8a8a8a]">
            <span className="font-mono">{SEQUENCE}</span>
            <span className="font-mono text-[#e8c34a]">
              {timecode(clips.reduce((s, c) => s + c.v.settings.duration, 0))}
            </span>
          </div>
          <div className="overflow-x-auto">
            <div className="relative" style={{ width: totalSec * PX_PER_SEC + 32 }}>
              {/* Ruler */}
              <div className="ml-8 flex h-4 border-b border-[#333] text-[9px] text-[#6a6a6a]">
                {Array.from({ length: Math.ceil(totalSec / 4) }).map((_, i) => (
                  <span key={i} className="shrink-0 border-l border-[#333] pl-0.5" style={{ width: 4 * PX_PER_SEC }}>
                    {i * 4}s
                  </span>
                ))}
              </div>
              {["V2", "V1", "A1"].map((track) => (
                <div key={track} className="flex h-7 items-center border-b border-[#2a2a2a]">
                  <span className="w-8 shrink-0 text-[10px] text-[#8a8a8a]">{track}</span>
                  <div className="relative h-full flex-1">
                    {(track === "V1" || track === "A1") &&
                      clips.map(({ v, start }) => (
                        <motion.div
                          key={v.id}
                          initial={{ opacity: 0, y: -14, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: "spring", stiffness: 260, damping: 22 }}
                          className="absolute top-0.5 bottom-0.5 overflow-hidden rounded-[3px] px-1 text-[9px] leading-[22px] text-white/90"
                          style={{
                            left: start * PX_PER_SEC,
                            width: v.settings.duration * PX_PER_SEC - 2,
                            background: track === "V1" ? "#5b5bd6" : "#2f7d55",
                          }}
                        >
                          <span className="truncate">{track === "V1" ? assetFileName(graph, v) : "audio"}</span>
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
              {clips.length > 0 && (
                <motion.div
                  className="pointer-events-none absolute bottom-0 top-4 w-px bg-[#e8c34a]"
                  initial={{ left: 32 }}
                  animate={{ left: 32 + clips.reduce((s, c) => s + c.v.settings.duration, 0) * PX_PER_SEC }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
