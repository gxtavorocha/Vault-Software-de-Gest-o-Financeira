import { useState, useMemo, useRef } from "react";
import { LS_TX, loadTx } from "../constants";
import { useLocalStorage } from "./useLocalStorage";

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

// ════════════════════════════════════════════════════════════════════════════
export function useTransactions(categories, month, year) {
  

  const [transactions, setTransactions] = useLocalStorage(LS_TX, loadTx);

  const [form, setForm] = useState(EMPTY_TX_FORM);
  const [showForm, setShowForm] = useState(false);
  const [editingTxId, setEditingTxId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // ── Dados derivados ─────────────────────────────────────────────────────────

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      }),
    [transactions, month, year],
  );

  const totalIncome = useMemo(
    () =>
      filtered
        .filter((t) => t.type === "income" && t.received !== false)
        .reduce((s, t) => s + t.value, 0),
    [filtered],
  );

  const totalPending = useMemo(
    () =>
      filtered
        .filter((t) => t.type === "income" && t.received === false)
        .reduce((s, t) => s + t.value, 0),
    [filtered],
  );

  const totalExpense = useMemo(
    () =>
      filtered
        .filter((t) => t.type === "expense" && t.paid !== false)
        .reduce((s, t) => s + t.value, 0),
    [filtered],
  );

  const totalExpensePending = useMemo(
    () =>
      filtered
        .filter((t) => t.type === "expense" && t.paid !== true)
        .reduce((s, t) => s + t.value, 0),
    [filtered],
  );

  const totalInvestment = useMemo(
    () =>
      filtered
        .filter((t) => t.type === "investment" && t.paid !== false)
        .reduce((s, t) => s + t.value, 0),
    [filtered],
  );

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

  const addTx = () => {
    if (!form.desc || !form.value) return;
    const newTx = {
      ...form,
      id: Date.now,
      value: parseFloat(form.value),
    };
    if (newTx.type === "expense") delete newTx.received;
    setTransactions((prev) => [...prev, newTx]);
    closeForm();
    return true;
  };

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
          paymentMethod: form.paymentMethod,
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
    // estado
    transactions,
    form,
    setForm,
    showForm,
    editingTxId,
    filter,
    setFilter,
    search,
    setSearch,
    // dados derivados
    filtered,
    displayList,
    totalIncome,
    totalPending,
    totalExpense,
    totalExpensePending,
    totalInvestment,
    balance,
    savePct,
    // handlers
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
