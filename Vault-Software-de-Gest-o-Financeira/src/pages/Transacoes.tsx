import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { UIEvent } from "react";
import { useLocation } from "react-router-dom";
import { FaPencilAlt, FaSearch } from "react-icons/fa";
import { BsCheckCircleFill } from "react-icons/bs";
import { MdOutlineAccessTime } from "react-icons/md";
import { useFinance } from "../context/FinanceContext";
import { useAppContext } from "../context/AppContext";
import { MONTHS, PAYMENT_METHODS, PAYMENT_METHODS_RECEIPTS } from "../constants";
import { CatIcon } from "../constants/CatIcon";
import { fmt } from "../utils/format";
import type {
  Card,
  Category,
  EntityId,
  PaymentOption,
  Transaction,
  TransactionFilter,
} from "../types/finance";
import styles from "./Transacoes.module.css";

const DEFAULT_DATE_FALLBACK = new Date("1970-01-01T12:00:00").getTime();
const DEFAULT_ROW_HEIGHT = 76;
const VIRTUALIZATION_THRESHOLD = 80;
const VIRTUALIZATION_OVERSCAN = 10;
const FILTER_OPTIONS: Array<{ value: TransactionFilter; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "income", label: "Receitas" },
  { value: "expense", label: "Despesas" },
  { value: "card", label: "Gastos nos Cartoes" },
];

const PAYMENT_OPTIONS_MAP = new Map<string, PaymentOption>(
  [...PAYMENT_METHODS, ...PAYMENT_METHODS_RECEIPTS].map((option) => [
    option.value,
    option as PaymentOption,
  ]),
);

interface TransactionLocationState {
  initialFilter?: TransactionFilter;
}

interface TransactionRowProps {
  transaction: Transaction;
  category: Category;
  toggleReceived: (id: Transaction["id"]) => void;
  togglePaid: (id: Transaction["id"]) => void;
  openEditTx: (transaction: Transaction) => void;
  removeTx: (id: Transaction["id"]) => void;
  measureRef?: (node: HTMLDivElement | null) => void;
}

