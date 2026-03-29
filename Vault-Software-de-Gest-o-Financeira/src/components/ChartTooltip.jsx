import { fmt } from "../utils/format";

export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(18, 44, 54, 0.95)", // Fundo quase opaco para eliminar borrado de renderização no Dark
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1.5px solid rgba(255, 255, 255, 0.2)",
        borderRadius: 14,
        padding: "16px 20px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
        isolation: "isolate",
        pointerEvents: "none",
        zIndex: 9999,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        textRendering: "optimizeLegibility",
        transform: "translateZ(0)",
      }}
    >
      <div
        style={{
          color: "#ffffff",
          marginBottom: 12,
          fontWeight: 900,
          fontSize: 15,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {label}
      </div>
      {payload.map((p, i) => (
        <div
          key={i}
          style={{ 
            color: "#ffffff", 
            fontWeight: 800, 
            marginBottom: 6,
            fontSize: 14,
            display: "flex",
            justifyContent: "space-between",
            gap: 24,
            alignItems: "center"
          }}
        >
          <span style={{ color: "#ffffff" }}>{p.name}:</span>
          <span style={{ color: p.color || "#ffffff", filter: "brightness(1.3)" }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// Estilo específico para Light Mode via Global CSS será ignorado aqui 
// por ser inline, mas vamos forçar nitidez máxima.
