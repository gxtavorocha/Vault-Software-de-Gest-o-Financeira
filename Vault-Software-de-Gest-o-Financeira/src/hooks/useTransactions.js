import { useState, useMemo, useRef, useEffect } from "react";
import { transactionService } from "../services/transactionService";

// ── Formulário vazio padrão ───────────────────────────────────────────────────
export const EMPTY_TX_FORM = {
  desc: "",
  value: "",
  type: "expense",
  category: "outros",
  paymentMethod: "",
  cardId: "",
  date: new Date().toISOString().slice(0, 10),
  received: true,
  paid: true,
};

// ── Gerador de ID único ───────────────────────────────────────────────────────
const getNextId = (transactions) => {
  if (!transactions.length) return 100;
  const maxId = Math.max(
    ...transactions.map((t) => (typeof t.id === "number" ? t.id : 0)),
  );
  return maxId + 1;
};

// ════════════════════════════════════════════════════════════════════════════
// ✅ Removido o parâmetro "cards" — validação de limite feita no App.jsx
export function useTransactions(categories, month, year) {
  const [transactions, setTransactions] = useState(transactionService.getAll);

  useEffect(() => {
    transactionService.saveAll(transactions);
  }, [transactions]);

  const nextId = useRef(getNextId(transactions));

  const [form, setForm] = useState(EMPTY_TX_FORM);
  const [showForm, setShowForm] = useState(false);
  const [editingTxId, setEditingTxId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // ── Dados derivados ─────────────────────────────────────────────────────────

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        const d = new Date(t.date + "T12:00:00");
        return d.getMonth() === month && d.getFullYear() === year;
      }),
    [transactions, month, year],
  );

  const stats = useMemo(() => {
    return filtered.reduce(
      (acc, t) => {
        const val = t.value || 0;
        if (t.type === "income") {
          if (t.received !== false) acc.income += val;
          else acc.pendingIncome += val;
        } else if (t.type === "expense") {
          if (t.paid !== false) acc.expense += val;
          else acc.pendingExpense += val;
        } else if (t.type === "investment") {
          // No current concept of pending investment in existing logic
          if (t.paid !== false) acc.investment += val;
        }
        return acc;
      },
      { income: 0, pendingIncome: 0, expense: 0, pendingExpense: 0, investment: 0 },
    );
  }, [filtered]);

  const {
    income: totalIncome,
    pendingIncome: totalPending,
    expense: totalExpense,
    pendingExpense: totalExpensePending,
    investment: totalInvestment,
  } = stats;

  const projectedBalance =
  
  totalPending - totalExpensePending - totalInvestment;
  
  const totalProjectedIncome = totalPending + totalPending;

  const savePctProjected =
    totalProjectedIncome > 0
      ? (projectedBalance < 0
          ? "0.0"
          : Math.max(
              0,
              Math.min(100, (projectedBalance / totalProjectedIncome) * 100),
            ).toFixed(1))
      : "0.0";

  const deficitPctProjected =
    totalProjectedIncome > 0
      ? (projectedBalance < 0
          ? (Math.abs(projectedBalance) / totalProjectedIncome * 100).toFixed(1)
          : "0.0")
      : "0.0";
    
  const balance = totalIncome - totalExpense - totalInvestment;

  const savePct =
    totalIncome > 0
      ? Math.max(0, Math.min(100, (balance / totalIncome) * 100)).toFixed(1)
      : "0.0";

  const displayList = useMemo(() => {
    let list =
      filter === "all" ? filtered : filtered.filter((t) => t.type === filter);
    if (search)
      list = list.filter((t) =>
        t.desc.toLowerCase().includes(search.toLowerCase()),
      );
    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filtered, filter, search]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const openNewTx = () => {
    setEditingTxId(null);
    setForm({ ...EMPTY_TX_FORM, category: categories[0]?.id || "outros" });
    setShowForm(true);
  };

  const openEditTx = (tx) => {
    setEditingTxId(tx.id);
    setForm({
      desc: tx.desc,
      value: String(tx.value),
      type: tx.type,
      category: tx.category,
      paymentMethod: tx.paymentMethod || "",
      cardId: tx.cardId || "",
      date: tx.date,
      received: tx.received ?? true,
      paid: tx.paid ?? true,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTxId(null);
  };

  // ✅ Sem validação de limite aqui — feita no App.jsx
  const addTx = () => {
    if (!form.desc || !form.value) return;

    const newTx = {
      ...form,
      id: nextId.current++,
      value: parseFloat(form.value),
    };

    if (newTx.type === "expense") {
      delete newTx.received;
    } else if (newTx.type === "income") {
      delete newTx.paid;
    } else if (newTx.type === "investment") {
      delete newTx.received;
    }

    setTransactions((prev) => [...prev, newTx]);
    closeForm();
    return true;
  };

  // ✅ Sem validação de limite aqui — feita no App.jsx
  const saveEditTx = () => {
    if (!form.desc || !form.value) return;

    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== editingTxId) return t;
        return {
          ...t,
          desc: form.desc,
          value: parseFloat(form.value),
          type: form.type,
          category: form.category,
          paymentMethod: form.paymentMethod || "",
          cardId: form.cardId || "",
          date: form.date,
          received: form.type === "income" ? form.received : undefined,
          paid: form.type === "expense" ? form.paid : undefined,
        };
      }),
    );
    closeForm();
    return true;
  };

  const removeTx = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    return true;
  };

  const toggleReceived = (id) =>
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, received: !t.received } : t)),
    );

  const togglePaid = (id) =>
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, paid: !t.paid } : t)),
    );

  // ── Retorno ──────────────────────────────────────────────────────────────────

  return {
    transactions,
    form,
    setForm,
    showForm,
    editingTxId,
    filter,
    setFilter,
    search,
    setSearch,
    filtered,
    displayList,
    totalIncome,
    totalPending,
    totalExpense,
    totalExpensePending,
    projectedBalance,
    savePctProjected,
    deficitPctProjected,
    totalInvestment,
    balance,
    savePct,
    openNewTx,
    openEditTx,
    closeForm,
    addTx,
    saveEditTx,
    removeTx,
    toggleReceived,
    togglePaid,
  };
}