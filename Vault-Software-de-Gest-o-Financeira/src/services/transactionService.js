import { LS_TX, loadTx } from "../constants";

export const transactionService = {
  getAll: () => {
    return loadTx();
  },

  saveAll: (transactions) => {
    localStorage.setItem(LS_TX, JSON.stringify(transactions));
  },

  addTransaction: (transaction) => {
    const transactions = transactionService.getAll();
    transactions.push(transaction);
    transactionService.saveAll(transactions);
    return transaction;
  },

  updateTransaction: (id, updatedData) => {
    let transactions = transactionService.getAll();
    transactions = transactions.map((t) => (t.id === id ? { ...t, ...updatedData } : t));
    transactionService.saveAll(transactions);
  },

  deleteTransaction: (id) => {
    let transactions = transactionService.getAll();
    transactions = transactions.filter((t) => t.id !== id);
    transactionService.saveAll(transactions);
  }
};