const getSafeDateValue = (value: string): number => {
  const parsed = new Date(`${String(value ?? "")}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? DEFAULT_DATE_FALLBACK : parsed.getTime();
};

const formatTxDate = (value: string): string => {
  const parsed = new Date(getSafeDateValue(value));
  return parsed.getFullYear() === 1970
    ? "--/--/----"
    : parsed.toLocaleDateString("pt-BR");
};

const TransactionRow = memo(function TransactionRow({
  transaction,
  category,
  toggleReceived,
  togglePaid,
  openEditTx,
  removeTx,
  measureRef,
}: TransactionRowProps) {
  const isPendingIncome = transaction.type === "income" && transaction.received === false;
  const paymentOption = PAYMENT_OPTIONS_MAP.get(String(transaction.paymentMethod));
  const PaymentIcon = paymentOption?.Icon;
  const paymentLabel =
    paymentOption?.label ||
    (transaction.paymentMethod ? String(transaction.paymentMethod) : "");

  return (
    <div
      ref={measureRef}
      className={`${styles.tableRow}${isPendingIncome ? ` ${styles.tableRowDim}` : ""}`}
    >
      <div
        className={styles.avatar}
        style={{
          background: `${category.color || "#888"}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CatIcon name={category.icon} size={16} color={category.color || "#888"} />
      </div>

      <div className={styles.transactionInfo}>
        <div className={styles.transactionName}>
          {transaction.desc || "Transacao sem descricao"}
        </div>
        <div className={styles.transactionMeta}>
          <span>{formatTxDate(transaction.date)}</span>
          <span className={styles.catDot} style={{ background: category.color || "#888" }} />
          <span style={{ color: category.color || "var(--text3)" }}>
            {category.label || "Categoria nao encontrada"}
          </span>
        </div>
      </div>

      {paymentLabel && (
        <span className={`${styles.badge} ${styles.badgePayment}`}>
          {PaymentIcon && <PaymentIcon />}
          {paymentLabel}
        </span>
      )}

      {transaction.type === "income" && (
        <span
          className={`${styles.badge} ${
            transaction.received !== false ? styles.badgeBg : styles.badgeBo
          }`}
          onClick={() => toggleReceived(transaction.id)}
        >
          {transaction.received !== false ? (
            <>
              Recebido <BsCheckCircleFill />
            </>
          ) : (
            <>
              Nao recebido <MdOutlineAccessTime />
            </>
          )}
        </span>
      )}

      {transaction.type === "expense" && (
        <span
          className={`${styles.badge} ${
            transaction.paid !== false ? styles.badgeBg : styles.badgeBo
          }`}
          onClick={() => togglePaid(transaction.id)}
        >
          {transaction.paid !== false ? (
            <>
              Pago <BsCheckCircleFill />
            </>
          ) : (
            <>
              Nao pago <MdOutlineAccessTime />
            </>
          )}
        </span>
      )}

      {transaction.type === "investment" && (
        <span
          className={`${styles.badge} ${
            transaction.paid !== false ? styles.badgeBg : styles.badgeBo
          }`}
          onClick={() => togglePaid(transaction.id)}
        >
          {transaction.paid !== false ? (
            <>
              Aplicado <BsCheckCircleFill />
            </>
          ) : (
            <>
              Nao aplicado <MdOutlineAccessTime />
            </>
          )}
        </span>
      )}

      <div
        className={styles.amount}
        style={{ color: transaction.type === "income" ? "var(--green)" : "var(--red)" }}
      >
        {transaction.type === "income" ? "+" : "-"}
        {fmt(transaction.value)}
      </div>

      <button className={styles.btnEdit} onClick={() => openEditTx(transaction)}>
        <FaPencilAlt />
      </button>
      <button className={styles.btnDelete} onClick={() => removeTx(transaction.id)}>
        x
      </button>
    </div>
  );
});

