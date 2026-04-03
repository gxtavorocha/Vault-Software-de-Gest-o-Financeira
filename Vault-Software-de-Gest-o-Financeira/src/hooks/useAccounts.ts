import { useState, useEffect, useMemo, useCallback } from "react";
import { BANK_CARDS } from "../constants";
import type { Account, AccountForm, StoredAccount, Transaction } from "../types/finance";

const ACCOUNT_STORAGE_KEY = "finance_accounts";

const accountService = {
  getAll: (): StoredAccount[] => {
    try {
      const value = localStorage.getItem(ACCOUNT_STORAGE_KEY);
      if (!value) return [];

      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) return [];

      return parsed.reduce<StoredAccount[]>((acc, entry) => {
        if (!entry || typeof entry !== "object") return acc;

        const account = entry as Partial<StoredAccount>;
        const baseBalance = Number(account.baseBalance);

        acc.push({
          id: account.id ?? `acc_${Date.now()}_${acc.length}`,
          name: String(account.name ?? "Conta"),
          type: String(account.type ?? "Corrente"),
          baseBalance: Number.isFinite(baseBalance) ? baseBalance : 0,
          grad: Array.isArray(account.grad) ? account.grad.map(String) : undefined,
          bankId: typeof account.bankId === "string" ? account.bankId : undefined,
        });

        return acc;
      }, []);
    } catch {
      return [];
    }
  },
  saveAll: (data: StoredAccount[]) => {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(data));
  },
};

export const EMPTY_ACCOUNT_FORM: AccountForm = {
  name: "",
  type: "Corrente",
  balance: "",
  gradIdx: 0,
};

export function useAccounts(transactions: Transaction[] = []) {
  const [accounts, setAccounts] = useState<StoredAccount[]>(accountService.getAll);

  useEffect(() => {
    accountService.saveAll(accounts);
  }, [accounts]);

  const [initialAccountForm, setInitialAccountForm] =
    useState<AccountForm>(EMPTY_ACCOUNT_FORM);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account["id"] | null>(null);

  const openNewAccount = useCallback(() => {
    setEditingAccount(null);
    setInitialAccountForm(EMPTY_ACCOUNT_FORM);
    setShowAccountModal(true);
  }, []);

  const openEditAccount = useCallback((account: Account) => {
    let gradIdx = BANK_CARDS.findIndex((bank) => bank.id === account.bankId);
    if (gradIdx === -1) {
      gradIdx = BANK_CARDS.findIndex((bank) => bank.colors[0] === account.grad?.[0]);
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

  const saveAccount = useCallback(
    (formParams: AccountForm) => {
      const bank = BANK_CARDS[formParams.gradIdx] || BANK_CARDS[0];
      const data: Omit<StoredAccount, "id"> = {
        name: formParams.name.trim() || bank.name,
        type: formParams.type,
        baseBalance: parseFloat(formParams.balance) || 0,
        grad: bank.colors,
        bankId: bank.id,
      };

      setAccounts((prev) => {
        if (editingAccount != null) {
          return prev.map((account) =>
            account.id === editingAccount ? { ...account, ...data } : account,
          );
        }

        return [...prev, { id: Date.now(), ...data }];
      });

      setShowAccountModal(false);
    },
    [editingAccount],
  );

  const removeAccount = useCallback((id: Account["id"]) => {
    setAccounts((prev) => prev.filter((account) => account.id !== id));
    return true;
  }, []);

  const accountsWithTrueBalance = useMemo<Account[]>(() => {
    const transactionFlowByAccount = transactions.reduce<Record<string, number>>(
      (acc, transaction) => {
        if (!transaction.accountId) return acc;

        const accountId = String(transaction.accountId);

        if (transaction.type === "income" && transaction.received === true) {
          acc[accountId] = (acc[accountId] || 0) + (transaction.value || 0);
        }

        if (
          transaction.type === "expense" &&
          transaction.paid === true &&
          transaction.paymentMethod !== "credito"
        ) {
          acc[accountId] = (acc[accountId] || 0) - (transaction.value || 0);
        }

        if (transaction.type === "investment" && transaction.paid === true) {
          acc[accountId] = (acc[accountId] || 0) - (transaction.value || 0);
        }

        return acc;
      },
      {},
    );

    return accounts.map((account) => ({
      ...account,
      balance: (Number(account.baseBalance) || 0) + (transactionFlowByAccount[String(account.id)] || 0),
    }));
  }, [accounts, transactions]);

  return useMemo(
    () => ({
      accounts: accountsWithTrueBalance,
      initialAccountForm,
      showAccountModal,
      setShowAccountModal,
      editingAccount,
      openNewAccount,
      openEditAccount,
      saveAccount,
      removeAccount,
    }),
    [
      accountsWithTrueBalance,
      editingAccount,
      initialAccountForm,
      openEditAccount,
      openNewAccount,
      removeAccount,
      saveAccount,
      showAccountModal,
    ],
  );
}
