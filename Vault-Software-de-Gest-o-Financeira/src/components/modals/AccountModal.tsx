// @ts-nocheck
import { useState } from "react";
import { BANK_CARDS } from "../../constants";
import { useFormValidation } from "../../hooks/useFormValidation";
import styles from "./Modal.module.css";
import { RiBankLine } from "react-icons/ri";
import CustomSelect from "../ui/CustomSelect";

function FieldError({ message }) {
  if (!message) return null;
  return <div className={styles.fieldError}>⚠ {message}</div>;
}

export default function AccountModal({
  initialForm,
  isEditing,
  onSave,
  onClose,
}) {
  const [form, setForm] = useState(initialForm);
  const { errors, setErrors, clearField } = useFormValidation();

  const bank = BANK_CARDS[form.gradIdx] || BANK_CARDS[0];

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    clearField(field);
  };

  const handleSave = () => {
    // Validação Manual Curta
    const errs = {};
    if (!form.type) errs.type = "Tipo é obrigatório.";
    
    if (Object.keys(errs).length > 0) {
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
        <div className={styles.title}>
          {isEditing ? "Editar Conta Bancária" : "Nova Conta Bancária"}
        </div>
        <div className={styles.subtitle}>
          Vincule uma conta para depositar e debitar suas transações automaticamente
        </div>

        {/* Preview do Cartão da Conta */}
        <div
          style={{
            borderRadius: 16,
            padding: "20px 22px",
            marginBottom: 20,
            background: `linear-gradient(135deg,${bank.colors[0]},${bank.colors[1]})`,
            position: "relative",
            overflow: "hidden",
            height: 156, /* Fixa a altura do cartão para parecer físico */
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: bank.textColor,
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
              pointerEvents: "none",
            }}
          />
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
            <div
              style={{
                fontSize: 14,
                opacity: 0.95,
                fontWeight: 800,
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {bank.domain && (
                <img 
                  src={`https://www.google.com/s2/favicons?domain=${bank.domain}&sz=64`} 
                  alt={bank.name} 
                  style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'contain', backgroundColor: "#fff", padding: 2 }} 
                />
              )}
              {bank.name}
            </div>
            <RiBankLine size={28} style={{ opacity: 0.85 }} />
          </div>

          <div style={{ position: "relative" }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "1px",
                opacity: 0.85,
                marginBottom: 4,
              }}
            >
              Conta {form.type}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                opacity: form.name ? 1 : 0.6,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {form.name || "Conta Principal"}
            </div>
          </div>
        </div>

        {/* Instituição Financeira Pickup */}
        <div className={styles.field}>
          <label className={styles.label}>Instituição Bancária</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", maxHeight: 110, overflowY: "auto", paddingRight: 4 }}>
            {BANK_CARDS.map((b, i) => {
              if (b.name.toLowerCase().includes("genérico")) return null;
              
              return (
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
                      style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'contain', backgroundColor: "#fff", padding: 1, marginRight: 6 }} 
                    />
                  )}
                  {b.name}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.grid2} style={{ marginBottom: 15, alignItems: "flex-end" }}>
          {/* Nome Interno */}
          <div className={styles.field} style={{ margin: 0 }}>
            <label className={styles.label}>Apelido (Opcional)</label>
            <input
              className={styles.input}
              placeholder={`Ex: Minha Conta ${bank.name}`}
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div className={styles.field} style={{ margin: 0, position: "relative" }}>
            <label className={styles.label}>Tipo da Conta</label>
            <CustomSelect
              value={form.type}
              onChange={(val) => handleChange("type", val)}
              options={[
                { value: "Corrente", label: "Conta Corrente" },
                { value: "Poupança", label: "Poupança" },
                { value: "Investimento", label: "Corretora / Investimentos" }
              ]}
            />
          </div>
        </div>

        {/* Saldo Base */}
        <div className={styles.field}>
          <label className={styles.label}>Saldo Inicial (R$)</label>
          <input
            className={`${styles.input}`}
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={form.balance}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.,]/g, "").replace(",", ".");
              handleChange("balance", val);
            }}
          />
          <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 6, opacity: 0.8 }}>
            Quanto você tem armazenado agora fisicamente? Entradas e saídas de suas transações recairão sobre este somatório para compor o Saldo final ao vivo.
          </div>
        </div>

        <button className={styles.btnPrimary} onClick={handleSave}>
          {isEditing ? "Salvar Alterações" : "Criar Conta Bancária"}
        </button>
        <button className={styles.btnSecondary} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
