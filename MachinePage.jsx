import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, usePolling } from "./api.js";
import { DQ, FIELDS, fmtTime, fmtValue } from "./format.js";
import History from "./History.jsx";
import { Glyph, Issues, RiskMeter, StatusPill } from "./ui.jsx";

function Chart({ field, readings, baseline }) {
  const data = readings.map((r) => ({ t: fmtTime(r.ts), v: r[field.key] }));
  const missing = data.filter((d) => d.v == null).length;
  return (
    <figure className="chart">
      <figcaption>
        <strong>{field.label}</strong> <span className="muted">({field.unit})</span>
        {missing > 0 && <span className="muted small"> · {missing} missing reading{missing > 1 ? "s" : ""} shown as gaps</span>}
      </figcaption>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--rule)" vertical={false} />
          <XAxis dataKey="t" tick={{ fontSize: 11 }} minTickGap={48} />
          <YAxis tick={{ fontSize: 11 }} width={46} domain={["auto", "auto"]} />
          <Tooltip formatter={(v) => (v == null ? "missing" : v)} labelStyle={{ fontWeight: 600 }} />
          {baseline && <ReferenceLine y={baseline.mean} stroke="var(--ok)" strokeDasharray="4 4" />}
          <Line type="monotone" dataKey="v" stroke="var(--ink)" strokeWidth={1.8} dot={false} connectNulls={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </figure>
  );
}

function ManualReading({ machineId, onSent }) {
  const [vals, setVals] = useState({ temperature_c: "", vibration_mm_s: "", rpm: "", operating_hours: "" });
  const [msg, setMsg] = useState("");
  const send = async (e) => {
    e.preventDefault();
    const body = {};
    FIELDS.forEach((f) => { body[f.key] = vals[f.key] === "" ? null : Number(vals[f.key]); });
    try {
      await api.sendReading(machineId, body);
      setMsg("Reading sent. Blank fields were recorded as missing.");
      onSent();
    } catch (err) {
      setMsg(err.message);
    }
  };
  return (
    <details className="panel manual">
      <summary>Try the data checks: send your own reading</summary>
      <p className="muted small">Leave a field blank to record it as missing, or enter an impossible value (for example 900 °C) to see how the agent reacts. Readings you send are labelled as manual.</p>
      <form onSubmit={send} className="manual-form">
        {FIELDS.map((f) => (
          <label key={f.key}>
            <span>{f.label} ({f.unit})</span>
            <input type="number" step="any" value={vals[f.key]} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} />
          </label>
        ))}
        <button className="btn primary" type="submit">Send reading</button>
      </form>
      {msg && <p className="small" role="status">{msg}</p>}
    </details>
  );
}

export default function MachinePage({ id, model }) {
  const { data, error, loading, reload } = usePolling(() => api.machine(id), 5000, id);

  if (loading) return <p className="empty">Loading machine…</p>;
  if (error && !data) return <p className="error" role="alert">Could not load {id}: {error}</p>;

  const a = data.assessment;
  const latest = data.readings[data.readings.length - 1];
  const baseline = model?.baseline;

  return (
    <div className="machine-page">
      <p><a href="#/">All machines</a></p>
      <header className="machine-head">
        <div>
          <h1>{data.name}</h1>
          <p className="muted">{data.id} · {data.type}</p>
        </div>
        <StatusPill status={a.status} />
      </header>

      <div className="two-col">
        <section className="panel" aria-labelledby="agent-h">
          <h2 id="agent-h">Agent assessment</h2>
          <p className={`headline h-${a.status}`}>{a.headline}</p>
          <p><RiskMeter score={a.risk_score} level={a.risk_level} /></p>
          <ul className="why">{a.explanation.map((line, i) => <li key={i}>{line}</li>)}</ul>
          <p className="action"><strong>Recommended next step:</strong> {a.recommended_action}</p>
          {a.needs_human_inspection && <p className="flag">A person needs to check this: the evidence is not enough to act on automatically.</p>}
          <p className="muted small">{a.caveat}</p>
        </section>

        <section className="panel" aria-labelledby="dq-h">
          <h2 id="dq-h">Sensor data quality <span className={`trust-label t-${a.data_quality.status}`}>{DQ[a.data_quality.status]}</span></h2>
          <p className="muted small">Quality score {a.data_quality.score} out of 100, from the last {a.data_quality.readings_checked} readings.</p>
          <table className="values">
            <thead><tr><th scope="col">Sensor</th><th scope="col">Latest</th><th scope="col">Trust</th></tr></thead>
            <tbody>
              {FIELDS.map((f) => (
                <tr key={f.key}>
                  <th scope="row">{f.label}</th>
                  <td>{fmtValue(f, latest?.[f.key])}</td>
                  <td><Glyph state={a.data_quality.sensor_status[f.key]} label={f.label} /> {a.data_quality.sensor_status[f.key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Issues issues={a.data_quality.issues} />
        </section>
      </div>

      <section className="panel" aria-labelledby="trend-h">
        <h2 id="trend-h">Sensor trends</h2>
        <p className="muted small">Latest {data.readings.length} readings. The dashed green line is the healthy baseline learned from the simulated training data.</p>
        <div className="charts">
          {FIELDS.filter((f) => f.key !== "operating_hours").map((f) => (
            <Chart key={f.key} field={f} readings={data.readings} baseline={baseline?.[f.key]} />
          ))}
        </div>
      </section>

      <ManualReading machineId={id} onSent={reload} />

      <section className="panel" aria-labelledby="mh-h">
        <h2 id="mh-h">Alert history for this machine</h2>
        <History alerts={data.alerts} showMachine={false} />
      </section>
    </div>
  );
}
