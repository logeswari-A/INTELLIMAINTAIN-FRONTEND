import { DQ, FIELDS, STATUS, fieldLabel } from "./format.js";
export function StatusPill({ status }) {
  const s = STATUS[status] ?? { label: status, cls: "" };
  return <span className={`pill ${s.cls}`}>{s.label}</span>;
}

export function Glyph({ state, label }) {
  return <span className={`glyph g-${state}`} title={`${label}: ${state}`} />;
}

/** One small square per sensor. Shape as well as colour tells you the state. */
export function TrustGlyphs({ sensorStatus }) {
  return (
    <span className="glyphs" role="img" aria-label={FIELDS.map((f) => `${f.label}: ${sensorStatus[f.key]}`).join(", ")}>
      {FIELDS.map((f) => (
        <span key={f.key} className={`glyph g-${sensorStatus[f.key]}`} title={`${f.label}: ${sensorStatus[f.key]}`} />
      ))}
    </span>
  );
}

export function DataTrust({ dq }) {
  return (
    <span className="trust">
      <TrustGlyphs sensorStatus={dq.sensor_status} />
      <span className={`trust-label t-${dq.status}`}>{DQ[dq.status]}</span>
    </span>
  );
}

export function RiskMeter({ score, level }) {
  if (score == null) return <span className="muted">No estimate</span>;
  return (
    <span className="risk" title={`Estimated failure risk ${Math.round(score * 100)}% (${level})`}>
      <span className="risk-track">
        <span className={`risk-fill r-${level.toLowerCase()}`} style={{ width: `${Math.max(3, score * 100)}%` }} />
      </span>
      <span className="risk-num">{Math.round(score * 100)}%</span>
      <span className="risk-level">{level}</span>
    </span>
  );
}

/** Tiny trend line. Breaks where readings are missing instead of joining across the gap. */
export function Sparkline({ values, width = 96, height = 26 }) {
  const nums = values.filter((v) => v != null);
  if (nums.length < 2) return <span className="muted">no data</span>;
  const min = Math.min(...nums);
  const span = Math.max(...nums) - min || 1;
  const x = (i) => (i / (values.length - 1)) * (width - 2) + 1;
  const y = (v) => height - 2 - ((v - min) / span) * (height - 4);
  const segs = [];
  let cur = [];
  values.forEach((v, i) => {
    if (v == null) {
      if (cur.length) segs.push(cur);
      cur = [];
    } else cur.push([x(i), y(v)]);
  });
  if (cur.length) segs.push(cur);
  return (
    <svg className="spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      {segs.map((s, i) =>
        s.length > 1 ? (
          <polyline key={i} points={s.map((p) => p.join(",")).join(" ")} fill="none" stroke="currentColor" strokeWidth="1.5" />
        ) : (
          <circle key={i} cx={s[0][0]} cy={s[0][1]} r="1.3" fill="currentColor" />
        )
      )}
    </svg>
  );
}

export function Issues({ issues }) {
  if (!issues.length) return <p className="muted">No data-quality problems found in the recent readings.</p>;
  return (
    <ul className="issues">
      {issues.map((i, k) => (
        <li key={k} className={`issue i-${i.severity}`}>
          <strong>{i.sensors.map(fieldLabel).join(" and ")}</strong>
          <span>{i.message}</span>
        </li>
      ))}
    </ul>
  );
}

export function SimBadge() {
  return (
    <span className="sim-badge" title="All readings come from a built-in simulator. No real equipment is connected.">
      Simulated data
    </span>
  );
}
