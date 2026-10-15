import { useCallback, useEffect, useRef, useState } from "react";

const BASE = import.meta.env.VITE_API_BASE ?? "";

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    } catch {
      /* keep statusText */
    }
    throw new Error(detail);
  }
  return res.json();
}

export const api = {
  fleet: () => request("/api/fleet"),
  machine: (id) => request(`/api/machines/${encodeURIComponent(id)}?n=120`),
  alerts: () => request("/api/alerts?limit=100"),
  model: () => request("/api/model"),
  decide: (id, decision, note) =>
    request(`/api/alerts/${id}/decision`, { method: "POST", body: JSON.stringify({ decision, note: note || null }) }),
  sendReading: (id, values) =>
    request(`/api/machines/${encodeURIComponent(id)}/readings`, { method: "POST", body: JSON.stringify(values) }),
  tick: () => request("/api/simulate/tick", { method: "POST" }),
  reset: () => request("/api/simulate/reset", { method: "POST" }),
};

/** Call `fetcher` now and then every `ms` milliseconds. Re-runs when `key` changes. */
export function usePolling(fetcher, ms, key = "") {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const latest = useRef(fetcher);
  latest.current = fetcher;

  const load = useCallback(async () => {
    try {
      const data = await latest.current();
      setState({ data, error: null, loading: false });
    } catch (e) {
      setState((s) => ({ ...s, error: e.message, loading: false }));
    }
  }, []);

  useEffect(() => {
    setState({ data: null, error: null, loading: true });
    load();
    if (!ms) return undefined;
    const t = setInterval(load, ms);
    return () => clearInterval(t);
  }, [ms, key, load]);

  return { ...state, reload: load };
}
