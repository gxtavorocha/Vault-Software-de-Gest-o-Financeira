import { useState, useMemo, useRef, useEffect, useCallback } from "react";
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

  const [initialForm, setInitialForm] = useState(EMPTY_TX_FORM);
  const [showForm, setShowForm] = useState(false);
  const [editingTxId, setEditingTxId] = useState(null);

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

  const { projectedBalance, savePctProjected, deficitPctProjected } = useMemo(() => {
    const pb = totalPending - totalExpensePending - totalInvestment;
    const totalProjectedIncome = totalPending + totalPending; // Logic preserved from original
    const sPct = totalProjectedIncome > 0
      ? (pb < 0 ? "0.0" : Math.max(0, Math.min(100, (pb / totalProjectedIncome) * 100)).toFixed(1))
      : "0.0";
    const dPct = totalProjectedIncome > 0
      ? (pb < 0 ? (Math.abs(pb) / totalProjectedIncome * 100).toFixed(1) : "0.0")
      : "0.0";
    return { projectedBalance: pb, savePctProjected: sPct, deficitPctProjected: dPct };
  }, [totalPending, totalExpensePending, totalInvestment]);

  const { balance, savePct } = useMemo(() => {
    const b = totalIncome - totalExpense - totalInvestment;
    const sPct = totalIncome > 0 ? Math.max(0, Math.min(100, (b / totalIncome) * 100)).toFixed(1) : "0.0";
    return { balance: b, savePct: sPct };
  }, [totalIncome, totalExpense, totalInvestment]);

  // ── Lógica de Dashboard (Fragmentada por Responsabilidade) ────────────────

  // 1. Investimentos
  const { totalInvested, investedPct } = useMemo(() => {
    const val = filtered
      .filter((t) => {
        const cat = categories.find((c) => c.id === t.category);
        return cat?.label?.toLowerCase().includes("investimento") && t.paid !== false;
      })
      .reduce((acc, t) => acc + t.value, 0);

    const pct = totalIncome > 0 ? Math.min(100, (val / totalIncome) * 100).toFixed(1) : "0.0";
    return { totalInvested: val, investedPct: pct };
  }, [filtered, categories, totalIncome]);

  // 2. Assinaturas e Recorrentes
  const totalSubscriptions = useMemo(() => {
    return filtered
      .filter((t) => 
        t.type === "expense" && 
        (t.desc.toLowerCase().includes("assinatura") || t.desc.toLowerCase().includes("recorrente"))
      )
      .reduce((acc, t) => acc + t.value, 0);
  }, [filtered]);

  // 3. Métricas de Tempo e Média Diária
  const { daysPassed, dailyAverage } = useMemo(() => {
    const now = new Date();
    const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();
    const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
    
    const passed = isCurrentMonth 
      ? now.getDate() 
      : (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth()) 
          ? daysInMonth(month, year) 
          : 1);

    const avg = totalExpense / passed;
    return { daysPassed: passed, dailyAverage: avg };
  }, [totalExpense, month, year]);

  // 4. Próximo Vencimento
  const nextDueTx = useMemo(() => {
    return [...filtered]
      .filter((t) => t.type === "expense" && t.paid === false)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  }, [filtered]);

  // 5. Reserva de Emergência
  const reserveMonths = useMemo(() => {
    return dailyAverage > 0 
      ? ((totalInvested + Math.max(0, balance)) / (dailyAverage * 30)).toFixed(1) 
      : "0.0";
  }, [dailyAverage, totalInvested, balance]);

  // ── Handlers ──
  const openNewTx = useCallback(() => {
    setEditingTxId(null);
    setInitialForm({ ...EMPTY_TX_FORM, category: categories[0]?.id || "outros" });
    setShowForm(true);
  }, [categories]);

  const openEditTx = useCallback((tx) => {
    setEditingTxId(tx.id);
    setInitialForm({
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
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingTxId(null);
  }, []);

  const addTx = useCallback((formParams) => {
    const newId = nextId.current++;
    setTransactions((prev) => {
      const newTx = {
        ...formParams,
        id: newId,
        value: parseFloat(formParams.value),
      };
      if (newTx.type === "expense") delete newTx.received;
      else if (newTx.type === "income") delete newTx.paid;
      else if (newTx.type === "investment") delete newTx.received;
      return [...prev, newTx];
    });
    closeForm();
  }, [closeForm]);

  const saveEditTx = useCallback((formParams) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== editingTxId) return t;
        return {
          ...t,
          desc: formParams.desc,
          value: parseFloat(formParams.value),
          type: formParams.type,
          category: formParams.category,
          paymentMethod: formParams.paymentMethod || "",
          cardId: formParams.cardId || "",
          date: formParams.date,
          received: formParams.type === "income" ? formParams.received : undefined,
          paid: formParams.type === "expense" ? formParams.paid : undefined,
        };
      }),
    );
    closeForm();
  }, [editingTxId, closeForm]);

  const removeTx = useCallback((id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    return true;
  }, []);

  const toggleReceived = useCallback((id) =>
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, received: !t.received } : t)),
    ), []);

  const togglePaid = useCallback((id) =>
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, paid: !t.paid } : t)),
    ), []);

  // ── Retorno Memoizado ──
  return useMemo(
    () => ({
      transactions,
      initialForm,
      showForm,
      editingTxId,
      filtered,
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
      totalInvested,
      totalSubscriptions,
      dailyAverage,
      daysPassed,
      nextDueTx,
      reserveMonths,
      investedPct,
      // handlers
      openNewTx,
      openEditTx,
      closeForm,
      addTx,
      saveEditTx,
      removeTx,
      toggleReceived,
      togglePaid,
    }),
    [
      transactions, initialForm, showForm, editingTxId, filtered,
      totalIncome, totalPending, totalExpense, totalExpensePending,
      projectedBalance, savePctProjected, deficitPctProjected,
      totalInvestment, balance, savePct, totalInvested, totalSubscriptions,
      dailyAverage, daysPassed, nextDueTx, reserveMonths, investedPct,
      openNewTx, openEditTx, closeForm, addTx, saveEditTx, removeTx, 
      toggleReceived, togglePaid
    ]
  );
}