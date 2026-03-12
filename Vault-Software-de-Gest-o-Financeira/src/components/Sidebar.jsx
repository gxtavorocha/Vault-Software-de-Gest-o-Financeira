import { MONTHS } from "../constants";
import { TbChartDonutFilled } from "react-icons/tb";
import { FaPlaneDeparture } from "react-icons/fa6";
import { IoCard } from "react-icons/io5";
import { TbCategory } from "react-icons/tb";
import { GrTransaction } from "react-icons/gr";
import { MdOutlineAttachMoney } from "react-icons/md";
import { BsFillMoonStarsFill } from "react-icons/bs";
import { FiMoon, FiSun } from "react-icons/fi";


const NAV_ITEMS = [
  { id: "dashboard",  icon: <TbChartDonutFilled />, label: "Dashboard"  },
  { id: "transacoes", icon: "⇄", label: "Transações" },
  { id: "orcamento",  icon: <FaPlaneDeparture />, label: "Orçamento"  },
  { id: "cartoes",    icon: <IoCard />, label: "Cartões"    },
  { id: "categorias", icon: <TbCategory />, label: "Categorias" },
];

export default function Sidebar({ view, setView, month, year, prevMonth, nextMonth, activePlan, onNewTx, theme, toggleTheme }) {
  return (
    <aside className="sb">
      <div className="sb-logo">
        <div className="sb-mark">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFB300"/>
                <stop offset="100%" stopColor="#FFD43B"/>
              </linearGradient>
            </defs>
            <path d="M3 4h6.5C11.5 4 13 5.5 13 7.5S11.5 11 9.5 11L13 17H10.5L7.5 11.5H5.5V17H3V4Z" fill="url(#rg)"/>
            <path d="M5.5 6v3.5H9C9.8 9.5 10.5 9 10.5 7.75S9.8 6 9 6H5.5Z" fill="url(#rg)"/>
            <line x1="15" y1="5" x2="19" y2="5" stroke="url(#rg)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="15" y1="9" x2="19" y2="9" stroke="url(#rg)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="15" y1="13" x2="19" y2="13" stroke="url(#rg)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="17" y1="3" x2="17" y2="15" stroke="url(#rg)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, lineHeight: 1 }}>Vault</div>
          <div style={{ fontSize: 9, fontWeight: 600, color: "var(--text3)", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 3 }}>
            Gestor financeiro
          </div>
        </div>
        {}
        <div onClick={toggleTheme} title={theme === "dark" ? "Tema Claro" : "Tema Escuro"} style={{
          width: 36, height: 20, borderRadius: 99, flexShrink: 0,
          background: theme === "light" ? "var(--gold)" : "var(--surface3)",
          border: "1px solid var(--border2)",
          cursor: "pointer", position: "relative",
          transition: "background 0.3s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, 
        }}>

          <div style={{
            position: "absolute", top: 2,
            left: theme === "light" ? 18 : 2,
            width: 14, height: 14, borderRadius: "50%",
            background: theme === "light" ? "#fff" : "var(--gold)",
            transition: "left 0.3s",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 8,
          }}>
            {theme === "dark" ? <BsFillMoonStarsFill color="#111318"/> : <FiSun color= "var(--gold)"/>}
          </div>
        </div>
      </div>
      <nav className="sb-nav">
        {NAV_ITEMS.map(n => (
          <div key={n.id} className={`ni${view === n.id ? " on" : ""}`} onClick={() => setView(n.id)}>
            <span className="ni-icon">{n.icon}</span>
            <span style={{ fontWeight: 600, flex: 1 }}>{n.label}</span>
            {n.id === "orcamento" && (
              <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 99, background: "rgba(232,184,109,0.15)", color: "var(--gold)", letterSpacing: "0.3px", flexShrink: 0 }}>
                {activePlan?.name?.split(" ")[0] || "50/30"}
              </span>
            )}
          </div>
        ))}
      </nav>
      <div className="sb-month">
        <div className="sb-mlbl">Período</div>
        <div className="mctrl">
          <button className="marr" onClick={prevMonth}>‹</button>
          <span className="mname">{MONTHS[month].slice(0, 3)} {year}</span>
          <button className="marr" onClick={nextMonth}>›</button>
        </div>
      </div>

      <div className="sb-add">
        <button className="btn-new" onClick={onNewTx}>
          <span style={{ fontSize: 14, lineHeight: 1 }}>Nova Transação</span>
        </button>
      </div>
    </aside>
  );
}