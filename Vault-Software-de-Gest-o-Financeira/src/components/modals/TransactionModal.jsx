import { useState } from "react";
import { PAYMENT_METHODS, PAYMENT_METHODS_RECEIPTS } from "../../constants";
import { MdOutlineAccessTime } from "react-icons/md";
import { IoWarningOutline } from "react-icons/io5";
import { validateTransaction, isValid } from "../../utils/validators";
import { useFormValidation } from "../../hooks/useFormValidation";
import styles from "./Modal.module.css";
import CustomSelect from "../ui/CustomSelect";
import { useFinance } from "../../context/FinanceContext";
import { fmt } from "../../utils/format";

// ── Componente auxiliar de erro inline ─────────────────────────────────────
function FieldError({ message }) {
  if (!message) return null;
  return <div className={styles.fieldError}>⚠ {message}</div>;
}

export default function TransactionModal({
  initialForm,
  categories,
  cards,
  accounts,
  isEditing,
  editingId,
  onSave,
  onClose,
}) {
  const { checkCardLimit } = useFinance();
  const [form, setForm] = useState(initialForm);
  const { errors, setErrors, clearField } = useFormValidation();

  const isCredit = form.type === "expense" && form.paymentMethod === "credito";
  const selectedCard = isCredit ? cards.find((c) => String(c.id) === String(form.cardId)) : null;
  const isOverLimit = isCredit && !!form.cardId && !checkCardLimit(form, isEditing ? editingId : null);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    clearField(field);
  };

  const handleSave = () => {
    // Inject required check for accountId:
    const requiresAccount =
      form.type === "income" ||
      form.type === "investment" ||
      (form.type === "expense" && form.paymentMethod !== "credito");

    const errs = validateTransaction(form);
    
    if (requiresAccount && !form.accountId) {
      errs.accountId = "A seleção de uma conta bancária é obrigatória.";
    }

    if (!isValid(errs)) {
      setErrors(errs);
      return;
    }
    const extErrs = onSave(form);
    if (extErrs) {
      setErrors(extErrs);
    }
  };

  const requiresAccount =
      form.type === "income" ||
      form.type === "investment" ||
      (form.type === "expense" && form.paymentMethod !== "credito");

  const isBlockedByAccounts = requiresAccount && (!accounts || accounts.length === 0);

  return (
    <div
      className={styles.overlay}
    >
      <div className={styles.modal}>
        <div className={styles.modalInner} />
        <div className={styles.title}>
          {isEditing ? "Editar Lançamento" : "Nova Transação"}
        </div>
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn}${form.type === "expense" ? ` ${styles.tabBtnExpense}` : ""}`}
            onClick={() => handleChange("type", "expense")}
          >
            Despesa
          </button>
          <button
            className={`${styles.tabBtn}${form.type === "income" ? ` ${styles.tabBtnIncome}` : ""}`}
            onClick={() => handleChange("type", "income")}
          >
            Receita
          </button>
          <button
            className={`${styles.tabBtn}${form.type === "investment" ? ` ${styles.tabBtnInvestment}` : ""}`}
            onClick={() => handleChange("type", "investment")}
          >
            Investimento
          </button>
        </div>

        {/* Descrição */}
        <div className={styles.field}>
          <label className={styles.label}>Descrição</label>
          <input
            className={`${styles.input}${errors.desc ? ` ${styles.inputError}` : ""}`}
            placeholder="Ex: Aluguel, Salário..."
            value={form.desc}
            onChange={(e) => handleChange("desc", e.target.value)}
          />
          <FieldError message={errors.desc} />
        </div>

        {/* Valor + Data */}
        <div className={styles.grid2} style={{ marginBottom: 15 }}>
          <div className={styles.field} style={{ margin: 0 }}>
            <label className={styles.label}>Valor (R$)</label>
            <input
              className={`${styles.input}${errors.value ? ` ${styles.inputError}` : ""}`}
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={form.value}
              onChange={(e) => {
                // Permite números, vírgula e ponto
                const val = e.target.value.replace(/[^0-9.,]/g, "").replace(",", ".");
                handleChange("value", val);
              }}
            />
            <FieldError message={errors.value} />
          </div>
          <div className={styles.field} style={{ margin: 0 }}>
            <label className={styles.label}>Data</label>
            <input
              className={`${styles.input}${errors.date ? ` ${styles.inputError}` : ""}`}
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
            <FieldError message={errors.date} />
          </div>
        </div>

        {/* Categoria */}
        <div className={styles.field}>
          <label className={styles.label}>Categoria</label>
          <CustomSelect
            value={form.category}
            onChange={(val) => handleChange("category", val)}
            options={categories.map((c) => ({ value: c.id, label: c.label }))}
          />
        </div>

        {/* Forma de pagamento */}
        {(form.type === "expense" || form.type === "income") && (
          <div className={styles.field}>
            <label className={styles.label}>
              {form.type === "expense"
                ? "Forma de Pagamento"
                : "Forma de Recebimento"}
            </label>
            <div className={styles.selectionRow} style={{ flexWrap: "wrap", gap: 8 }}>
              {(form.type === "expense"
                ? PAYMENT_METHODS
                : PAYMENT_METHODS_RECEIPTS
              ).map(({ value, label, Icon }) => (
                <button
                  key={value}
                  className={`${styles.selectionBtn}${form.paymentMethod === value ? ` ${styles.selectionBtnOk}` : ""}${errors.paymentMethod ? ` ${styles.selectionError}` : ""}`}
                  onClick={() => handleChange("paymentMethod", value)}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                  type="button"
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
            <FieldError message={errors.paymentMethod} />
          </div>
        )}

        {/* Seleção de Cartão */}
        {(form.paymentMethod === "credito" ||
          form.paymentMethod === "debito") && (
          <div className={styles.field}>
            <label className={styles.label}>Cartão Físico Selecionado</label>
            {cards.length === 0 ? (
              <div className={styles.infoNote}>
                Nenhum cartão cadastrado. Adicione um na aba Cartões.
              </div>
            ) : (
              <>
                <CustomSelect
                  value={form.cardId || ""}
                  onChange={(val) => handleChange("cardId", val)}
                  hasError={!!errors.cardId}
                  errorClass={styles.inputError}
                  placeholder="Selecione o cartão..."
                  options={cards.map((card) => ({
                    value: card.id,
                    label: `${card.name} •••• ${card.digits}`
                  }))}
                />
                <FieldError message={errors.cardId} />
              </>
            )}
          </div>
        )}

        {/* Seleção de Conta Bancária */}
        {requiresAccount && (
          <div className={styles.field}>
            <label className={styles.label}>Conta Bancária (Origem/Destino)</label>
            {isBlockedByAccounts ? (
              <div className={styles.infoNote} style={{ background: "rgba(220, 38, 38, 0.15)", color: "var(--red)", border: "1px solid rgba(220, 38, 38, 0.3)" }}>
                <strong>⚠ Atenção:</strong> Nenhuma conta cadastrada. Você não poderá salvar esta transação até adicionar uma Conta Bancária lá na aba Contas.
              </div>
            ) : (
              <>
                <CustomSelect
                  value={form.accountId || ""}
                  onChange={(val) => handleChange("accountId", val)}
                  hasError={!!errors.accountId}
                  errorClass={styles.inputError}
                  placeholder="Selecione a conta..."
                  options={accounts.map((acc) => ({
                    value: acc.id,
                    label: `Conta ${acc.type} - ${acc.name}`
                  }))}
                />
                <FieldError message={errors.accountId} />
              </>
            )}
          </div>
        )}

        {/* Status de Recebimento (income) */}
        {form.type === "income" && (
          <div className={styles.field}>
            <label className={styles.label}>Status do Recebimento</label>
            <div className={styles.selectionRow}>
              <button
                className={`${styles.selectionBtn}${form.received !== false ? ` ${styles.selectionBtnOk}` : ""}`}
                onClick={() => handleChange("received", true)}
              >
                Recebido
              </button>
              <button
                className={`${styles.selectionBtn}${form.received === false ? ` ${styles.selectionBtnPending}` : ""}`}
                onClick={() => handleChange("received", false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                À Receber <MdOutlineAccessTime size={16} />
              </button>
            </div>
            {form.received === false && (
              <div
                className={styles.infoNote}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <IoWarningOutline size={16} style={{ flexShrink: 0 }} />
                <span>
                  Não será contabilizado no saldo até ser marcado como
                  recebido.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Status de Pagamento (expense) */}
        {form.type === "expense" && (
          <div className={styles.field}>
            <label className={styles.label}>Status do Pagamento</label>
            <div className={styles.selectionRow}>
              <button
                className={`${styles.selectionBtn}${form.paid === true ? ` ${styles.selectionBtnOk}` : ""}`}
                onClick={() => handleChange("paid", true)}
              >
                Pago
              </button>
              <button
                className={`${styles.selectionBtn}${form.paid === false ? ` ${styles.selectionBtnPending}` : ""}`}
                onClick={() => handleChange("paid", false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                Pendente de Pagamento <MdOutlineAccessTime size={16} />
              </button>
            </div>
            {form.paid === false && (
              <div
                className={styles.infoNote}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <IoWarningOutline size={16} style={{ flexShrink: 0 }} />
                <span>
                  Não será contabilizado no saldo até ser marcado como pago.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Alerta de Limite Excedido */}
        {isOverLimit && selectedCard && (
          <div className={styles.limitWarning}>
            <IoWarningOutline size={20} style={{ flexShrink: 0 }} />
            <div>
              O valor excede o limite deste cartão. <br />
              Limite restante: <b>{fmt(selectedCard.available)}</b>
            </div>
          </div>
        )}

        {/* Erro de limite de cartão */}
        <FieldError message={errors.cardLimit} />

        <button 
          className={`${styles.btnPrimary}${isBlockedByAccounts || isOverLimit ? ` ${styles.btnDisabled}` : ""}`} 
          onClick={handleSave}
          disabled={isBlockedByAccounts || isOverLimit}
          style={isBlockedByAccounts || isOverLimit ? { cursor: "not-allowed" } : {}}
        >
          {isEditing ? "Salvar Alterações" : "Adicionar Transação"}
        </button>
        <button className={styles.btnSecondary} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}