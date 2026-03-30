import { useState } from "react";
import { validatePlan, isValid } from "../../utils/validators";
import { useFormValidation } from "../../hooks/useFormValidation";
import styles from "./Modal.module.css";

// ── Componente auxiliar de erro inline ─────────────────────────────────────
function FieldError({ message }) {
  if (!message) return null;
  return <div className={styles.fieldError}>⚠ {message}</div>;
}

export default function PlanModal({ initialForm, onSave, onClose }) {
  const [form, setForm] = useState(initialForm);
  const { errors, setErrors, clearField } = useFormValidation();

  const total = form.groups.reduce((s, g) => s + (parseFloat(g.pct) || 0), 0);

  const handleNameChange = (e) => {
    setForm((f) => ({ ...f, name: e.target.value }));
    clearField("name");
  };

  const handleGroupLabelChange = (i, value) => {
    setForm((f) => ({
      ...f,
      groups: f.groups.map((gg, ii) =>
        ii === i ? { ...gg, label: value } : gg,
      ),
    }));
    clearField(`group_${i}`);
  };

  const handleGroupPctChange = (i, value) => {
    setForm((f) => ({
      ...f,
      groups: f.groups.map((gg, ii) =>
        ii === i ? { ...gg, pct: parseFloat(value) || 0 } : gg,
      ),
    }));
    clearField("total");
  };

  const handleSave = () => {
    const errs = validatePlan(form);
    if (!isValid(errs)) {
      setErrors(errs);
      return;
    }
    onSave(form);
  };

  return (
    <div
      className={styles.overlay}
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
            className={`${styles.input}${errors.name ? ` ${styles.inputError}` : ""}`}
            placeholder="Ex: Meu Plano 2026..."
            value={form.name}
            onChange={handleNameChange}
          />
          <FieldError message={errors.name} />
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
              border: `1px solid ${errors[`group_${i}`] ? "rgba(240, 112, 112, 0.45)" : "var(--border)"}`,
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
              <div>
                <input
                  className={`${styles.input}${errors[`group_${i}`] ? ` ${styles.inputError}` : ""}`}
                  style={{ padding: "8px 12px", fontSize: 13 }}
                  placeholder="Nome do grupo"
                  value={g.label}
                  onChange={(e) => handleGroupLabelChange(i, e.target.value)}
                />
                <FieldError message={errors[`group_${i}`]} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  className={styles.percentInput}
                  type="text"
                  inputMode="numeric"
                  placeholder="%"
                  value={g.pct || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    if (val === "" || (Number(val) >= 0 && Number(val) <= 100)) {
                      handleGroupPctChange(i, val);
                    }
                  }}
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
            border: `1px solid ${errors.total ? "rgba(240, 112, 112, 0.45)" : "var(--border)"}`,
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
        <FieldError message={errors.total} />

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

        <button className={styles.btnPrimary} onClick={handleSave}>
          ✓ Criar Plano
        </button>
        <button className={styles.btnSecondary} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
