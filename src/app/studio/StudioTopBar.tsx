import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Switch } from "@/app/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { useStudio } from "@/app/studio/store/studioStore";
import { useStudioUI } from "@/app/studio/store/uiStore";
import { usePresence } from "@/app/studio/realtime/presence";
import { useDemoMode } from "@/app/studio/demo/demoMode";
import { startGhostTeammate, stopGhostTeammate } from "@/app/studio/demo/ghostTeammate";
import { getApiKey, saveApiKey } from "@/app/services/videoGeneration";
import { DEMO_TEAMMATE } from "@/app/studio/lib/graph";

export function StudioTopBar() {
  const graph = useStudio((s) => s.graph);
  const setNleOpen = useStudioUI((s) => s.setNleOpen);

  if (!graph) return <header className="gv-topbar" />;
  const toSend = Object.values(graph.versions).filter((v) => v.approved && !v.nle).length;

  return (
    <header className="gv-topbar">
      <div className="gv-row">
        <Link to="/dashboard" className="gv-wordmark">genvo</Link>
        <div className="gv-divider" />
        <div className="gv-breadcrumb">
          {graph.client && (
            <>
              <span>{graph.client}</span>
              <span>/</span>
            </>
          )}
          {graph.title}
        </div>
      </div>

      <div className="gv-row" style={{ gap: 8 }}>
        <Avatars />
        <button
          className="gv-btn"
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href.split("?")[0]).catch(() => {});
            toast("Link copied");
          }}
        >
          Share
        </button>
        <StudioMenu />
        <button className="gv-btn gv-btn-primary" onClick={() => setNleOpen(true)}>
          Send to editor {toSend > 0 && <span className="gv-count">({toSend})</span>}
        </button>
      </div>
    </header>
  );
}

function Avatars() {
  const self = usePresence((s) => s.self);
  const peers = usePresence((s) => s.peers);
  const renameSelf = usePresence((s) => s.renameSelf);
  const [name, setName] = useState(self.name);

  return (
    <div className="gv-avatars" aria-label="Collaborators">
      {Object.values(peers).map((p) => (
        <span key={p.user.id} className="gv-avatar" title={p.user.name}>
          {p.user.name.slice(0, 1)}
        </span>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <button className="gv-avatar is-you" title={`${self.name} (you) · click to rename`}>
            {self.name.slice(0, 1)}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="gv-portal gv-menu">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              renameSelf(name);
              toast("Name updated");
            }}
          >
            <div className="gv-h2">Your name</div>
            <div className="gv-input">
              <input value={name} onChange={(e) => setName(e.target.value)} />
              <button type="submit" aria-label="Save name">↵</button>
            </div>
            <p className="gv-hint">Shown to collaborators next to your cursor.</p>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function StudioMenu() {
  const demo = useDemoMode();
  const resetProject = useStudio((s) => s.resetProject);
  const [key, setKey] = useState(getApiKey() ?? "");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="gv-btn gv-btn-icon" aria-label="Studio settings">···</button>
      </PopoverTrigger>
      <PopoverContent align="end" className="gv-portal gv-menu">
        <div className="gv-menu-row">
          <div>
            <strong>Demo Mode</strong>
            <small>Instant renders from cached clips instead of live generation. ⌘⇧D</small>
          </div>
          <Switch checked={demo.enabled} onCheckedChange={demo.setEnabled} />
        </div>

        {demo.enabled ? (
          <>
            <div className="gv-menu-row">
              <div>
                <strong>Auto teammate</strong>
                <small>{DEMO_TEAMMATE.name} joins after you create your first variation.</small>
              </div>
              <Switch checked={demo.autoTeammate} onCheckedChange={demo.setAutoTeammate} />
            </div>
            <div className="gv-menu-actions">
              <button className="gv-btn" onClick={startGhostTeammate}>Bring in {DEMO_TEAMMATE.name}</button>
              <button
                className="gv-btn"
                onClick={() => {
                  stopGhostTeammate();
                  resetProject();
                  toast("Project reset");
                }}
              >
                Reset demo
              </button>
            </div>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveApiKey(key.trim());
              toast("fal.ai key saved in this browser");
            }}
          >
            <div className="gv-menu-row">
              <div>
                <strong>fal.ai API key</strong>
                <small>Live renders take 30–90 seconds.</small>
              </div>
            </div>
            <div className="gv-input">
              <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="fal_…" />
              <button type="submit" aria-label="Save key" disabled={!key.trim()}>↵</button>
            </div>
          </form>
        )}
      </PopoverContent>
    </Popover>
  );
}
