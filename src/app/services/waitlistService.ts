export interface WaitlistEntry {
  name: string;
  email: string;
  role: string;
  useCase: string;
  timestamp: string;
}

const WAITLIST_KEY = "genvo_waitlist";

export function addToWaitlist(entry: WaitlistEntry): void {
  const waitlist = getWaitlist();
  waitlist.push(entry);
  localStorage.setItem(WAITLIST_KEY, JSON.stringify(waitlist));
}

export function getWaitlist(): WaitlistEntry[] {
  const data = localStorage.getItem(WAITLIST_KEY);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function exportWaitlist(): string {
  const waitlist = getWaitlist();

  // Convert to CSV format
  const headers = ["Name", "Email", "Role", "Use Case", "Timestamp"];
  const rows = waitlist.map(entry => [
    entry.name,
    entry.email,
    entry.role,
    entry.useCase || "-",
    new Date(entry.timestamp).toLocaleString()
  ]);

  const csv = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  return csv;
}

export function clearWaitlist(): void {
  localStorage.removeItem(WAITLIST_KEY);
}

export function getWaitlistCount(): number {
  return getWaitlist().length;
}
