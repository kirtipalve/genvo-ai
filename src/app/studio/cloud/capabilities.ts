import { create } from "zustand";

// Whether this deployment has an AI video model connected (/api/config).
// Without one, cloud projects work from uploaded takes instead of renders.
interface Capabilities {
  generation: boolean | null; // null until loaded
}

export const useCapabilities = create<Capabilities>(() => ({ generation: null }));

let loading: Promise<void> | null = null;
export function loadCapabilities() {
  loading ??= fetch("/api/config")
    .then((r) => (r.ok ? r.json() : { generation: false }))
    .then((c) => useCapabilities.setState({ generation: Boolean(c.generation) }))
    .catch(() => useCapabilities.setState({ generation: false }));
  return loading;
}
