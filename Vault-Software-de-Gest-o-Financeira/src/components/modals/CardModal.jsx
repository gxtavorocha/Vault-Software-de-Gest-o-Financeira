import { useState } from "react";
import { BANK_CARDS } from "../../constants";
import { validateCard, isValid } from "../../utils/validators";
import { useFormValidation } from "../../hooks/useFormValidation";
import styles from "./Modal.module.css";
import { RiMastercardFill, RiVisaLine } from "react-icons/ri";
import CustomSelect from "../ui/CustomSelect";
import { GrAmex } from "react-icons/gr";

const FLAGS = ["Visa", "Mastercard", "American Express"];
const FLAGS_ICONS = {
  Visa: <RiVisaLine size={52} />,
  Mastercard: <RiMastercardFill size={52} />,
  "American Express": <GrAmex size={42} style={{ borderRadius: 6 }} />,
};

// ── Componente auxiliar de erro inline ─────────────────────────────────────
function FieldError({ message }) {
  if (!message) return null;
  return <div className={styles.fieldError}>⚠ {message}</div>;
}

export default function CardModal({
  initialForm,
  isEditing,
  onSave,
  onClose,
}) {
  const [form, setForm] = useState(initialForm);
  const { errors, setErrors, clearField } = useFormValidation();

  // Garante que pegamos um banco válido ou o Nubank/0 de fallback
  const bank = BANK_CARDS[form.gradIdx] || BANK_CARDS[0];

  // Ao digitar, limpa o erro do campo correspondente
  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    clearField(field);
  };

  const handleSave = () => {
    const errs = validateCard(form);
    if (!isValid(errs)) {
      setErrors(errs);
      return;
    }
    onSave(form);
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal}>
        <div className={styles.modalInner} />
        <div className={styles.title}>
          {isEditing ? "Editar Cartão" : "Novo Cartão"}
        </div>

        <div className={styles.subtitle}>
          {isEditing
            ? "Atualize os dados do seu cartão"
            : "Adicione um cartão de crédito ou débito"}
        </div>

        {/* Preview do cartão */}
        <div
          style={{
            borderRadius: 16,
            padding: "20px 22px",
            marginBottom: 20,
            background: `linear-gradient(135deg,${bank.colors[0]},${bank.colors[1]})`,
            position: "relative",
            overflow: "hidden",
            minHeight: 160,
            color: bank.textColor, // Fonte preta para cartões dourados
            border: bank.border || "none",
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: bank.textColor === "#ffffff" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
            }}
          />
          <div
            style={{
              fontSize: 14,
              opacity: 0.9,
              marginBottom: 3,
              fontWeight: 800,
              letterSpacing: "0.5px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {bank.domain && (
              <img 
                src={`https://www.google.com/s2/favicons?domain=${bank.domain}&sz=64`} 
                alt={bank.name} 
                style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'contain', backgroundColor: '#fff', padding: 2 }} 
              />
            )}
            {bank.name}
            {FLAGS_ICONS[form.flag] && (
              <span
                style={{
                  position: "absolute",
                  top: 14,
                  right: 18,
                  lineHeight: 1,
                  color: bank.textColor,
                  opacity: 0.95,
                }}
              >
                {FLAGS_ICONS[form.flag]}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              marginBottom: 10,
              opacity: form.name ? 1 : 0.45,
            }}
          >
            {form.name || "Nome do cartão"}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "2px",
                opacity: 0.85,
              }}
            >
              •••• •••• •••• {form.digits || "0000"}
            </div>
            <div style={{ textAlign: "right", fontSize: 10, opacity: 0.65 }}>
              {form.due && <div>Vence dia {form.due}</div>}
            </div>
          </div>
        </div>

        {/* Color picker */}
        <div className={styles.field}>
          <label className={styles.label}>Instituição Financeira</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", maxHeight: 110, overflowY: "auto", paddingRight: 4 }}>
            {BANK_CARDS.map((b, i) => (
              <div
                key={i}
                onClick={() => setForm((f) => ({ ...f, gradIdx: i }))}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  cursor: "pointer",
                  background: `linear-gradient(135deg,${b.colors[0]},${b.colors[1]})`,
                  border:
                    form.gradIdx === i
                      ? "2px solid var(--primary)"
                      : "2px solid transparent",
                  color: b.textColor,
                  fontSize: 12,
                  fontWeight: 600,
                  boxShadow:
                    form.gradIdx === i
                      ? "0 0 0 2px rgba(255,255,255,0.1)"
                      : "none",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {b.domain && (
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${b.domain}&sz=64`} 
                    alt={b.name} 
                    style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'contain', backgroundColor: '#fff', padding: 1, marginRight: 6 }} 
                  />
                )}
                {b.name}
              </div>
            ))}
          </div>
        </div>

        {/* Nome */}
        <div className={styles.field}>
          <label className={styles.label}>Nome do Cartão</label>
          <input
            className={`${styles.input}${errors.name ? ` ${styles.inputError}` : ""}`}
            placeholder="Ex: Nubank Ultravioleta, Itaú Platinum..."
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <FieldError message={errors.name} />
        </div>

        {/* Dígitos + Bandeira */}
        <div className={styles.grid2} style={{ marginBottom: 15 }}>
          <div className={styles.field} style={{ margin: 0 }}>
            <label className={styles.label}>Últimos 4 Dígitos</label>
            <input
              className={`${styles.input}${errors.digits ? ` ${styles.inputError}` : ""}`}
              placeholder="0000"
              maxLength={4}
              value={form.digits}
              onChange={(e) =>
                handleChange("digits", e.target.value.replace(/\D/g, "").slice(0, 4))
              }
            />
            <FieldError message={errors.digits} />
          </div>
          <div className={styles.field} style={{ margin: 0 }}>
            <label className={styles.label}>Bandeira</label>
            <CustomSelect
              value={form.flag}
              onChange={(val) => handleChange("flag", val)}
              options={FLAGS.map((fl) => ({ value: fl, label: fl }))}
            />
          </div>
        </div>

        {/* Limite + Fatura */}
        <div className={styles.grid2} style={{ marginBottom: 15 }}>
          <div className={styles.field} style={{ margin: 0 }}>
            <label className={styles.label}>Limite (R$)</label>
            <input
              className={`${styles.input}${errors.limit ? ` ${styles.inputError}` : ""}`}
              type="number"
              placeholder="10000"
              value={form.limit}
              onChange={(e) => handleChange("limit", e.target.value)}
            />
            <FieldError message={errors.limit} />
          </div>
          <div className={styles.field} style={{ margin: 0 }}>
            <label className={styles.label}>Fatura Atual (R$)</label>
            <input
              className={styles.input}
              type="number"
              placeholder="0"
              value={form.balance}
              onChange={(e) => handleChange("balance", e.target.value)}
            />
          </div>
        </div>

        {/* Vencimento */}
        <div className={styles.field}>
          <label className={styles.label}>Dia do Vencimento</label>
          <input
            className={`${styles.input}${errors.due ? ` ${styles.inputError}` : ""}`}
            placeholder="Ex: 15"
            maxLength={2}
            value={form.due}
            onChange={(e) =>
              handleChange("due", e.target.value.replace(/\D/g, "").slice(0, 2))
            }
          />
          <FieldError message={errors.due} />
        </div>

        <button className={styles.btnPrimary} onClick={handleSave}>
          {isEditing ? "Salvar Alterações" : "Adicionar Cartão"}
        </button>
        <button className={styles.btnSecondary} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
