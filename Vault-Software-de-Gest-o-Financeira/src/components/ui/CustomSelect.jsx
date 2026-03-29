import { useState } from "react";
import styles from "../modals/Modal.module.css";

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  hasError = false,
  errorClass = "",
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Find the selected option to display its label, or fallback to placeholder
  const selectedOpt = options.find((o) => String(o.value) === String(value));
  const displayLabel = selectedOpt ? selectedOpt.label : <span style={{ opacity: 0.6 }}>{placeholder}</span>;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        className={`${styles.input}${hasError ? ` ${errorClass}` : ""}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
          fontSize: 13,
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {displayLabel}
        <span style={{ opacity: 0.5, fontSize: 10 }}>▼</span>
      </div>

      {isOpen && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
            onClick={() => setIsOpen(false)}
          />
          <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: 6,
                background: "var(--glass-bg-strong)",
                backgroundColor: "var(--bg)", /* Fundo mais sólido para evitar transparência excessiva */
                backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: "1px solid var(--glass-border)",
                borderRadius: 12,
                padding: 8,
                zIndex: 100,
                boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                maxHeight: 220,
                overflowY: "auto",
              }}
          >
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: isSelected ? "var(--select-accent)" : "transparent",
                    color: isSelected ? "#fff" : "var(--text)",
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: 13,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "var(--surface3)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {opt.label}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
