import { useEffect, useMemo, useState } from "react";
import { MdOutlineAccessTime } from "react-icons/md";
import { IoWarningOutline } from "react-icons/io5";
import { PAYMENT_METHODS, PAYMENT_METHODS_RECEIPTS } from "../../constants";
import { useFormValidation } from "../../hooks/useFormValidation";
import { validateTransaction, isValid } from "../../utils/validators";
import { useFinance } from "../../context/FinanceContext";
import { fmt } from "../../utils/format";
import type {
  Account,
  Card,
  Category,
  EntityId,
  ModalSaveResult,
  PaymentOption,
  TransactionForm,
} from "../../types/finance";
import styles from "./Modal.module.css";
import CustomSelect from "../ui/CustomSelect";

type TransactionFieldError = keyof TransactionForm | "cardLimit";

interface TransactionModalProps {
  initialForm: TransactionForm;
  categories: Category[];
  cards: Card[];
  accounts: Account[];
  isEditing: boolean;
  editingId?: EntityId | null;
  onSave: (form: TransactionForm) => ModalSaveResult<TransactionFieldError>;
  onClose: () => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <div className={styles.fieldError}>⚠ {message}</div>;
}

const requiresAccount = (
  form: Pick<TransactionForm, "type" | "paymentMethod">,
): boolean =>
  form.type === "income" ||
  form.type === "investment" ||
  (form.type === "expense" && form.paymentMethod !== "credito");

