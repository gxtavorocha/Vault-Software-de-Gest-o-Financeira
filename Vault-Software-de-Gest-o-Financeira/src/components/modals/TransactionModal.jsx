import { PAYMENT_METHODS, PAYMENT_METHODS_RECEIPTS } from "../../constants";
import { MdOutlineAccessTime } from "react-icons/md";
import { IoWarningOutline } from "react-icons/io5";
import styles from "./Modal.module.css";

export default function TransactionModal({
  form,
  setForm,
  categories,
  cards,
  isEditing,
  onSave,
  onClose,
}) {
  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal}>
        <div className={styles.modalInner} />
        <div className={styles.title}>
          {isEditing ? "Editar Lançamento" : "Nova Transação"}
        </div>
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn}${form.type === "expense" ? ` ${styles.tabBtnExpense}` : ""}`}
            onClick={() => setForm((f) => ({ ...f, type: "expense" }))}
          >
            Despesa
          </button>
          <button
            className={`${styles.tabBtn}${form.type === "income" ? ` ${styles.tabBtnIncome}` : ""}`}
            onClick={() => setForm((f) => ({ ...f, type: "income" }))}
          >
            Receita
          </button>
          <button
            className={`${styles.tabBtn}${form.type === "investment" ? ` ${styles.tabBtnInvestment}` : ""}`}
            onClick={() => setForm((f) => ({ ...f, type: "investment" }))}
          >
            Investimento
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Descrição</label>
          <input
            className={styles.input}
            placeholder="Ex: Aluguel, Salário..."
            value={form.desc}
            onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
          />
        </div>

        <div className={styles.grid2} style={{ marginBottom: 15 }}>
          <div className={styles.field} style={{ margin: 0 }}>
            <label className={styles.label}>Valor (R$)</label>
            <input
              className={styles.input}
              type="number"
              placeholder="0,00"
              value={form.value}
              onChange={(e) =>
                setForm((f) => ({ ...f, value: e.target.value }))
              }
            />
          </div>
          <div className={styles.field} style={{ margin: 0 }}>
            <label className={styles.label}>Data</label>
            <input
              className={styles.input}
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Categoria</label>
          <select
            className={styles.input}
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
          >
            {categories.map((c) => (
              // Nota: <option> é HTML puro e não aceita componentes React como ícones.
              // Exibe apenas o label da categoria.
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

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
                  className={`${styles.selectionBtn}${form.paymentMethod === value ? ` ${styles.selectionBtnOk}` : ""}`}
                  onClick={() =>
                    setForm((f) => ({ ...f, paymentMethod: value }))
                  }
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                  type="button"
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {(form.paymentMethod === "credito" ||
          form.paymentMethod === "debito") && (
          <div className={styles.field}>
            <label className={styles.label}>Cartão</label>
            {cards.length === 0 ? (
              <div className={styles.infoNote}>
                Nenhum cartão cadastrado. Adicione um na aba Cartões.
              </div>
            ) : (
              <select
                className={styles.input}
                value={form.cardId || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cardId: e.target.value }))
                }
              >
                <option value="">Selecione o cartão...</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name} •••• {card.digits}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {form.type === "income" && (
          <div className={styles.field}>
            <label className={styles.label}>Status do Recebimento</label>
            <div className={styles.selectionRow}>
              <button
                className={`${styles.selectionBtn}${form.received !== false ? ` ${styles.selectionBtnOk}` : ""}`}
                onClick={() => setForm((f) => ({ ...f, received: true }))}
              >
                Recebido
              </button>
              <button
                className={`${styles.selectionBtn}${form.received === false ? ` ${styles.selectionBtnPending}` : ""}`}
                onClick={() => setForm((f) => ({ ...f, received: false }))}
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

        {form.type === "expense" && (
          <div className={styles.field}>
            <label className={styles.label}>Status do Pagamento</label>
            <div className={styles.selectionRow}>
              <button
                className={`${styles.selectionBtn}${form.paid === true ? ` ${styles.selectionBtnOk}` : ""}`}
                onClick={() => setForm((f) => ({ ...f, paid: true }))}
              >
                Pago
              </button>
              <button
                className={`${styles.selectionBtn}${form.paid === false ? ` ${styles.selectionBtnPending}` : ""}`}
                onClick={() => setForm((f) => ({ ...f, paid: false }))}
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

        <button className={styles.btnPrimary} onClick={onSave}>
          {isEditing ? "Salvar Alterações" : "Adicionar Transação"}
        </button>
        <button className={styles.btnSecondary} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}