import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useCategories } from "../hooks/useCategories";
import { useTransactions } from "../hooks/useTransactions";
import { useBudget } from "../hooks/useBudget";
import { useCards } from "../hooks/useCards";
import { useMonthlyHistory } from "../hooks/useMonthlyHistory";

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  // Navegação de Data
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  // Instancia todos os hooks de domínio
  const categoryHook = useCategories();
  const txHook = useTransactions(categoryHook.categories, month, year);
  const budgetHook = useBudget(categoryHook.categories, txHook.filtered, txHook.totalIncome);
  const cardHook = useCards(txHook.transactions, month, year);
  const { monthlyHistory } = useMonthlyHistory(txHook.transactions, month, year);

  // Dados derivados (antes ficavam no App.jsx)
  const byCategory = useMemo(() => {
    return categoryHook.categories
      .map((cat) => {
        const total = txHook.filtered
          .filter((t) => t.type === "expense" && t.category === cat.id && t.paid !== false)
          .reduce((s, t) => s + t.value, 0);
        return {
          ...cat,
          total,
          pctOfExp: txHook.totalExpense > 0 ? (total / txHook.totalExpense) * 100 : 0,
          pctOfInc: txHook.totalIncome > 0 ? (total / txHook.totalIncome) * 100 : 0,
        };
      })
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [categoryHook.categories, txHook.filtered, txHook.totalExpense, txHook.totalIncome]);

  const pieData = useMemo(() => {
    return byCategory.map((c) => ({
      name: c.label,
      value: c.total,
      color: c.color,
    }));
  }, [byCategory]);

  // ── Logic: Card Limit Check ──
  const checkCardLimit = (form, editingTxId) => {
    if (form.paymentMethod !== "credito" || !form.cardId || form.paid !== true) {
      return true;
    }

    const card = cardHook.cards.find((c) => String(c.id) === String(form.cardId));
    if (!card) return true;

    let available = card.available;

    if (editingTxId != null) {
      const originalTx = txHook.transactions.find((t) => t.id === editingTxId);
      if (
        originalTx &&
        originalTx.paymentMethod === "credito" &&
        String(originalTx.cardId) === String(form.cardId) &&
        originalTx.paid === true
      ) {
        available += originalTx.value;
      }
    }

    return parseFloat(form.value) <= available;
  };

  const value = useMemo(() => ({
    month,
    year,
    setMonth,
    setYear,
    prevMonth,
    nextMonth,
    categoryHook,
    txHook,
    budgetHook,
    cardHook,
    monthlyHistory,
    byCategory,
    pieData,
    checkCardLimit,
  }), [
    month,
    year,
    categoryHook,
    txHook,
    budgetHook,
    cardHook,
    monthlyHistory,
    byCategory,
    pieData
  ]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance deve ser usado dentro de um FinanceProvider");
  }
  return context;
}
