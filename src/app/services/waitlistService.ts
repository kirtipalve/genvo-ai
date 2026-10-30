import { supabase } from "@/app/lib/supabase";

export interface WaitlistEntry {
  name: string;
  email: string;
  role: string;
  useCase: string;
  timestamp: string;
}

const WAITLIST_KEY = "genvo_waitlist";

// Signups go to the Supabase `waitlist` table (insert-only for the public).
// Without Supabase configured (local dev) they stay in this browser.
export async function addToWaitlist(entry: WaitlistEntry): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from("waitlist").insert({
      name: entry.name,
      email: entry.email.toLowerCase(),
      role: entry.role,
      use_case: entry.useCase || null,
    });
    // 23505 = unique violation: this email already signed up, which is fine.
    if (error && error.code !== "23505") throw new Error(error.message);
    return;
  }
  const waitlist = getLocalWaitlist();
  waitlist.push(entry);
  localStorage.setItem(WAITLIST_KEY, JSON.stringify(waitlist));
}

export async function getWaitlistCount(): Promise<number | null> {
  if (supabase) {
    const { data, error } = await supabase.rpc("waitlist_count");
    return error ? null : (data as number);
  }
  return getLocalWaitlist().length;
}

// Local-only entries (dev). Production signups live in Supabase.
export function getLocalWaitlist(): WaitlistEntry[] {
  const data = localStorage.getItem(WAITLIST_KEY);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function exportWaitlist(entries: WaitlistEntry[]): string {
  const headers = ["Name", "Email", "Role", "Use Case", "Timestamp"];
  const rows = entries.map(entry => [
    entry.name,
    entry.email,
    entry.role,
    entry.useCase || "-",
    new Date(entry.timestamp).toLocaleString()
  ]);

  return [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");
}

export function clearLocalWaitlist(): void {
  localStorage.removeItem(WAITLIST_KEY);
}
