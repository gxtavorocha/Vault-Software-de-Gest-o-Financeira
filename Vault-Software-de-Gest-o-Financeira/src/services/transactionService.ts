import { LS_TX, loadTx } from "../constants";
import type { Transaction } from "../types/finance";

const VALID_TRANSACTION_TYPES = new Set<Transaction["type"]>([
  "expense",
  "income",
  "investment",
]);

const isIsoDate = (value: unknown): value is string =>
  /^\d{4}-\d{2}-\d{2}$/.test(String(value ?? "").trim());

const getFallbackCategory = (type: Transaction["type"]): string => {
  if (type === "income") return "renda";
  if (type === "investment") return "investimentos";
  return "outros";
};

const sanitizeTransaction = (
  unsafeValue: unknown,
  index = 0,
): Transaction | null => {
  if (!unsafeValue || typeof unsafeValue !== "object") return null;

  const transaction = unsafeValue as Partial<Transaction> &
    Record<string, unknown>;

  const type = VALID_TRANSACTION_TYPES.has(
    String(transaction.type) as Transaction["type"],
  )
    ? (transaction.type as Transaction["type"])
    : "expense";
  const numericValue = Number(transaction.value);
  const fallbackId = `legacy_${index}_${String(transaction.date ?? "sem_data")}`;

  return {
    ...transaction,
    id: transaction.id ?? fallbackId,
    desc: String(
      transaction.desc ??
        transaction.description ??
        "Transacao sem descricao",
    ),
    value: Number.isFinite(numericValue) ? numericValue : 0,
    type,
    category: String(transaction.category ?? getFallbackCategory(type)),
    paymentMethod:
      typeof transaction.paymentMethod === "string"
        ? transaction.paymentMethod
        : "",
    cardId: transaction.cardId ?? "",
    accountId: transaction.accountId ?? "",
    date: isIsoDate(transaction.date)
      ? String(transaction.date)
      : new Date().toISOString().slice(0, 10),
    received: type === "income" ? transaction.received !== false : undefined,
    paid: type !== "income" ? transaction.paid !== false : undefined,
  };
};

const sanitizeTransactions = (unsafeValue: unknown): Transaction[] => {
  if (!Array.isArray(unsafeValue)) return [];

  return unsafeValue.filter(Boolean).reduce<Transaction[]>((acc, entry, index) => {
    const sanitized = sanitizeTransaction(entry, index);
    if (sanitized) acc.push(sanitized);
    return acc;
  }, []);
};

export const transactionService = {
  getAll: (): Transaction[] => sanitizeTransactions(loadTx()),

  saveAll: (transactions: Transaction[]) => {
    try {
      localStorage.setItem(LS_TX, JSON.stringify(sanitizeTransactions(transactions)));
    } catch (err) {
      console.error("Failed to save transactions to localStorage:", err);
    }
  },

  addTransaction: (transaction: Transaction): Transaction => {
    const transactions = transactionService.getAll();
    transactions.push(transaction);
    transactionService.saveAll(transactions);
    return transaction;
  },

  updateTransaction: (id: Transaction["id"], updatedData: Partial<Transaction>) => {
    const transactions = transactionService
      .getAll()
      .map((transaction) =>
        transaction.id === id ? { ...transaction, ...updatedData } : transaction,
      );

    transactionService.saveAll(transactions);
  },

  deleteTransaction: (id: Transaction["id"]) => {
    const transactions = transactionService
      .getAll()
      .filter((transaction) => transaction.id !== id);

    transactionService.saveAll(transactions);
  },
};
