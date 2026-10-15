import { DQ, fmtDateTime } from "../format.js";
import { StatusPill } from "./ui.jsx";

const DECISION = { pending: "Awaiting decision", approved: "Approved", rejected: "Rejected", superseded: "Superseded" };

export default function History({ alerts, showMachine = true }) {
  if (!alerts.length) return <p className="empty">No alerts yet.</p>;
  return (
    <div className="table-wrap">
      <table className="history">
        <thead>
          <tr>
            <th scope="col">Time</th>
            {showMachine && <th scope="col">Machine</th>}
            <th scope="col">Status</th>
            <th scope="col">Risk</th>
            <th scope="col">Data</th>
            <th scope="col">Recommendation</th>
            <th scope="col">Decision</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((a) => (
            <tr key={a.id}>
              <td>{fmtDateTime(a.created_at)}</td>
              {showMachine && <td><a href={`#/machine/${a.machine_id}`}>{a.machine_name}</a></td>}
              <td><StatusPill status={a.status_kind} /></td>
              <td>{a.risk_score == null ? "None" : `${Math.round(a.risk_score * 100)}% ${a.risk_level}`}</td>
              <td>{DQ[a.dq_status]}</td>
              <td className="what">{a.headline}</td>
              <td>
                <span className={`decision d-${a.decision}`}>{DECISION[a.decision]}</span>
                {a.operator_note && <span className="muted small block">{a.operator_note}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