export default function Transacoes() {
  const { month, year, txHook, categoryHook, cardHook } = useFinance();
  const { showToast } = useAppContext();
  const location = useLocation();
  const locationState = (location.state as TransactionLocationState | null) ?? null;
  const initialFilter =
    FILTER_OPTIONS.some((option) => option.value === locationState?.initialFilter)
      ? locationState?.initialFilter
      : "all";

  const [filter, setFilter] = useState<TransactionFilter>(initialFilter || "all");
  const [activeCardId, setActiveCardId] = useState<EntityId | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const listRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(560);
  const [rowHeight, setRowHeight] = useState(DEFAULT_ROW_HEIGHT);

  const { filtered, toggleReceived, togglePaid, openEditTx } = txHook;
  const { getCat } = categoryHook;
  const cards = (cardHook.cards ?? []) as Card[];

  const displayList = useMemo(() => {
    let list = Array.isArray(filtered) ? filtered : [];

    if (filter === "card") {
      list = list.filter((transaction) => transaction.paymentMethod === "credito");
      if (activeCardId != null) {
        list = list.filter(
          (transaction) => String(transaction.cardId) === String(activeCardId),
        );
      }
    } else if (filter !== "all") {
      list = list.filter((transaction) => transaction.type === filter);
    }

    if (deferredSearch) {
      list = list.filter((transaction) =>
        transaction.desc.toLowerCase().includes(deferredSearch),
      );
    }

    return list;
  }, [activeCardId, deferredSearch, filter, filtered]);

  const virtualizationEnabled = displayList.length >= VIRTUALIZATION_THRESHOLD;

  const { startIndex, endIndex, topSpacer, bottomSpacer, visibleTransactions } = useMemo(() => {
    if (!virtualizationEnabled) {
      return {
        startIndex: 0,
        endIndex: displayList.length,
        topSpacer: 0,
        bottomSpacer: 0,
        visibleTransactions: displayList,
      };
    }

    const safeRowHeight = Math.max(rowHeight, 1);
    const safeViewportHeight = Math.max(viewportHeight, safeRowHeight);
    const from = Math.max(0, Math.floor(scrollTop / safeRowHeight) - VIRTUALIZATION_OVERSCAN);
    const visibleCount =
      Math.ceil(safeViewportHeight / safeRowHeight) + VIRTUALIZATION_OVERSCAN * 2;
    const to = Math.min(displayList.length, from + visibleCount);
    const currentTopSpacer = from * safeRowHeight;
    const currentBottomSpacer = Math.max(
      0,
      (displayList.length - to) * safeRowHeight,
    );

    return {
      startIndex: from,
      endIndex: to,
      topSpacer: currentTopSpacer,
      bottomSpacer: currentBottomSpacer,
      visibleTransactions: displayList.slice(from, to),
    };
  }, [displayList, rowHeight, scrollTop, viewportHeight, virtualizationEnabled]);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;

    const syncHeight = () => {
      setViewportHeight(node.clientHeight || 560);
    };

    syncHeight();

    if (typeof ResizeObserver === "undefined") return;

    const resizeObserver = new ResizeObserver(syncHeight);
    resizeObserver.observe(node);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;

    node.scrollTop = 0;
    setScrollTop(0);
  }, [filter, activeCardId, deferredSearch]);

  const measureRow = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    const nextHeight = node.getBoundingClientRect().height;
    if (nextHeight > 0 && Math.abs(nextHeight - rowHeight) > 2) {
      setRowHeight(nextHeight);
    }
  }, [rowHeight]);

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const removeTx = useCallback(
    (id: Transaction["id"]) => {
      if (txHook.removeTx(id)) {
        showToast("Transacao removida.", "err");
      }
    },
    [showToast, txHook],
  );

  return (
    <>
      <div className="pg-title">Transacoes</div>
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
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar transacao..."
          />
        </div>

        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={`${styles.filterChip}${
              filter === option.value ? ` ${styles.filterChipActive}` : ""
            }`}
            onClick={() => {
              setFilter(option.value);
              if (option.value !== "card") setActiveCardId(null);
            }}
          >
            {option.label}
          </button>
        ))}

        <span className={styles.resultCount}>
          {displayList.length} registros
          {virtualizationEnabled ? ` · mostrando ${startIndex + 1}-${endIndex}` : ""}
        </span>
      </div>

      {filter === "card" && cards.length > 0 && (
        <div className={styles.subFilterRow}>
          <button
            className={`${styles.subFilterChip}${
              activeCardId == null ? ` ${styles.subFilterChipActive}` : ""
            }`}
            onClick={() => setActiveCardId(null)}
          >
            Todos os cartoes
          </button>

          {cards.map((card) => (
            <button
              key={String(card.id)}
              className={`${styles.subFilterChip}${
                activeCardId === card.id ? ` ${styles.subFilterChipActive}` : ""
              }`}
              onClick={() => setActiveCardId(card.id)}
            >
              {card.name}
            </button>
          ))}
        </div>
      )}

      <div className={styles.transactionsTable}>
        {displayList.length === 0 ? (
          <div className={styles.empty}>Nenhuma transacao encontrada.</div>
        ) : (
          <div
            ref={listRef}
            className={styles.transactionsViewport}
            onScroll={handleScroll}
          >
            <div
              className={styles.virtualizedList}
              style={{
                paddingTop: topSpacer,
                paddingBottom: bottomSpacer,
              }}
            >
              {visibleTransactions.map((transaction, index) => (
                <div
                  key={String(transaction.id)}
                  className={styles.virtualRowShell}
                >
                  <TransactionRow
                    transaction={transaction}
                    category={getCat(transaction.category)}
                    toggleReceived={toggleReceived}
                    togglePaid={togglePaid}
                    openEditTx={openEditTx}
                    removeTx={removeTx}
                    measureRef={index === 0 ? measureRow : undefined}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
