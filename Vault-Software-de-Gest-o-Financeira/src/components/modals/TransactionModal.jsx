import { PAYMENT_METHODS } from "../../constants";
import { MdOutlineAccessTime } from "react-icons/md";
import { IoWarningOutline } from "react-icons/io5";
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
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="mtitle">
          {isEditing ? "Editar Lançamento" : "Nova Transação"}
        </div>
        <div className="tt">
          <button
            className={`tbtn${form.type === "expense" ? " exp" : ""}`}
            onClick={() => setForm((f) => ({ ...f, type: "expense" }))}
          >
            {" "}
            Despesa
          </button>
          <button
            className={`tbtn${form.type === "income" ? " inc" : ""}`}
            onClick={() => setForm((f) => ({ ...f, type: "income" }))}
          >
            {" "}
            Receita
          </button>
          <button
            className={`tbtn${form.type === "investment" ? " inv" : ""}`}
            onClick={() => setForm((f) => ({ ...f, type: "investment" }))}
          >
            {" "}
            Investimento
          </button>
        </div>

        <div className="field">
          <label className="flbl">Descrição</label>
          <input
            className="finp"
            placeholder="Ex: Aluguel, Salário..."
            value={form.desc}
            onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
          />
        </div>

        <div className="r2" style={{ marginBottom: 15 }}>
          <div className="field" style={{ margin: 0 }}>
            <label className="flbl">Valor (R$)</label>
            <input
              className="finp"
              type="number"
              placeholder="0,00"
              value={form.value}
              onChange={(e) =>
                setForm((f) => ({ ...f, value: e.target.value }))
              }
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label className="flbl">Data</label>
            <input
              className="finp"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
        </div>

        <div className="field">
          <label className="flbl">Categoria</label>
          <select
            className="finp"
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </div>
        
        {(form.type === "expense" || form.type === "income") && (  
        <div className="field">
          <label className="flbl">
            {form.type === "expense" ? "Forma de Pagamento" : "Forma de Recebimento"}
          </label>
          <div className="sr" style={{ flexWrap: "wrap", gap: 8 }}>
            
            {(form.type === "expense"  ? PAYMENT_METHODS : PAYMENT_METHODS_INCOMES).map(({value,label,Icon}) =>(
              <button
                key={value}
                className={`sbt${form.paymentMethod === value ? " ok" : ""}`}
                onClick={() => setForm((f) => ({ ...f, paymentMethod: value }))}
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
          <div className="field">
            <label className="flbl">Cartão</label>
            {cards.length === 0 ? (
              <div className="inote">
                Nenhum cartão cadastrado. Adicione um na aba Cartões.
              </div>
            ) : (
              <select
                className="finp"
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
          <div className="field">
            <label className="flbl">Status do Recebimento</label>
            <div className="sr">
              <button
                className={`sbt${form.received !== false ? " ok" : ""}`}
                onClick={() => setForm((f) => ({ ...f, received: true }))}
              >
               Recebido 
              </button>
              <button
                className={`sbt${form.received === false ? " pnd" : ""}`}
                onClick={() => setForm((f) => ({ ...f, received: false }))}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
               À Receber <MdOutlineAccessTime size={16} />
              </button>
            </div>
            {form.received === false && (
              <div className="inote"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                
                <IoWarningOutline  size={16} style={{flexShrink:0}}/> 
                <span>Não será contabilizado no saldo até ser marcado como recebido.</span>
              </div>
            )}
          </div>
        )}

        {form.type === "expense" && (
          <div className="field">
            <label className="flbl">Status do Pagamento</label>
            <div className="sr">
              <button
                className={`sbt${form.paid === true ? " ok" : ""}`}
                onClick={() => setForm((f) => ({ ...f, paid: true }))}
              >
               Pago 
              </button>
              <button
                className={`sbt${form.paid === false ? " pnd" : ""}`}
                onClick={() => setForm((f) => ({ ...f, paid: false }))}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
               Pendente de Pagamento <MdOutlineAccessTime size={16} /> 
              </button>
            </div>
            {form.paid === false && (
              <div className="inote" 
                style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <IoWarningOutline  size={16} style={{flexShrink:0}}/> 
                <span>Não será contabilizado no saldo até ser marcado como pago.</span>
              </div>
            )}
          </div>
        )}

        <button className="btnp" onClick={onSave}>
          {isEditing ? "Salvar Alterações": "Adicionar Transação"}
        </button>
        <button className="btng" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}