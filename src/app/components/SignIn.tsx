import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { continueAsGuest, sendMagicLink, useAuth } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";

// Gate for cloud pages: renders children once signed in (guest or email).
export function RequireAuth({ children, title, returnTo }: { children: React.ReactNode; title: string; returnTo: string }) {
  const { session, ready } = useAuth();
  if (!ready) return <CenteredCard><p className="text-sm text-black/50">Loading…</p></CenteredCard>;
  if (!session) return <SignInCard title={title} returnTo={returnTo} />;
  return <>{children}</>;
}

export function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

function SignInCard({ title, returnTo }: { title: string; returnTo: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!supabase) {
    return (
      <CenteredCard>
        <p className="text-sm text-black/60">Accounts aren't set up on this site yet.</p>
        <Link to="/demo" className="text-sm underline">Open the demo instead</Link>
      </CenteredCard>
    );
  }

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <CenteredCard>
      <Link to="/" className="text-xl font-semibold text-black">genvo</Link>
      <h1 className="mt-8 text-2xl font-semibold text-black">{title}</h1>

      {sent ? (
        <p className="mt-4 text-sm text-black/60">
          Check <strong>{email}</strong> for a sign-in link. You can close this tab.
        </p>
      ) : (
        <>
          <Button
            className="mt-6 w-full bg-black text-white hover:bg-black/80"
            disabled={busy}
            onClick={() => run(continueAsGuest)}
          >
            Continue as guest
          </Button>
          <p className="mt-2 text-xs text-black/40">No account needed. Guests get 3 renders a day.</p>

          <div className="my-6 flex items-center gap-3 text-xs text-black/30">
            <span className="h-px flex-1 bg-black/10" /> or <span className="h-px flex-1 bg-black/10" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim()) return;
              run(async () => {
                await sendMagicLink(email.trim(), returnTo);
                setSent(true);
              });
            }}
          >
            <Input
              type="email"
              placeholder="you@studio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-black/10"
            />
            <Button type="submit" variant="outline" className="mt-3 w-full" disabled={busy || !email.trim()}>
              Email me a sign-in link
            </Button>
          </form>
        </>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </CenteredCard>
  );
}
