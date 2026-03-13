import { fmt } from "../utils/format";

export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#181B22",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: "10px 14px",
        fontSize: 12,
      }}
    >
      <div
        style={{
          color: "rgba(240,238,232,0.4)",
          marginBottom: 6,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      {payload.map((p, i) => (
        <div
          key={i}
          style={{ color: p.color, fontWeight: 700, marginBottom: 2 }}
        >
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
}
