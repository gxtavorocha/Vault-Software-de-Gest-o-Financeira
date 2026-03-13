export default function RadialProgress({
  pct,
  size = 64,
  color = "#E8B86D",
  trackColor = "rgba(255,255,255,0.06)",
}) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ;

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)", display: "block" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={trackColor}
        strokeWidth="5"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{
          transition: "stroke-dasharray 1s cubic-bezier(.4,0,.2,1)",
          filter: `drop-shadow(0 0 5px ${color}99)`,
        }}
      />
    </svg>
  );
}
