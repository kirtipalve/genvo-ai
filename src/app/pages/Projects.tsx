import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { RequireAuth } from "@/app/components/SignIn";
import { displayName, signOut, useAuth } from "@/app/lib/auth";
import { createProject, listProjects, setPendingUpload, type CloudProjectSummary } from "@/app/studio/cloud/cloudProject";
import { loadCapabilities, useCapabilities } from "@/app/studio/cloud/capabilities";
import { MAX_UPLOAD_BYTES } from "@/app/studio/cloud/media";
import { TOOLS } from "@/app/studio/panels/UploadDialog";
import { DEFAULT_SETTINGS } from "@/app/studio/lib/graph";
import { MODEL_OPTIONS } from "@/app/studio/providers";
import { usePresence } from "@/app/studio/realtime/presence";

export function Projects() {
  return (
    <RequireAuth title="Sign in to your projects" returnTo="/projects">
      <ProjectList />
    </RequireAuth>
  );
}

function ProjectList() {
  const user = useAuth((s) => s.session?.user);
  const [projects, setProjects] = useState<CloudProjectSummary[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listProjects().then(setProjects).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between border-b border-black/5 px-6 py-4">
        <Link to="/" className="text-lg font-semibold text-black">genvo</Link>
        <div className="flex items-center gap-4 text-sm text-black/60">
          <span>{user?.is_anonymous ? "Guest" : displayName(user)}</span>
          <button className="underline" onClick={() => signOut()}>Sign out</button>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-10 px-6 py-10 md:grid-cols-[1fr_360px]">
        <section>
          <h1 className="text-2xl font-semibold text-black">Your projects</h1>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {projects === null && !error && <p className="mt-4 text-sm text-black/50">Loading…</p>}
          {projects?.length === 0 && (
            <p className="mt-4 text-sm text-black/50">
              No projects yet. Start one on the right, or open the <Link to="/demo" className="underline">demo</Link>.
            </p>
          )}
          <ul className="mt-6 divide-y divide-black/5 border-y border-black/5">
            {projects?.map((p) => (
              <li key={p.id}>
                <Link to={`/p/${p.id}`} className="flex items-baseline justify-between py-4 hover:bg-black/[0.02]">
                  <span>
                    <span className="font-medium text-black">{p.title}</span>
                    {p.client && <span className="ml-2 text-sm text-black/40">{p.client}</span>}
                  </span>
                  <span className="text-xs text-black/40">{new Date(p.created_at).toLocaleDateString()}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <NewProjectForm />
      </main>
    </div>
  );
}

function NewProjectForm() {
  const navigate = useNavigate();
  const self = usePresence((s) => s.self);
  const generation = useCapabilities((s) => s.generation);
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(DEFAULT_SETTINGS.model);
  const [file, setFile] = useState<File | null>(null);
  const [tool, setTool] = useState(TOOLS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadCapabilities();
  }, []);

  const tooBig = !!file && file.size > MAX_UPLOAD_BYTES;
  const ready = title.trim() && (generation ? prompt.trim() : !tooBig);

  return (
    <form
      className="h-fit rounded-xl border border-black/10 p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!ready) return;
        setBusy(true);
        setError("");
        try {
          const id = await createProject({
            title,
            client,
            prompt: generation ? prompt : undefined,
            settings: { ...DEFAULT_SETTINGS, model: generation ? model : tool },
            author: self,
          });
          if (!generation && file) setPendingUpload(id, { file, prompt, model: tool });
          navigate(`/p/${id}`);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Couldn't create the project.");
          setBusy(false);
        }
      }}
    >
      <h2 className="font-semibold text-black">New project</h2>
      <label className="mt-4 block text-xs font-medium text-black/50">Project name</label>
      <Input className="mt-1 border-black/10" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Spring launch — hero spot" />
      <label className="mt-3 block text-xs font-medium text-black/50">Client (optional)</label>
      <Input className="mt-1 border-black/10" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Brand name" />

      {generation ? (
        <>
          <label className="mt-3 block text-xs font-medium text-black/50">First take — describe the shot</label>
          <Textarea
            className="mt-1 border-black/10"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Slow push-in on a ceramic coffee cup, morning light, steam rising, 35mm film look"
          />
          <label className="mt-3 block text-xs font-medium text-black/50">Model</label>
          <select
            className="mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m.key} value={m.key}>{m.name}</option>
            ))}
          </select>
        </>
      ) : (
        <>
          <label className="mt-3 block text-xs font-medium text-black/50">First take (optional)</label>
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            className="mt-1 block w-full text-sm text-black/70 file:mr-3 file:rounded-md file:border file:border-black/10 file:bg-white file:px-3 file:py-1.5 file:text-sm"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {tooBig && <p className="mt-1 text-xs text-red-600">That file is over 50 MB.</p>}
          {file && (
            <>
              <label className="mt-3 block text-xs font-medium text-black/50">Made with</label>
              <select
                className="mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
                value={tool}
                onChange={(e) => setTool(e.target.value)}
              >
                {[...TOOLS, "Other"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <label className="mt-3 block text-xs font-medium text-black/50">Prompt you used (optional)</label>
              <Textarea className="mt-1 border-black/10" rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            </>
          )}
          <p className="mt-2 text-xs text-black/40">Bring takes from Runway, Kling, Veo, Sora or any other tool.</p>
        </>
      )}

      <Button type="submit" className="mt-5 w-full bg-black text-white hover:bg-black/80" disabled={busy || !ready || generation === null}>
        {busy ? "Creating…" : generation ? "Create and render" : "Create project"}
      </Button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </form>
  );
}
