import "./styles/global.css";
import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useFinance } from "./context/FinanceContext";
import { useAppContext } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import TransactionModal from "./components/modals/TransactionModal";
import PlanModal from "./components/modals/PlanModal";
import CardModal from "./components/modals/CardModal";
import AccountModal from "./components/modals/AccountModal";
import styles from "./App.module.css";
import type { ModalSaveResult, TransactionForm } from "./types/finance";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Transacoes = lazy(() => import("./pages/Transacoes"));
const Orcamento = lazy(() => import("./pages/Orcamento"));
const Cartoes = lazy(() => import("./pages/Cartoes"));
const Categorias = lazy(() => import("./pages/Categorias"));
const Caixinhas = lazy(() => import("./pages/Caixinhas"));
const Contas = lazy(() => import("./pages/Contas"));

export default function App() {
  const { toast } = useAppContext();
  const {
    categoryHook,
    txHook,
    budgetHook,
    cardHook,
    accountHook,
    checkCardLimit,
  } = useFinance();

  const handleAddTx = (
    localForm: TransactionForm,
  ): ModalSaveResult<"cardLimit"> => {
    if (!checkCardLimit(localForm, null)) {
      return { cardLimit: "Valor excede o limite disponivel do cartao" };
    }

    txHook.addTx(localForm);
    return null;
  };

  const handleEditTx = (
    localForm: TransactionForm,
  ): ModalSaveResult<"cardLimit"> => {
    if (!checkCardLimit(localForm, txHook.editingTxId)) {
      return { cardLimit: "Valor excede o limite disponivel do cartao" };
    }

    txHook.saveEditTx(localForm);
    return null;
  };

  return (
    <div className={styles.layout}>
      <style>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none !important;
          appearance: none !important;
          margin: 0 !important;
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        input[type="number"] {
          -moz-appearance: textfield !important;
          appearance: none !important;
        }
      `}</style>

      <Sidebar />

      <main className={styles.content}>
        <Suspense fallback={<div className={styles.routeFallback}>Carregando...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transacoes" element={<Transacoes />} />
            <Route path="/orcamento" element={<Orcamento />} />
            <Route path="/cartoes" element={<Cartoes />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/caixinhas" element={<Caixinhas />} />
            <Route path="/contas" element={<Contas />} />
          </Routes>
        </Suspense>
      </main>

      {txHook.showForm && (
        <TransactionModal
          initialForm={txHook.initialForm}
          categories={categoryHook.categories}
          cards={cardHook.cards}
          accounts={accountHook.accounts}
          isEditing={txHook.editingTxId != null}
          editingId={txHook.editingTxId}
          onSave={txHook.editingTxId != null ? handleEditTx : handleAddTx}
          onClose={txHook.closeForm}
        />
      )}

      {budgetHook.showPlanModal && (
        <PlanModal
          initialForm={budgetHook.initialPlanForm}
          onSave={(localForm) => budgetHook.savePlan(localForm)}
          onClose={() => budgetHook.setShowPlanModal(false)}
        />
      )}

      {cardHook.showCardModal && (
        <CardModal
          initialForm={cardHook.initialCardForm}
          isEditing={cardHook.editingCard != null}
          onSave={(localForm) => cardHook.saveCard(localForm)}
          onClose={() => cardHook.setShowCardModal(false)}
        />
      )}

      {accountHook.showAccountModal && (
        <AccountModal
          initialForm={accountHook.initialAccountForm}
          isEditing={accountHook.editingAccount != null}
          onSave={(localForm) => accountHook.saveAccount(localForm)}
          onClose={() => accountHook.setShowAccountModal(false)}
        />
      )}

      {toast && (
        <div className={styles.toast}>
          <div
            className={styles.toastDot}
            style={{
              background: toast.type === "err" ? "var(--red)" : "var(--green)",
            }}
          />
          {toast.msg}
        </div>
      )}
    </div>
  );
}
