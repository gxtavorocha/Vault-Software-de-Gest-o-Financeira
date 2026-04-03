import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { transactionService } from "../services/transactionService";
import type { Category, Transaction, TransactionForm } from "../types/finance";

const DEFAULT_DATE_FALLBACK = new Date("1970-01-01T12:00:00").getTime();
const SUBSCRIPTION_TERMS = ["assinatura", "recorrente"];

const createEmptyTransactionForm = (): TransactionForm => ({
  desc: "",
  value: "",
  type: "expense",
  category: "outros",
  paymentMethod: "",
  cardId: "",
  accountId: "",
  date: new Date().toISOString().slice(0, 10),
  received: true,
  paid: true,
});

interface IndexedTransaction {
  transaction: Transaction;
  dateValue: number;
  descLower: string;
  month: number;
  year: number;
}

const getNextId = (transactions: Transaction[]): number => {
  if (!transactions.length) return 100;

  const maxId = Math.max(
    ...transactions.map((transaction) =>
      typeof transaction.id === "number" ? transaction.id : 0,
    ),
  );

  return maxId + 1;
};

const getDateValue = (date: string): number => {
  const parsed = new Date(`${String(date ?? "")}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? DEFAULT_DATE_FALLBACK : parsed.getTime();
};

const requiresAccount = (
  value: Pick<TransactionForm, "type" | "paymentMethod">,
): boolean =>
  value.type === "income" ||
  value.type === "investment" ||
  (value.type === "expense" && value.paymentMethod !== "credito");

const buildTransactionPayload = (
  formParams: TransactionForm,
  id: Transaction["id"],
): Transaction => {
  const paymentMethod = formParams.paymentMethod || "";
  const isCardPayment =
    paymentMethod === "credito" || paymentMethod === "debito";

  return {
    id,
    desc: formParams.desc.trim(),
    value: parseFloat(formParams.value) || 0,
    type: formParams.type,
    category: formParams.category,
    paymentMethod,
    cardId: isCardPayment ? formParams.cardId || "" : "",
    accountId: requiresAccount(formParams) ? formParams.accountId || "" : "",
    date: formParams.date,
    received: formParams.type === "income" ? formParams.received : undefined,
    paid: formParams.type !== "income" ? formParams.paid : undefined,
  };
};

export function useTransactions(categories: Category[], month: number, year: number) {
  const [transactions, setTransactions] = useState<Transaction[]>(
    transactionService.getAll,
  );

  useEffect(() => {
    transactionService.saveAll(transactions);
  }, [transactions]);

  const nextId = useRef(getNextId(transactions));

  const [initialForm, setInitialForm] = useState<TransactionForm>(
    createEmptyTransactionForm,
  );
  const [showForm, setShowForm] = useState(false);
  const [editingTxId, setEditingTxId] = useState<Transaction["id"] | null>(null);

  const investmentCategoryIds = useMemo(
    () =>
      new Set(
        categories
          .filter((category) =>
            category.label.toLowerCase().includes("investimento"),
          )
          .map((category) => String(category.id)),
      ),
    [categories],
  );

  const indexedTransactions = useMemo<IndexedTransaction[]>(
    () =>
      transactions.map((transaction) => {
        const dateValue = getDateValue(transaction.date);
        const parsedDate = new Date(dateValue);

        return {
          transaction,
          dateValue,
          descLower: transaction.desc.toLowerCase(),
          month: parsedDate.getMonth(),
          year: parsedDate.getFullYear(),
        };
      }),
    [transactions],
  );

  const monthlySummary = useMemo(() => {
    const currentMonthTransactions = indexedTransactions
      .filter(
        (entry) => entry.month === month && entry.year === year,
      )
      .sort((left, right) => right.dateValue - left.dateValue);

    let totalIncome = 0;
    let totalPending = 0;
    let totalExpense = 0;
    let totalExpensePending = 0;
    let totalInvestment = 0;
    let totalInvested = 0;
    let totalSubscriptions = 0;
    let nextDueTx: Transaction | undefined;
    let nextDueDate = Number.POSITIVE_INFINITY;

    for (const entry of currentMonthTransactions) {
      const transaction = entry.transaction;
      const value = transaction.value || 0;

      if (transaction.type === "income") {
        if (transaction.received !== false) totalIncome += value;
        else totalPending += value;
      } else if (transaction.type === "expense") {
        if (transaction.paid !== false) totalExpense += value;
        else totalExpensePending += value;

        if (entry.descLower && SUBSCRIPTION_TERMS.some((term) => entry.descLower.includes(term))) {
          totalSubscriptions += value;
        }

        if (transaction.paid === false && entry.dateValue < nextDueDate) {
          nextDueDate = entry.dateValue;
          nextDueTx = transaction;
        }
      } else if (transaction.type === "investment" && transaction.paid !== false) {
        totalInvestment += value;
      }

      if (
        transaction.paid !== false &&
        (transaction.type === "investment" ||
          investmentCategoryIds.has(String(transaction.category)))
      ) {
        totalInvested += value;
      }
    }

    return {
      filtered: currentMonthTransactions.map((entry) => entry.transaction),
      totalIncome,
      totalPending,
      totalExpense,
      totalExpensePending,
      totalInvestment,
      totalInvested,
      totalSubscriptions,
      nextDueTx,
    };
  }, [indexedTransactions, investmentCategoryIds, month, year]);

  const {
    filtered,
    totalIncome,
    totalPending,
    totalExpense,
    totalExpensePending,
    totalInvestment,
    totalInvested,
    totalSubscriptions,
    nextDueTx,
  } = monthlySummary;

  const { balance, savePct } = useMemo(() => {
    const currentBalance = totalIncome - totalExpense - totalInvestment;
    const currentSavePct =
      totalIncome > 0
        ? Math.max(0, Math.min(100, (currentBalance / totalIncome) * 100)).toFixed(1)
        : "0.0";

    return { balance: currentBalance, savePct: currentSavePct };
  }, [totalExpense, totalIncome, totalInvestment]);

  const { projectedBalance, savePctProjected, deficitPctProjected } = useMemo(() => {
    const currentProjectedBalance = balance + totalPending - totalExpensePending;
    const totalProjectedIncome = totalIncome + totalPending;

    const currentSavePct =
      totalProjectedIncome > 0 && currentProjectedBalance > 0
        ? Math.max(
            0,
            Math.min(100, (currentProjectedBalance / totalProjectedIncome) * 100),
          ).toFixed(1)
        : "0.0";

    const currentDeficitPct =
      totalProjectedIncome > 0 && currentProjectedBalance < 0
        ? ((Math.abs(currentProjectedBalance) / totalProjectedIncome) * 100).toFixed(1)
        : "0.0";

    return {
      projectedBalance: currentProjectedBalance,
      savePctProjected: currentSavePct,
      deficitPctProjected: currentDeficitPct,
    };
  }, [balance, totalExpensePending, totalIncome, totalPending]);

  const { daysPassed, dailyAverage } = useMemo(() => {
    const now = new Date();
    const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const passed = isCurrentMonth
      ? now.getDate()
      : year < now.getFullYear() ||
          (year === now.getFullYear() && month < now.getMonth())
        ? daysInMonth
        : 1;

    return {
      daysPassed: passed,
      dailyAverage: totalExpense / passed,
    };
  }, [month, totalExpense, year]);

  const reserveMonths = useMemo(
    () =>
      dailyAverage > 0
        ? ((totalInvested + Math.max(0, balance)) / (dailyAverage * 30)).toFixed(1)
        : "0.0",
    [balance, dailyAverage, totalInvested],
  );

  const investedPct = useMemo(
    () =>
      totalIncome > 0 ? Math.min(100, (totalInvested / totalIncome) * 100).toFixed(1) : "0.0",
    [totalIncome, totalInvested],
  );

  const openNewTx = useCallback(() => {
    setEditingTxId(null);
    setInitialForm({
      ...createEmptyTransactionForm(),
      category: categories[0]?.id || "outros",
    });
    setShowForm(true);
  }, [categories]);

  const openEditTx = useCallback((transaction: Transaction) => {
    setEditingTxId(transaction.id);
    setInitialForm({
      desc: transaction.desc,
      value: String(transaction.value),
      type: transaction.type,
      category: transaction.category,
      paymentMethod: transaction.paymentMethod || "",
      cardId: transaction.cardId || "",
      accountId: transaction.accountId || "",
      date: transaction.date,
      received: transaction.received ?? true,
      paid: transaction.paid ?? true,
    });
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingTxId(null);
  }, []);

  const addTx = useCallback(
    (formParams: TransactionForm) => {
      const newId = nextId.current++;
      const transaction = buildTransactionPayload(formParams, newId);
      setTransactions((prev) => [...prev, transaction]);
      closeForm();
    },
    [closeForm],
  );

  const saveEditTx = useCallback(
    (formParams: TransactionForm) => {
      if (editingTxId == null) return;

      const updatedTransaction = buildTransactionPayload(formParams, editingTxId);

      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === editingTxId ? updatedTransaction : transaction,
        ),
      );

      closeForm();
    },
    [closeForm, editingTxId],
  );

  const removeTx = useCallback((id: Transaction["id"]) => {
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
    return true;
  }, []);

  const toggleReceived = useCallback((id: Transaction["id"]) => {
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === id
          ? { ...transaction, received: transaction.received === false }
          : transaction,
      ),
    );
  }, []);

  const togglePaid = useCallback((id: Transaction["id"]) => {
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === id
          ? { ...transaction, paid: transaction.paid === false }
          : transaction,
      ),
    );
  }, []);

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
      openNewTx,
      openEditTx,
      closeForm,
      addTx,
      saveEditTx,
      removeTx,
      toggleReceived,
      togglePaid,
    ],
  );
}
