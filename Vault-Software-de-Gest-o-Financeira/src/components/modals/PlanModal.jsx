import styles from "./Modal.module.css";

export default function PlanModal({ form, setForm, onSave, onClose }) {
  const total = form.groups.reduce((s, g) => s + (parseFloat(g.pct) || 0), 0);

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal}>
        <div className={styles.modalInner} />
        <div className={styles.title}>Criar Plano</div>
        <div className={styles.subtitle}>
          Os grupos devem somar exatamente 100% da sua renda
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Nome do Plano</label>
          <input
            className={styles.input}
            placeholder="Ex: Meu Plano 2026..."
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "var(--text3)",
            marginBottom: 10,
          }}
        >
          Grupos de Orçamento
        </div>

        {form.groups.map((g, i) => (
          <div
            key={i}
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px",
                gap: 10,
              }}
            >
              <input
                className={styles.input}
                style={{ padding: "8px 12px", fontSize: 13 }}
                placeholder="Nome do grupo"
                value={g.label}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    groups: f.groups.map((gg, ii) =>
                      ii === i ? { ...gg, label: e.target.value } : gg,
                    ),
                  }))
                }
              />
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  className={styles.percentInput}
                  type="number"
                  min="0"
                  max="100"
                  placeholder="%"
                  value={g.pct || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      groups: f.groups.map((gg, ii) =>
                        ii === i
                          ? { ...gg, pct: parseFloat(e.target.value) || 0 }
                          : gg,
                      ),
                    }))
                  }
                />
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text3)",
                    fontWeight: 600,
                  }}
                >
                  %
                </span>
              </div>
            </div>
          </div>
        ))}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 14px",
            borderRadius: 12,
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            marginBottom: 8,
          }}
        >
          <span
            style={{ fontSize: 12, color: "var(--text3)", fontWeight: 600 }}
          >
            Total
          </span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color:
                Math.abs(total - 100) < 0.5
                  ? "var(--green)"
                  : total > 100
                    ? "var(--red)"
                    : "var(--gold)",
            }}
          >
            {total.toFixed(0)}% / 100%
          </span>
        </div>

        <div className={styles.progressBar} style={{ marginBottom: 16 }}>
          <div
            style={{
              height: "100%",
              width: `${Math.min(total, 100)}%`,
              background: total > 100 ? "var(--red)" : "var(--gold)",
              borderRadius: 99,
              transition: "width 0.3s",
            }}
          />
        </div>

        <button className={styles.btnPrimary} onClick={onSave}>
          ✓ Criar Plano
        </button>
        <button className={styles.btnSecondary} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
