import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ReactFlowProvider } from "@xyflow/react";
import { Toaster } from "sonner";
import { useStudio } from "@/app/studio/store/studioStore";
import { useStudioUI } from "@/app/studio/store/uiStore";
import { usePresence } from "@/app/studio/realtime/presence";
import { useDemoMode } from "@/app/studio/demo/demoMode";
import { RequireAuth } from "@/app/components/SignIn";
import { startGhostTeammate, stopGhostTeammate, isGhostRunning } from "@/app/studio/demo/ghostTeammate";
import { StudioTopBar } from "@/app/studio/StudioTopBar";
import { StudioCanvas } from "@/app/studio/canvas/StudioCanvas";
import { Inspector } from "@/app/studio/panels/Inspector";
import { CompareDialog } from "@/app/studio/panels/CompareDialog";
import { MergeDialog } from "@/app/studio/panels/MergeDialog";
import { NleDrawer } from "@/app/studio/nle/NleDrawer";
import "@/app/studio/studio.css";

// Cloud projects (/p/:id) live in Supabase and need a session (guest is fine).
export function CloudStudio() {
  const { id } = useParams();
  return (
    <RequireAuth title="Sign in to open this project" returnTo={`/p/${id}`}>
      <Studio cloud />
    </RequireAuth>
  );
}

// The Magic Loop: generate → try variations → compare → combine → approve → send to editor.
export function Studio({ cloud = false }: { cloud?: boolean }) {
  const { id } = useParams();
  const status = useStudio((s) => s.status);
  const open = useStudio((s) => s.open);
  const close = useStudio((s) => s.close);
  const demo = useDemoMode((s) => s.enabled) && !cloud;
  const autoTeammate = useDemoMode((s) => s.autoTeammate);

  // The Studio design is light-only; restore the app theme on the way out.
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    root.classList.remove("dark");
    return () => {
      if (wasDark) root.classList.add("dark");
    };
  }, []);

  // `?demo=1` / `?demo=0` (also set by the /demo redirect) wins over the saved preference.
  const [searchParams] = useSearchParams();
  const demoParam = searchParams.get("demo");
  useEffect(() => {
    if (demoParam === "1" || demoParam === "true") useDemoMode.getState().setEnabled(true);
    if (demoParam === "0" || demoParam === "false") useDemoMode.getState().setEnabled(false);
  }, [demoParam]);

  useEffect(() => {
    if (!id) return;
    open(id, { cloud });
    return () => {
      stopGhostTeammate();
      close();
    };
  }, [id, cloud, open, close]);

  // Demo: the scripted teammate joins a few seconds after your first variation
  // has finished rendering, so the two moments read separately on camera.
  const selfId = usePresence((s) => s.self.id);
  const userBranchCount = useStudio((s) =>
    s.graph ? Object.values(s.graph.branches).filter((b) => b.createdBy.id === selfId).length : 0
  );
  const firstVariationReady = useStudio((s) => {
    if (!s.graph) return false;
    const mine = Object.values(s.graph.versions).filter((v) => v.author.id === selfId && v.parentIds.length === 1);
    return mine.length > 0 && mine.every((v) => v.status === "ready");
  });
  useEffect(() => {
    if (!demo || !autoTeammate || userBranchCount !== 1 || !firstVariationReady || isGhostRunning()) return;
    const t = setTimeout(startGhostTeammate, 3000);
    return () => clearTimeout(t);
  }, [demo, autoTeammate, userBranchCount, firstVariationReady]);

  useEffect(() => {
    if (!demo) stopGhostTeammate();
  }, [demo]);

  // ⌘⇧D toggles Demo Mode; Esc cancels compare-picking, then clears selection.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!cloud && (e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        useDemoMode.getState().toggle();
        return;
      }
      if (e.key !== "Escape") return;
      const ui = useStudioUI.getState();
      if (ui.compare || ui.merge || ui.nleOpen) return;
      if (ui.comparePick) ui.setComparePick(null);
      else usePresence.getState().setSelection([]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cloud]);

  if (status === "not-found") {
    return (
      <div className="gv" style={{ alignItems: "center", justifyContent: "center", gap: 12, fontSize: 12 }}>
        <p>{cloud ? "This project doesn't exist, or you haven't been invited to it." : "Project not found."}</p>
        <Link to={cloud ? "/projects" : "/dashboard"} className="gv-link">
          {cloud ? "Back to your projects" : "Back to dashboard"}
        </Link>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="gv" style={{ alignItems: "center", justifyContent: "center", fontSize: 12 }}>
        <p>Opening project…</p>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <main className="gv">
        <StudioTopBar />
        <div className="gv-content">
          <StudioCanvas />
          <Inspector />
        </div>
        <CompareDialog />
        <MergeDialog />
        <NleDrawer />
        <Toaster position="bottom-center" theme="light" toastOptions={{ className: "gv-toast" }} />
      </main>
    </ReactFlowProvider>
  );
}
