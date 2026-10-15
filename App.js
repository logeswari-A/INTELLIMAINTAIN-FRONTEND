import { useEffect, useState } from "react";
import { api, usePolling } from "./api.js";
import FleetBar from "./components/FleetBar.jsx";
import History from "./components/History.jsx";
import Inbox from "./components/Inbox.jsx";
import MachinePage from "./components/MachinePage.jsx";
import QueueTable from "./components/QueueTable.jsx";
import { SimBadge } from "./components/ui.jsx";
import { fmtTime } from "./format.js";

function useRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => { setHash(window.location.hash); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const m = hash.match(/^#\/machine\/(.+)$/);
  return m ? { page: "machine", id: decodeURIComponent(m[1]) } : { page: "dashboard" };
}

function ModelNote({ model }) {
  if (!model) return null;
  const m = model.metrics;
  return (
    <footer className="model-note">
      <h2>About the prediction model</h2>
      <p>
        {model.algorithm}, trained on <strong>simulated</strong> data. On a held-out slice of that same simulated data it reached
        ROC AUC {m.roc_auc.toFixed(2)}, with precision {m.precision_at_medium_threshold.toFixed(2)} and recall {m.recall_at_medium_threshold.toFixed(2)} at
        the Medium threshold ({Math.round(m.medium_threshold * 100)}%). These numbers show the model recovers the simulator's rules.
        They say nothing about how it would perform on real machines, which would need real failure history.
      </p>
    </footer>
  );
}

function Dashboard({ fleet, alerts, reloadAll }) {
  const pending = alerts.filter((a) => a.decision === "pending");
  const decide = async (id, decision, note) => {
    await api.decide(id, decision, note);
    await reloadAll();
  };
  return (
    <>
      <FleetBar total={fleet.total} counts={fleet.counts} />
      <div className="two-col wide-left">
        <section className="panel" aria-labelledby="queue-h">
          <h2 id="queue-h">Machines by priority</h2>
          <p className="muted small">Highest priority first. Indigo marks sensor-data problems; green, amber and red mark machine risk.</p>
          <QueueTable machines={fleet.machines} />
        </section>
        <Inbox alerts={pending} onDecide={decide} />
      </div>
      <section className="panel" aria-labelledby="hist-h">
        <h2 id="hist-h">Maintenance alert history</h2>
        <History alerts={alerts} />
      </section>
    </>
  );
}

export default function App() {
  const route = useRoute();
  const fleet = usePolling(api.fleet, 5000);
  const alerts = usePolling(api.alerts, 5000);
  const model = usePolling(api.model, 0);
  const reloadAll = async () => { await Promise.all([fleet.reload(), alerts.reload()]); };

  return (
    <div className="app">
      <header className="topbar">
        <a href="#/" className="brand">IntelliMaintain AI</a>
        <SimBadge />
        <span className="spacer" />
        {fleet.data && <span className="muted small">Updated {fmtTime(fleet.data.generated_at)}</span>}
      </header>
      <main>
        {route.page === "machine" ? (
          <MachinePage id={route.id} model={model.data} />
        ) : fleet.loading || alerts.loading ? (
          <p className="empty">Loading fleet…</p>
        ) : fleet.error && !fleet.data ? (
          <p className="error" role="alert">
            Could not reach the backend ({fleet.error}). Start it with <code>uvicorn app.main:app --port 8000</code> from the backend folder.
          </p>
        ) : (
          <Dashboard fleet={fleet.data} alerts={alerts.data ?? []} reloadAll={reloadAll} />
        )}
        <ModelNote model={model.data} />
      </main>
    </div>
  );
}
