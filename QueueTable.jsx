import { FIELDS, fmtValue } from "../format.js";
import { DataTrust, RiskMeter, Sparkline, StatusPill } from "./ui.jsx";

const vib = FIELDS.find((f) => f.key === "vibration_mm_s");

export default function QueueTable({ machines }) {
  return (
    <div className="table-wrap">
      <table className="queue">
        <caption className="sr-only">Machines ranked by how soon they need attention</caption>
        <thead>
          <tr>
            <th scope="col">Machine</th>
            <th scope="col">Status</th>
            <th scope="col">Failure risk</th>
            <th scope="col">Sensor data</th>
            <th scope="col">Vibration</th>
            <th scope="col">What to do</th>
          </tr>
        </thead>
        <tbody>
          {machines.map((m) => (
            <tr key={m.id} className={`row-${m.status}`}>
              <td>
                <a href={`#/machine/${m.id}`} className="machine-link">
                  <span className="machine-name">{m.name}</span>
                  <span className="machine-id">{m.id}</span>
                </a>
              </td>
              <td><StatusPill status={m.status} /></td>
              <td><RiskMeter score={m.risk_score} level={m.risk_level} /></td>
              <td><DataTrust dq={m.data_quality} /></td>
              <td>
                <span className="vib-cell">
                  <Sparkline values={m.vibration_trend} />
                  <span className="vib-now">{fmtValue(vib, m.latest?.vibration_mm_s)}</span>
                </span>
              </td>
              <td className="what">{m.headline}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