export default function TransactionModal({
  initialForm,
  categories,
  cards,
  accounts,
  isEditing,
  editingId = null,
  onSave,
  onClose,
}: TransactionModalProps) {
  const { checkCardLimit } = useFinance();
  const [form, setForm] = useState<TransactionForm>(initialForm);
  const { errors, setErrors, clearField } =
    useFormValidation<TransactionFieldError>();

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: category.id, label: category.label })),
    [categories],
  );

  const cardOptions = useMemo(
    () =>
      cards.map((card) => ({
        value: card.id,
        label: `${card.name} •••• ${card.digits}`,
      })),
    [cards],
  );

  const accountOptions = useMemo(
    () =>
      accounts.map((account) => ({
        value: account.id,
        label: `Conta ${account.type} - ${account.name}`,
      })),
    [accounts],
  );

  const paymentOptions = useMemo<PaymentOption[]>(
    () => (form.type === "expense" ? PAYMENT_METHODS : PAYMENT_METHODS_RECEIPTS),
    [form.type],
  );

  const currentRequiresAccount = requiresAccount(form);
  const isBlockedByAccounts = currentRequiresAccount && accounts.length === 0;
  const showCardSelector =
    form.paymentMethod === "credito" || form.paymentMethod === "debito";
  const isCreditExpense =
    form.type === "expense" && form.paymentMethod === "credito";
  const selectedCard = isCreditExpense
    ? cards.find((card) => String(card.id) === String(form.cardId))
    : null;
  const isOverLimit =
    isCreditExpense &&
    Boolean(form.cardId) &&
    !checkCardLimit(form, isEditing ? editingId : null);

  const handleChange = <TField extends keyof TransactionForm>(
    field: TField,
    value: TransactionForm[TField],
  ) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    clearField(field);
  };

  const handleSave = () => {
    const nextErrors = validateTransaction(form);

    if (currentRequiresAccount && !form.accountId) {
      nextErrors.accountId = "A selecao de uma conta bancaria e obrigatoria.";
    }

    if (!isValid(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    const externalErrors = onSave(form);
    if (externalErrors) {
      setErrors(externalErrors);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className={styles.modal}>
        <div className={styles.modalInner} />
        <div className={styles.title}>
          {isEditing ? "Editar Lancamento" : "Nova Transacao"}
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabBtn}${
              form.type === "expense" ? ` ${styles.tabBtnExpense}` : ""
            }`}
            onClick={() => handleChange("type", "expense")}
          >
            Despesa
          </button>
          <button
            type="button"
            className={`${styles.tabBtn}${
              form.type === "income" ? ` ${styles.tabBtnIncome}` : ""
            }`}
            onClick={() => handleChange("type", "income")}
          >
            Receita
          </button>
          <button
            type="button"
            className={`${styles.tabBtn}${
              form.type === "investment" ? ` ${styles.tabBtnInvestment}` : ""
            }`}
            onClick={() => handleChange("type", "investment")}
          >
            Investimento
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Descricao</label>
          <input
            className={`${styles.input}${errors.desc ? ` ${styles.inputError}` : ""}`}
            placeholder="Ex: Aluguel, Salario..."
            value={form.desc}
            onChange={(event) => handleChange("desc", event.target.value)}
          />
          <FieldError message={errors.desc} />
        </div>

        <div className={styles.grid2} style={{ marginBottom: 15 }}>
          <div className={styles.field} style={{ margin: 0 }}>
            <label className={styles.label}>Valor (R$)</label>
            <input
              className={`${styles.input}${errors.value ? ` ${styles.inputError}` : ""}`}
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={form.value}
              onChange={(event) => {
                const value = event.target.value
                  .replace(/[^0-9.,]/g, "")
                  .replace(",", ".");
                handleChange("value", value);
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
              onChange={(event) => handleChange("date", event.target.value)}
            />
            <FieldError message={errors.date} />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Categoria</label>
          <CustomSelect
            value={form.category}
            onChange={(value) => handleChange("category", value)}
            options={categoryOptions}
          />
        </div>

        {(form.type === "expense" || form.type === "income") && (
          <div className={styles.field}>
            <label className={styles.label}>
              {form.type === "expense"
                ? "Forma de Pagamento"
                : "Forma de Recebimento"}
            </label>

            <div className={styles.selectionRow} style={{ flexWrap: "wrap", gap: 8 }}>
              {paymentOptions.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.selectionBtn}${
                    form.paymentMethod === value ? ` ${styles.selectionBtnOk}` : ""
                  }${errors.paymentMethod ? ` ${styles.selectionError}` : ""}`}
                  onClick={() => handleChange("paymentMethod", value)}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            <FieldError message={errors.paymentMethod} />
          </div>
        )}

        {showCardSelector && (
          <div className={styles.field}>
            <label className={styles.label}>Cartao Fisico Selecionado</label>
            {cards.length === 0 ? (
              <div className={styles.infoNote}>
                Nenhum cartao cadastrado. Adicione um na aba Cartoes.
              </div>
            ) : (
              <>
                <CustomSelect
                  value={form.cardId}
                  onChange={(value) => handleChange("cardId", value)}
                  hasError={Boolean(errors.cardId)}
                  errorClass={styles.inputError}
                  placeholder="Selecione o cartao..."
                  options={cardOptions}
                />
                <FieldError message={errors.cardId} />
              </>
            )}
          </div>
        )}

        {currentRequiresAccount && (
          <div className={styles.field}>
            <label className={styles.label}>Conta Bancaria (Origem/Destino)</label>
            {isBlockedByAccounts ? (
              <div
                className={styles.infoNote}
                style={{
                  background: "rgba(220, 38, 38, 0.15)",
                  color: "var(--red)",
                  border: "1px solid rgba(220, 38, 38, 0.3)",
                }}
              >
                <strong>⚠ Atencao:</strong> Nenhuma conta cadastrada. Voce nao podera
                salvar esta transacao ate adicionar uma Conta Bancaria na aba
                Contas.
              </div>
            ) : (
              <>
                <CustomSelect
                  value={form.accountId}
                  onChange={(value) => handleChange("accountId", value)}
                  hasError={Boolean(errors.accountId)}
                  errorClass={styles.inputError}
                  placeholder="Selecione a conta..."
                  options={accountOptions}
                />
                <FieldError message={errors.accountId} />
              </>
            )}
          </div>
        )}

        {form.type === "income" && (
          <div className={styles.field}>
            <label className={styles.label}>Status do Recebimento</label>
            <div className={styles.selectionRow}>
              <button
                type="button"
                className={`${styles.selectionBtn}${
                  form.received !== false ? ` ${styles.selectionBtnOk}` : ""
                }`}
                onClick={() => handleChange("received", true)}
              >
                Recebido
              </button>
              <button
                type="button"
                className={`${styles.selectionBtn}${
                  form.received === false ? ` ${styles.selectionBtnPending}` : ""
                }`}
                onClick={() => handleChange("received", false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                A Receber <MdOutlineAccessTime size={16} />
              </button>
            </div>

            {form.received === false && (
              <div
                className={styles.infoNote}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <IoWarningOutline size={16} style={{ flexShrink: 0 }} />
                <span>Nao sera contabilizado no saldo ate ser marcado como recebido.</span>
              </div>
            )}
          </div>
        )}

        {form.type === "expense" && (
          <div className={styles.field}>
            <label className={styles.label}>Status do Pagamento</label>
            <div className={styles.selectionRow}>
              <button
                type="button"
                className={`${styles.selectionBtn}${
                  form.paid === true ? ` ${styles.selectionBtnOk}` : ""
                }`}
                onClick={() => handleChange("paid", true)}
              >
                Pago
              </button>
              <button
                type="button"
                className={`${styles.selectionBtn}${
                  form.paid === false ? ` ${styles.selectionBtnPending}` : ""
                }`}
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
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <IoWarningOutline size={16} style={{ flexShrink: 0 }} />
                <span>Nao sera contabilizado no saldo ate ser marcado como pago.</span>
              </div>
            )}
          </div>
        )}

        {form.type === "investment" && (
          <div className={styles.field}>
            <label className={styles.label}>Status do Investimento</label>
            <div className={styles.selectionRow}>
              <button
                type="button"
                className={`${styles.selectionBtn}${
                  form.paid === true ? ` ${styles.selectionBtnOk}` : ""
                }`}
                onClick={() => handleChange("paid", true)}
              >
                Aplicado
              </button>
              <button
                type="button"
                className={`${styles.selectionBtn}${
                  form.paid === false ? ` ${styles.selectionBtnPending}` : ""
                }`}
                onClick={() => handleChange("paid", false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                Pendente <MdOutlineAccessTime size={16} />
              </button>
            </div>
          </div>
        )}

        {isOverLimit && selectedCard && (
          <div className={styles.limitWarning}>
            <IoWarningOutline size={20} style={{ flexShrink: 0 }} />
            <div>
              O valor excede o limite deste cartao.
              <br />
              Limite restante: <b>{fmt(selectedCard.available)}</b>
            </div>
          </div>
        )}

        <FieldError message={errors.cardLimit} />

        <button
          className={`${styles.btnPrimary}${
            isBlockedByAccounts || isOverLimit ? ` ${styles.btnDisabled}` : ""
          }`}
          onClick={handleSave}
          disabled={isBlockedByAccounts || isOverLimit}
          style={
            isBlockedByAccounts || isOverLimit
              ? { cursor: "not-allowed" }
              : {}
          }
        >
          {isEditing ? "Salvar Alteracoes" : "Adicionar Transacao"}
        </button>
        <button className={styles.btnSecondary} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
