import { useState, useMemo, memo } from "react";
import { useLocation } from "react-router-dom";
import { useFinance } from "../context/FinanceContext";
import { useAppContext } from "../context/AppContext";
import { MONTHS} from "../constants";
import { fmt } from "../utils/format";
import { FaPencilAlt } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { HiXCircle } from "react-icons/hi";
import { MdOutlineAccessTime } from "react-icons/md";
import { BsCheckCircleFill } from "react-icons/bs";
import { CatIcon } from "../constants/CatIcon";
import { PAYMENT_METHODS, PAYMENT_METHODS_RECEIPTS, BANK_CARDS } from "../constants";
import styles from "./Transacoes.module.css";
// ── Componente de Linha Memoizado ─────────────────────────────────────────────
const TransactionRow = memo(({ t, cat, cards, theme, toggleReceived, togglePaid, openEditTx, removeTx }) => {
  const pend = t.type === "income" && t.received === false;
  const pm = [...PAYMENT_METHODS, ...PAYMENT_METHODS_RECEIPTS].find(
    (p) => p.value === t.paymentMethod,
  );
  const PaymentIcon = pm?.Icon;
  const cardObj = cards?.find(c => String(c.id) === String(t.cardId));
  const bankObj = cardObj ? (BANK_CARDS.find(b => b.id === cardObj.bankId) || BANK_CARDS.find(b => b.colors[0] === cardObj.grad?.[0])) : null;

  return (
    <div className={`${styles.tableRow}${pend ? ` ${styles.tableRowDim}` : ""}`}>
      <div
        className={styles.avatar}
        style={{
          background: (cat?.color || "#888") + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CatIcon name={cat?.icon} size={16} color={cat?.color || "#888"} />
      </div>
      <div className={styles.transactionInfo}>
        <div className={styles.transactionName}>{t.desc}</div>
        <div className={styles.transactionMeta}>
          <span>
            {new Date(t.date + "T12:00:00").toLocaleDateString("pt-BR")}
          </span>
          <span
            className={styles.catDot}
            style={{ background: cat?.color || "#888" }}
          />
          <span style={{ color: cat?.color || "var(--text3)" }}>
            {cat?.label}
          </span>
        </div>
      </div>

        <span 
          className={`${styles.badge} ${styles.badgePayment}`}
          style={{
            background: cardObj 
              ? (theme === "dark" ? "rgba(62, 180, 165, 0.11)" : "rgba(0, 139, 125, 0.08)")
              : undefined,
            border: cardObj
              ? (theme === "dark" ? "1px solid rgba(62, 180, 165, 0.25)" : "1px solid rgba(0, 139, 125, 0.15)")
              : undefined,
            color: cardObj
              ? (theme === "dark" ? "#fff" : "#008b7d")
              : undefined,
            backdropFilter: cardObj ? "blur(10px)" : undefined,
          }}
        >
          {cardObj && bankObj?.domain ? (
            <img 
              src={`https://www.google.com/s2/favicons?domain=${bankObj.domain}&sz=64`} 
              alt={bankObj.name} 
              style={{ width: 14, height: 14, borderRadius: '50%', objectFit: 'contain', backgroundColor: '#fff', padding: 1 }} 
            />
          ) : (
            PaymentIcon && <PaymentIcon />
          )}
          {cardObj ? cardObj.name : pm.label}
        </span>

      {t.type === "income" && (
        <span
          className={`${styles.badge} ${t.received !== false ? styles.badgeBg : styles.badgeBo}`}
          onClick={() => toggleReceived(t.id)}
        >
          {t.received !== false ? (
            <>
              Recebido <BsCheckCircleFill />
            </>
          ) : (
            <>
              Não recebido <MdOutlineAccessTime />
            </>
          )}
        </span>
      )}

      {t.type === "expense" && (
        <span
          className={`${styles.badge} ${t.paid !== false ? styles.badgeBg : styles.badgeBo}`}
          onClick={() => togglePaid(t.id)}
        >
          {t.paid !== false ? (
            <>
              Pago <BsCheckCircleFill />
            </>
          ) : (
            <>
              Não pago <MdOutlineAccessTime />
            </>
          )}
        </span>
      )}

      {t.type === "investment" && (
        <span
          className={`${styles.badge} ${t.paid !== false ? styles.badgeBg : styles.badgeBo}`}
          onClick={() => togglePaid(t.id)}
        >
          {t.paid !== false ? (
            <>
              Aplicado <BsCheckCircleFill />
            </>
          ) : (
            <>
              Não Aplicado <MdOutlineAccessTime />
            </>
          )}
        </span>
      )}

      <div
        className={styles.amount}
        style={{
          color: t.type === "income" ? "var(--green)" : "var(--red)",
        }}
      >
        {t.type === "income" ? "+" : "-"}
        {fmt(t.value)}
      </div>

      <button className={styles.btnEdit} onClick={() => openEditTx(t)}>
        <FaPencilAlt />
      </button>
      <button className={styles.btnDelete} onClick={() => removeTx(t.id)}>
        ✕
      </button>
    </div>
  );
});

// ════════════════════════════════════════════════════════════════════════════

export default function Transacoes() {
  const { month, year, txHook, categoryHook, cardHook } = useFinance();
  const { showToast, theme } = useAppContext();
  const location = useLocation();
  
  const [filter, setFilter] = useState(location.state?.initialFilter || "all");
  const [activeCardId, setActiveCardId] = useState(null);
  const [search, setSearch] = useState("");

  const { filtered, toggleReceived, togglePaid, openEditTx } = txHook;
  const { getCat } = categoryHook;

  const displayList = useMemo(() => {
    let list = filtered;
    
    if (filter === "card") {
      list = list.filter((t) => t.paymentMethod === "credito");
      if (activeCardId) {
        list = list.filter((t) => String(t.cardId) === String(activeCardId));
      }
    } else if (filter !== "all") {
      list = list.filter((t) => t.type === filter);
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      list = list.filter((t) => t.desc.toLowerCase().includes(lowerSearch));
    }
    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filtered, filter, search, activeCardId]);

  const removeTx = (id) => {
    if (txHook.removeTx(id)) showToast("Transação removida.", "err");
  };
  
  return (
    <>
      <div className="pg-title">Transações</div>
      <div className="pg-sub">
        {MONTHS[month]} {year}
      </div>
      <div className={styles.filterRow}>
        <div className={styles.searchBar}>
          <span style={{ color: "var(--gold)", fontSize: 14 }}>
            <FaSearch />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar transação..."
          />
        </div>
        {[
          ["all", "Todas"],
          ["income", "Receitas"],
          ["expense", "Despesas"],
          ["card", "Gastos nos Cartões"],
        ].map(([v, l]) => (
          <button
            key={v}
            className={`${styles.filterChip}${filter === v ? ` ${styles.filterChipActive}` : ""}`}
            onClick={() => {
              setFilter(v);
              if (v !== "card") setActiveCardId(null);
            }}
          >
            {l}
          </button>
        ))}
        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            color: "var(--gold)",
            fontWeight: 600,
          }}
        >
          {displayList.length} registros
        </span>
      </div>

      {filter === "card" && cardHook.cards.length > 0 && (
        <div className={styles.subFilterRow}>
          <button
            className={`${styles.subFilterChip}${!activeCardId ? ` ${styles.subFilterChipActive}` : ""}`}
            onClick={() => setActiveCardId(null)}
          >
            Todos os cartões
          </button>
          {cardHook.cards.map((card) => (
            <button
              key={card.id}
              className={`${styles.subFilterChip}${activeCardId === card.id ? ` ${styles.subFilterChipActive}` : ""}`}
              onClick={() => setActiveCardId(card.id)}
            >
              {card.name}
            </button>
          ))}
        </div>
      )}

      <div className={styles.transactionsTable}>
        {displayList.length === 0 && (
          <div className={styles.empty}>Nenhuma transação encontrada.</div>
        )}
        {displayList.map((t) => (
          <TransactionRow
            key={t.id}
            t={t}
            cat={getCat(t.category)}
            cards={cardHook.cards}
            theme={theme}
            toggleReceived={toggleReceived}
            togglePaid={togglePaid}
            openEditTx={openEditTx}
            removeTx={removeTx}
          />
        ))}
      </div>
    </>
  );
}