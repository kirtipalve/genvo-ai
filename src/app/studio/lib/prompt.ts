import type { StudioSettings, VersionNode } from "@/app/studio/types";

// ---- Word-level prompt diff (LCS) ----

export type DiffToken = { text: string; op: "same" | "add" | "remove" };

// Tokens carry their trailing space so they can be rendered back to back.
export function diffPrompts(a: string, b: string): DiffToken[] {
  return diffWords(a.split(/\s+/).filter(Boolean), b.split(/\s+/).filter(Boolean)).map((t) => ({
    ...t,
    text: `${t.text} `,
  }));
}

function diffWords(A: string[], B: string[]): DiffToken[] {
  const dp: number[][] = Array.from({ length: A.length + 1 }, () => new Array(B.length + 1).fill(0));
  for (let i = A.length - 1; i >= 0; i--) {
    for (let j = B.length - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: DiffToken[] = [];
  let i = 0;
  let j = 0;
  while (i < A.length && j < B.length) {
    if (A[i] === B[j]) {
      out.push({ text: A[i], op: "same" });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ text: A[i++], op: "remove" });
    } else {
      out.push({ text: B[j++], op: "add" });
    }
  }
  while (i < A.length) out.push({ text: A[i++], op: "remove" });
  while (j < B.length) out.push({ text: B[j++], op: "add" });
  return out;
}

// ---- Clause-level prompt merge ----
// Prompts are comma-separated clauses. A merge keeps A's clauses in order
// and appends B's clauses that A doesn't already contain.

function clauses(prompt: string): string[] {
  return prompt
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

export function mergePrompts(a: string, b: string): string {
  const fromA = clauses(a);
  const seen = new Set(fromA.map((c) => c.toLowerCase()));
  const fromB = clauses(b).filter((c) => !seen.has(c.toLowerCase()));
  return [...fromA, ...fromB].join(", ");
}

export function uniqueClauses(a: string, b: string): { onlyA: string[]; onlyB: string[]; shared: string[] } {
  const ca = clauses(a);
  const cb = clauses(b);
  const lb = new Set(cb.map((c) => c.toLowerCase()));
  const la = new Set(ca.map((c) => c.toLowerCase()));
  return {
    onlyA: ca.filter((c) => !lb.has(c.toLowerCase())),
    onlyB: cb.filter((c) => !la.has(c.toLowerCase())),
    shared: ca.filter((c) => lb.has(c.toLowerCase())),
  };
}

// ---- Settings conflicts ----

export interface SettingsConflict {
  field: keyof StudioSettings;
  label: string;
  a: string | number;
  b: string | number;
}

const FIELD_LABELS: Record<keyof StudioSettings, string> = {
  model: "Model",
  aspectRatio: "Aspect ratio",
  duration: "Duration",
  style: "Style",
};

export function settingsConflicts(a: VersionNode, b: VersionNode): SettingsConflict[] {
  return (Object.keys(FIELD_LABELS) as Array<keyof StudioSettings>)
    .filter((f) => a.settings[f] !== b.settings[f])
    .map((f) => ({ field: f, label: FIELD_LABELS[f], a: a.settings[f], b: b.settings[f] }));
}

export function explainMerge(a: VersionNode, b: VersionNode, aName: string, bName: string): string {
  const { onlyA, onlyB, shared } = uniqueClauses(a.prompt, b.prompt);
  const conflicts = settingsConflicts(a, b);
  const parts: string[] = [];
  parts.push(
    `Both takes share ${shared.length} prompt clause${shared.length === 1 ? "" : "s"} from their common ancestor.`
  );
  if (onlyA.length) parts.push(`${aName} adds “${onlyA.join(", ")}”.`);
  if (onlyB.length) parts.push(`${bName} adds “${onlyB.join(", ")}”.`);
  if (conflicts.length) {
    parts.push(
      `Settings conflict on ${conflicts.map((c) => c.label.toLowerCase()).join(", ")} — pick a side for each below.`
    );
  } else {
    parts.push("Settings are compatible, so this is a clean merge.");
  }
  parts.push("I kept the composition from the first take and layered in the lighting cues from the second.");
  return parts.join(" ");
}
