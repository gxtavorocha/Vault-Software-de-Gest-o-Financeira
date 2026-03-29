import { useState, useEffect, useMemo, useCallback } from "react";
import { BANK_CARDS } from "../constants";

const accountService = {
  getAll: () => JSON.parse(localStorage.getItem("finance_accounts")) || [],
  saveAll: (data) => localStorage.setItem("finance_accounts", JSON.stringify(data)),
};

export const EMPTY_ACCOUNT_FORM = {
  name: "",
  type: "Corrente", 
  balance: "", 
  gradIdx: 0, 
};

export function useAccounts(transactions = []) {
  const [accounts, setAccounts] = useState(accountService.getAll);

  useEffect(() => {
    accountService.saveAll(accounts);
  }, [accounts]);

  const [initialAccountForm, setInitialAccountForm] = useState(EMPTY_ACCOUNT_FORM);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const openNewAccount = useCallback(() => {
    setEditingAccount(null);
    setInitialAccountForm(EMPTY_ACCOUNT_FORM);
    setShowAccountModal(true);
  }, []);

  const openEditAccount = useCallback((account) => {
    let gradIdx = BANK_CARDS.findIndex((g) => g.id === account.bankId);
    if (gradIdx === -1) {
      gradIdx = BANK_CARDS.findIndex((g) => g.colors[0] === account.grad?.[0]);
    }
    setEditingAccount(account.id);
    setInitialAccountForm({
      name: account.name,
      type: account.type || "Corrente",
      balance: String(account.baseBalance || 0),
      gradIdx: gradIdx >= 0 ? gradIdx : 0,
    });
    setShowAccountModal(true);
  }, []);

  const saveAccount = useCallback((formParams) => {
    const bank = BANK_CARDS[formParams.gradIdx] || BANK_CARDS[0];
    const data = {
      name: formParams.name.trim() || bank.name,
      type: formParams.type,
      baseBalance: parseFloat(formParams.balance) || 0,
      grad: bank.colors,
      bankId: bank.id,
    };

    setAccounts((prev) => {
      if (editingAccount != null) {
        return prev.map((c) => (c.id === editingAccount ? { ...c, ...data } : c));
      } else {
        return [...prev, { id: Date.now(), ...data }];
      }
    });

    setShowAccountModal(false);
  }, [editingAccount]);

  const removeAccount = useCallback((id) => {
    setAccounts((prev) => prev.filter((c) => c.id !== id));
    return true;
  }, []);

  const accountsWithTrueBalance = useMemo(() => {
    const txMap = transactions.reduce((acc, tx) => {
      if (!tx.accountId) return acc;
      const cid = String(tx.accountId);
      
      if (tx.type === "income" && tx.received === true) {
        acc[cid] = (acc[cid] || 0) + (tx.value || 0);
      }
      
      if (tx.type === "expense" && tx.paid === true && tx.paymentMethod !== "credito") {
        acc[cid] = (acc[cid] || 0) - (tx.value || 0);
      }

      if (tx.type === "investment" && tx.paid === true) {
        acc[cid] = (acc[cid] || 0) - (tx.value || 0);
      }

      return acc;
    }, {});

    return accounts.map((acc) => {
      const txFlow = txMap[String(acc.id)] || 0;
      const baseBal = parseFloat(acc.baseBalance) || 0;
      return {
        ...acc,
        balance: baseBal + txFlow,
      };
    });
  }, [accounts, transactions]);

  return useMemo(() => ({
    accounts: accountsWithTrueBalance,
    initialAccountForm,
    showAccountModal,
    setShowAccountModal,
    editingAccount,
    openNewAccount,
    openEditAccount,
    saveAccount,
    removeAccount,
  }), [
    accountsWithTrueBalance, initialAccountForm, showAccountModal, 
    editingAccount, openNewAccount, openEditAccount, saveAccount, removeAccount
  ]);
}
