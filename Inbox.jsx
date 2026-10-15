import { useState } from "react";
import { fmtTime } from "./format.js";
import { StatusPill } from "./ui.jsx";

function Item({ alert, onDecide }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const decide = async (decision) => {
    setBusy(true);
    setError("");
    try {
      await onDecide(alert.id, decision, note);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <li className="inbox-item">
      <div className="inbox-head">
        <a href={`#/machine/${alert.machine_id}`}>{alert.machine_name}</a>
        <StatusPill status={alert.status_kind} />
        <span className="muted">{fmtTime(alert.created_at)}</span>
      </div>
      <p className="inbox-headline">{alert.headline}</p>
      <p className="inbox-action"><strong>Recommended:</strong> {alert.recommended_action}</p>
      <details>
        <summary>Why the agent flagged this</summary>
        <ul className="why">{alert.explanation.map((line, i) => <li key={i}>{line}</li>)}</ul>
      </details>
      <label className="note">
        <span className="sr-only">Note for the maintenance log</span>
        <input type="text" value={note} maxLength={500} placeholder="Add a note (optional)" onChange={(e) => setNote(e.target.value)} />
      </label>
      <div className="btn-row">
        <button className="btn primary" disabled={busy} onClick={() => decide("approve")}>Approve recommendation</button>
        <button className="btn" disabled={busy} onClick={() => decide("reject")}>Reject</button>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
    </li>
  );
}

export default function Inbox({ alerts, onDecide }) {
  return (
    <section className="panel" aria-labelledby="inbox-h">
      <h2 id="inbox-h">Needs your decision <span className="count">{alerts.length}</span></h2>
      <p className="muted small">Approving records your decision in the log. It does not control any equipment.</p>
      {alerts.length === 0 ? (
        <p className="empty">Nothing waiting. New recommendations appear here when a machine's condition changes.</p>
      ) : (
        <ul className="inbox">
          {alerts.map((a) => <Item key={a.id} alert={a} onDecide={onDecide} />)}
        </ul>
      )}
    </section>
  );
}
