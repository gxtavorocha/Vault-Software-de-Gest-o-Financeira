import { MONTHS } from "../constants";
import { fmt } from "../utils/format";
import { FaPencilAlt } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { HiXCircle } from "react-icons/hi";
import { MdOutlineAccessTime } from "react-icons/md";
import { BsCheckCircleFill } from "react-icons/bs";

export default function Transacoes({ month, year, displayList, filter, setFilter, search, setSearch, getCat, toggleReceived,togglePaid, removeTx,openEditTx }) {
  return (
    <>
      <div className="pg-title">Transações</div>
      <div className="pg-sub">{MONTHS[month]} {year}</div>
      <div className="fr">
        <div className="sb2">
          <span style={{ color: "var(--gold)", fontSize: 14 }}><FaSearch /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar transação..." />
        </div>
        {[["all", "Todas"], ["income", "Receitas"], ["expense", "Despesas"]].map(([v, l]) => (
          <button key={v} className={`fch${filter === v ? " on" : ""}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--gold)", fontWeight: 600 }}>{displayList.length} registros</span>
      </div>

      <div className="txt">
        {displayList.length === 0 && <div className="empty">Nenhuma transação encontrada.</div>}
        {displayList.map(t => {
          const cat = getCat(t.category);
          const pend = t.type === "income" && t.received === false;
          return (
            <div key={t.id} className={`ttr${pend ? " dim" : ""}`}>
              <div className="av" style={{ background: (cat?.color || "#888") + "18" }}>{cat?.icon || "✦"}</div>
              <div className="ti">
                <div className="tn">{t.desc}</div>
                <div className="tm">
                  <span>{new Date(t.date + "T12:00:00").toLocaleDateString("pt-BR")}</span>
                  <span className="cdot" style={{ background: cat?.color || "#888" }} />
                  <span style={{ color: cat?.color || "var(--text3)" }}>{cat?.label}</span>
                </div>
              </div>
              {t.type === "income" && (

                <span className={`tbadge ${t.received !== false ? "bg" : "bo"}`} onClick={() => toggleReceived(t.id)}>
                  {t.received !== false ? (<>Recebido<BsCheckCircleFill/></>) : (<>Não recebido<MdOutlineAccessTime /> </>)}
                </span>
              )}
              <div className="tamt" style={{ color: t.type === "income" ? "var(--green)" : "var(--red)" }}>
                {t.type === "income" ? "+" : "-"}{fmt(t.value)}
              </div>
                  {t.type === "expense" && (
                <span className={`tbadge ${t.paid !== false ? "bg" : "bo"}`} 
                onClick={() => togglePaid(t.id)}>
                {t.paid !== false ? (<>Pago<BsCheckCircleFill/></>):  (<>Não pago<HiXCircle/></>)}
            </span>
)}
              <button className="Editar" onClick={()=> openEditTx(t)}><FaPencilAlt /></button>
              <button className="tdel" onClick={() => removeTx(t.id)}>✕</button>
            </div>
          );
        })}
      </div>
    </>
  );
}
