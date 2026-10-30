import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/app/lib/supabase";
import { usePresence } from "@/app/studio/realtime/presence";

// Signed-in user for cloud projects. Guests use Supabase anonymous sign-in, so
// someone arriving from a link can open a project without making an account.

interface AuthState {
  session: Session | null;
  ready: boolean;
}

export const useAuth = create<AuthState>(() => ({ session: null, ready: !supabase }));

// Signed-in users appear to collaborators under their account id and name.
useAuth.subscribe(({ session }) => {
  const user = session?.user;
  if (!user) return;
  const { self } = usePresence.getState();
  const name = displayName(user);
  if (self.id !== user.id || self.name !== name) usePresence.setState({ self: { ...self, id: user.id, name } });
});

if (supabase) {
  supabase.auth.getSession().then(({ data }) => useAuth.setState({ session: data.session, ready: true }));
  supabase.auth.onAuthStateChange((_event, session) => useAuth.setState({ session, ready: true }));
}

export function displayName(user: User | null | undefined): string {
  if (!user) return "Guest";
  const meta = user.user_metadata as { name?: string } | undefined;
  if (meta?.name) return meta.name;
  if (user.email) return user.email.split("@")[0];
  return "Guest";
}

export async function continueAsGuest() {
  if (!supabase) throw new Error("Accounts aren't configured.");
  const { error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
}

export async function sendMagicLink(email: string, returnTo: string) {
  if (!supabase) throw new Error("Accounts aren't configured.");
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}${returnTo}` },
  });
  if (error) throw error;
}

export async function setDisplayName(name: string) {
  if (!supabase) return;
  await supabase.auth.updateUser({ data: { name: name.trim() } });
}

export async function signOut() {
  await supabase?.auth.signOut();
}

export async function accessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
