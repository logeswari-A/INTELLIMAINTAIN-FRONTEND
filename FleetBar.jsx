import { STATUS } from "../format.js";

const ORDER = ["high_risk", "data_check", "warning", "healthy"];

export default function FleetBar({ total, counts }) {
  return (
    <section className="fleet-bar" aria-label="Fleet status">
      <div className="fleet-total">
        <span className="big-num">{total}</span>
        <span>machines monitored</span>
      </div>
      <div className="fleet-right">
        <div className="stack" role="img" aria-label={ORDER.map((k) => `${counts[k]} ${STATUS[k].label}`).join(", ")}>
          {ORDER.map((k) =>
            counts[k] ? <span key={k} className={`seg ${STATUS[k].cls}`} style={{ flexGrow: counts[k] }} /> : null
          )}
        </div>
        <ul className="legend">
          {ORDER.map((k) => (
            <li key={k}>
              <span className={`dot ${STATUS[k].cls}`} />
              <strong>{counts[k]}</strong> {STATUS[k].label.toLowerCase()}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
