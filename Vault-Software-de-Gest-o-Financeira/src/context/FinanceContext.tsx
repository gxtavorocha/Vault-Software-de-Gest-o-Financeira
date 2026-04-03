import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Dispatch, SetStateAction } from "react";
import { useCategories } from "../hooks/useCategories";
import { useTransactions } from "../hooks/useTransactions";
import { useBudget } from "../hooks/useBudget";
import { useCards } from "../hooks/useCards";
import { useMonthlyHistory } from "../hooks/useMonthlyHistory";
import { useAccounts } from "../hooks/useAccounts";
import type { FinanceProviderProps, Transaction, TransactionForm } from "../types/finance";

type FinanceContextValue = {
  month: number;
  year: number;
  setMonth: Dispatch<SetStateAction<number>>;
  setYear: Dispatch<SetStateAction<number>>;
  prevMonth: () => void;
  nextMonth: () => void;
  categoryHook: ReturnType<typeof useCategories>;
  txHook: ReturnType<typeof useTransactions>;
  budgetHook: ReturnType<typeof useBudget>;
  cardHook: ReturnType<typeof useCards>;
  accountHook: ReturnType<typeof useAccounts>;
  monthlyHistory: ReturnType<typeof useMonthlyHistory>["monthlyHistory"];
  byCategory: Array<
    ReturnType<typeof useCategories>["categories"][number] & {
      total: number;
      pctOfExp: number;
      pctOfInc: number;
    }
  >;
  pieData: Array<{
    name: string;
    value: number;
    color: string;
    pctOfInc: number;
    pctOfExp: number;
  }>;
  checkCardLimit: (
    form: TransactionForm,
    editingTxId: Transaction["id"] | null,
  ) => boolean;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: FinanceProviderProps) {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const prevMonth = useCallback(() => {
    setMonth((currentMonth) => {
      if (currentMonth === 0) {
        setYear((currentYear) => currentYear - 1);
        return 11;
      }

      return currentMonth - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setMonth((currentMonth) => {
      if (currentMonth === 11) {
        setYear((currentYear) => currentYear + 1);
        return 0;
      }

      return currentMonth + 1;
    });
  }, []);

  const categoryHook = useCategories();
  const txHook = useTransactions(categoryHook.categories, month, year);
  const budgetHook = useBudget(
    categoryHook.categories,
    txHook.filtered,
    txHook.totalIncome,
  );
  const cardHook = useCards(txHook.transactions, month, year);
  const accountHook = useAccounts(txHook.transactions);
  const { monthlyHistory } = useMonthlyHistory(txHook.transactions, month, year);

  const expenseTotalsByCategory = useMemo(
    () =>
      txHook.filtered.reduce<Record<string, number>>((acc, transaction) => {
        if (transaction.type === "expense" && transaction.paid !== false) {
          const categoryId = String(transaction.category);
          acc[categoryId] = (acc[categoryId] || 0) + transaction.value;
        }

        return acc;
      }, {}),
    [txHook.filtered],
  );

  const byCategory = useMemo(
    () =>
      categoryHook.categories
        .map((category) => {
          const total = expenseTotalsByCategory[String(category.id)] || 0;

          return {
            ...category,
            total,
            pctOfExp: txHook.totalExpense > 0 ? (total / txHook.totalExpense) * 100 : 0,
            pctOfInc: txHook.totalIncome > 0 ? (total / txHook.totalIncome) * 100 : 0,
          };
        })
        .filter((category) => category.total > 0)
        .sort((left, right) => right.total - left.total),
    [
      categoryHook.categories,
      expenseTotalsByCategory,
      txHook.totalExpense,
      txHook.totalIncome,
    ],
  );

  const pieData = useMemo(
    () =>
      byCategory.map((category) => ({
        name: category.label,
        value: category.total,
        color: category.color,
        pctOfInc: category.pctOfInc,
        pctOfExp: category.pctOfExp,
      })),
    [byCategory],
  );

  const checkCardLimit = useCallback(
    (form: TransactionForm, editingTxId: Transaction["id"] | null) => {
      if (form.paymentMethod !== "credito" || !form.cardId || form.paid !== true) {
        return true;
      }

      const card = cardHook.cards.find(
        (candidate) => String(candidate.id) === String(form.cardId),
      );
      if (!card) return true;

      let available = card.available;

      if (editingTxId != null) {
        const originalTransaction = txHook.transactions.find(
          (transaction) => transaction.id === editingTxId,
        );

        if (
          originalTransaction &&
          originalTransaction.paymentMethod === "credito" &&
          String(originalTransaction.cardId) === String(form.cardId) &&
          originalTransaction.paid === true
        ) {
          available += originalTransaction.value;
        }
      }

      return parseFloat(form.value) <= available;
    },
    [cardHook.cards, txHook.transactions],
  );

  const value = useMemo<FinanceContextValue>(
    () => ({
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
      accountHook,
      monthlyHistory,
      byCategory,
      pieData,
      checkCardLimit,
    }),
    [
      accountHook,
      budgetHook,
      byCategory,
      cardHook,
      categoryHook,
      checkCardLimit,
      month,
      monthlyHistory,
      nextMonth,
      pieData,
      prevMonth,
      txHook,
      year,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error("useFinance deve ser usado dentro de um FinanceProvider");
  }

  return context;
}
