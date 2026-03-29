import { useLocation, useNavigate } from "react-router-dom";
import { useFinance } from "../context/FinanceContext";
import { useAppContext } from "../context/AppContext";
import { MONTHS } from "../constants";
import { TbChartDonutFilled } from "react-icons/tb";
import { FaPlaneDeparture } from "react-icons/fa6";
import { IoCard } from "react-icons/io5";
import { TbCategory } from "react-icons/tb";
import { GrTransaction } from "react-icons/gr";
import { MdOutlineAttachMoney } from "react-icons/md";
import { BsFillMoonStarsFill } from "react-icons/bs";
import { FiMoon, FiSun } from "react-icons/fi";
import { BiSolidBank } from "react-icons/bi";
import { TbMoneybag } from "react-icons/tb";

import styles from "./Sidebar.module.css";
import logoLight from "../assets/Black and White Minimalist Studio Logo(2)(2).png";
import logodark from "../assets/Black and White Minimalist Studio Logo(4)(1).png";

const NAV_ITEMS = [
  { id: "dashboard", icon: <TbChartDonutFilled />, label: "Dashboard" },
  { id: "transacoes", icon: <GrTransaction />, label: "Transações" },
  { id: "orcamento", icon: <FaPlaneDeparture />, label: "Orçamentos" },
  { id: "cartoes", icon: <IoCard />, label: "Cartões" },
  { id: "categorias", icon: <TbCategory />, label: "Categorias" },
  { id: "contas", icon: <BiSolidBank />, label: "Contas" },
  { id: "caixinhas", icon: <TbMoneybag />, label: "Caixinhas" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentView = location.pathname.replace("/", "") || "dashboard";

  const { month, year, prevMonth, nextMonth, budgetHook, txHook } = useFinance();
  const activePlan = budgetHook.activePlan;
  const onNewTx = txHook.openNewTx;

  const { theme, toggleTheme } = useAppContext();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div
            style={{
              height: 36,
              fontFamily: "var(--display)",
              fontSize: 24,
              fontWeight: 700,
              lineHeight: 1,
              color: "var(--text)",
            }}
          >
            
              <img 
                src={theme === "light" ? logoLight : logodark} 
                alt="Kiva Logo" 
                style={{
              
                height: "90px",   
                width: "auto",    
                marginTop: "-27px",
                marginLeft: "-13px",
              
                
              }} 
              />
           
            
          </div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: "var(--text3)",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginTop: 4,
              marginLeft: -10,
              marginTop: 8
              
            }}
          >
            Finance Manager
          </div>
        </div>
        <div
          onClick={toggleTheme}
          title={theme === "dark" ? "Tema Claro" : "Tema Escuro"}
          style={{
            width: 36,
            height: 20,
            borderRadius: 99,
            flexShrink: 0,
            background: theme === "light" ? "var(--gold)" : "var(--surface3)",
            border: "1px solid var(--border2)",
            cursor: "pointer",
            position: "relative",
            transition: "background 0.3s",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 2,
              left: theme === "light" ? 18 : 2,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: theme === "light" ? "#fff" : "var(--gold)",
              transition: "left 0.3s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 8,
            }}
          >
            {theme === "dark" ? (
              <BsFillMoonStarsFill color="#111318" />
            ) : (
              <FiSun color="var(--gold)" />
            )}
          </div>
        </div>
      </div>
      <nav className={styles.nav}>
        {NAV_ITEMS.map((n) => (
          <div
            key={n.id}
            className={`${styles.navItem} ${currentView === n.id ? styles.navItemActive : ""}`}
            onClick={() => navigate("/" + n.id)}
          >
            <span className={styles.navIcon}>{n.icon}</span>
            <span style={{ fontWeight: 600, flex: 1 }}>{n.label}</span>
            {n.id === "orcamento" && (
              <span className={styles.navBadge}>
                {activePlan?.name?.split(" ")[0] || "50/30"}
              </span>
            )}
          </div>
        ))}
      </nav>
      <div className={styles.monthSelector}>
        <div className={styles.periodLabel}>Período</div>
        <div className={styles.monthControls}>
          <button className={styles.arrowButton} onClick={prevMonth}>
            ‹
          </button>
          <span className={styles.monthName}>
            {MONTHS[month].slice(0, 3)} {year}
          </span>
          <button className={styles.arrowButton} onClick={nextMonth}>
            ›
          </button>
        </div>
      </div>

      <div className={styles.addButtonContainer}>
        <button className={styles.newTransactionButton} onClick={onNewTx}>
          <span style={{ fontSize: 14, lineHeight: 1 }}>Nova Transação</span>
        </button>
      </div>
    </aside>
  );
}
