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
import { PAYMENT_METHODS, PAYMENT_METHODS_RECEIPTS } from "../constants";
import styles from "./Transacoes.module.css";
export default function Transacoes() {
  const { month, year, txHook, categoryHook } = useFinance();
  const { showToast } = useAppContext();
  
  const { displayList, filter, setFilter, search, setSearch, toggleReceived, togglePaid, openEditTx } = txHook;
  const { getCat } = categoryHook;

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
        ].map(([v, l]) => (
          <button
            key={v}
            className={`${styles.filterChip}${filter === v ? ` ${styles.filterChipActive}` : ""}`}
            onClick={() => setFilter(v)}
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

      <div className={styles.transactionsTable}>
        {displayList.length === 0 && (
          <div className={styles.empty}>Nenhuma transação encontrada.</div>
        )}
        {displayList.map((t) => {
          const cat = getCat(t.category);
          const pend = t.type === "income" && t.received === false;
          const pm = [...PAYMENT_METHODS,...PAYMENT_METHODS_RECEIPTS]
          .find(p => p.value === t.paymentMethod);
          const PaymentIcon = pm?.Icon
          return (
            <div
              key={t.id}
              className={`${styles.tableRow}${pend ? ` ${styles.tableRowDim}` : ""}`}
            >
              <div
                className={styles.avatar}
                style={{
                  background: (cat?.color || "#888") + "18",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Ícone via ICON_MAP */}
                <CatIcon
                  name={cat?.icon}
                  size={16}
                  color={cat?.color || "#888"}
                />
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
              
              {pm && (              
                  <span className={`${styles.badge} ${styles.badgePayment}`}>
                    {PaymentIcon && <PaymentIcon/>}
                    {pm.label}
                    </span>
              )}
                  {t.type === "income" && (
                <span
                  className={`${styles.badge} ${t.received !== false ? styles.badgeBg : styles.badgeBo}`}
                  onClick={() => toggleReceived(t.id)}
                >
                  {t.received !== false ? (
                    <>
                      Recebido
                      <BsCheckCircleFill />
                    </>
                  ) : (
                    <>
                      Não recebido
                      <MdOutlineAccessTime />
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
                      Pago
                      <BsCheckCircleFill />
                    </>
                  ) : (
                    <>
                      Não pago
                      <MdOutlineAccessTime />
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
                      Aplicado
                      <BsCheckCircleFill />
                    </>
                  ) : (
                    <>
                      Não Aplicado
                      <MdOutlineAccessTime />
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
        })}
      </div>
    </>
  );
}