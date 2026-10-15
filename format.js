export const STATUS = {
  healthy: { label: "Healthy", cls: "s-healthy" },
  warning: { label: "Warning", cls: "s-warning" },
  high_risk: { label: "High risk", cls: "s-high" },
  data_check: { label: "Data check", cls: "s-data" },
};

export const DQ = {
  reliable: "Reliable",
  suspect: "Suspect",
  unreliable: "Unreliable",
};

export const FIELDS = [
  { key: "temperature_c", label: "Temperature", unit: "°C", digits: 1 },
  { key: "vibration_mm_s", label: "Vibration", unit: "mm/s", digits: 2 },
  { key: "rpm", label: "Rotational speed", unit: "rpm", digits: 0 },
  { key: "operating_hours", label: "Operating hours", unit: "h", digits: 1 },
];

export const fieldLabel = (key) => FIELDS.find((f) => f.key === key)?.label ?? key;

export const pct = (score) => (score == null ? null : `${Math.round(score * 100)}%`);

export const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "";

export const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

export const fmtValue = (field, v) => (v == null ? "missing" : `${Number(v).toFixed(field.digits)} ${field.unit}`);
