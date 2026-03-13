export default function PlanModal({ form, setForm, onSave, onClose }) {
  const total = form.groups.reduce((s, g) => s + (parseFloat(g.pct) || 0), 0);

  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="mtitle">Criar Plano</div>
        <div className="msub">
          Os grupos devem somar exatamente 100% da sua renda
        </div>

        <div className="field">
          <label className="flbl">Nome do Plano</label>
          <input
            className="finp"
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
                className="finp"
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
                  className="pinp"
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

        <div className="pct-bar" style={{ marginBottom: 16 }}>
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

        <button className="btnp" onClick={onSave}>
          ✓ Criar Plano
        </button>
        <button className="btng" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
