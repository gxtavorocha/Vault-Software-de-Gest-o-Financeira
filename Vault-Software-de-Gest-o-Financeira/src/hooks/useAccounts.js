import { useState, useEffect, useMemo } from "react";
import { BANK_CARDS } from "../constants";

// Usando o useLocalStorage internamente ou diretamente LocalStorage API para o Storage local
const accountService = {
  getAll: () => JSON.parse(localStorage.getItem("finance_accounts")) || [],
  saveAll: (data) => localStorage.setItem("finance_accounts", JSON.stringify(data)),
};

export const EMPTY_ACCOUNT_FORM = {
  name: "",
  type: "Corrente", // Corrente, Poupança, Investimento
  balance: "", // Saldo Base (Inicial)
  gradIdx: 0, // Índice na lista de Bancos
};

export function useAccounts(transactions = []) {
  const [accounts, setAccounts] = useState(accountService.getAll);

  useEffect(() => {
    accountService.saveAll(accounts);
  }, [accounts]);

  const [initialAccountForm, setInitialAccountForm] = useState(EMPTY_ACCOUNT_FORM);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const openNewAccount = () => {
    setEditingAccount(null);
    setInitialAccountForm(EMPTY_ACCOUNT_FORM);
    setShowAccountModal(true);
  };

  const openEditAccount = (account) => {
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
  };

  const saveAccount = (formParams) => {
    const bank = BANK_CARDS[formParams.gradIdx] || BANK_CARDS[0];
    const data = {
      name: formParams.name.trim() || bank.name, // Se não der nome, pega o nome do Banco
      type: formParams.type,
      baseBalance: parseFloat(formParams.balance) || 0,
      grad: bank.colors,
      bankId: bank.id,
    };

    if (editingAccount != null) {
      setAccounts((prev) =>
        prev.map((c) => (c.id === editingAccount ? { ...c, ...data } : c)),
      );
    } else {
      setAccounts((prev) => [...prev, { id: Date.now(), ...data }]);
    }

    setShowAccountModal(false);
  };

  const removeAccount = (id) => {
    setAccounts((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  // Calcula o balance real baseado no histórico de transações que afetam essa conta
  const accountsWithTrueBalance = useMemo(() => {
    // Agrupa o saldo de transações na conta (Entradas que receberam, ou saídas que pagaram via essa conta)
    const txMap = transactions.reduce((acc, tx) => {
      // Se não tem accountId definido na tx, ignora (legacy)
      if (!tx.accountId) return acc;

      const cid = String(tx.accountId);
      
      // Receitas marcadas como Recebidas
      if (tx.type === "income" && tx.received === true) {
        acc[cid] = (acc[cid] || 0) + (tx.value || 0);
      }
      
      // Despesas marcadas como pagas (E que NÃO usaram cartão de crédito)
      if (tx.type === "expense" && tx.paid === true && tx.paymentMethod !== "credito") {
        acc[cid] = (acc[cid] || 0) - (tx.value || 0);
      }

      // Investimentos marcardos como pagos
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
        balance: baseBal + txFlow, // Saldo da conta em Tempo Real
      };
    });
  }, [accounts, transactions]);

  return {
    accounts: accountsWithTrueBalance,
    initialAccountForm,
    showAccountModal,
    setShowAccountModal,
    editingAccount,
    openNewAccount,
    openEditAccount,
    saveAccount,
    removeAccount,
  };
}
