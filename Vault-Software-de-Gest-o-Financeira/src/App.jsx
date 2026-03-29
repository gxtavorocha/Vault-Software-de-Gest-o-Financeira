import "./styles/global.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useFinance } from "./context/FinanceContext";
import { useAppContext } from "./context/AppContext";

// ── Componentes ───────────────────────────────────────────────────────────────
import Sidebar from "./components/Sidebar";
import TransactionModal from "./components/modals/TransactionModal";
import PlanModal from "./components/modals/PlanModal";
import CardModal from "./components/modals/CardModal";
import AccountModal from "./components/modals/AccountModal";

// ── Páginas ───────────────────────────────────────────────────────────────────
import Dashboard from "./pages/Dashboard";
import Transacoes from "./pages/Transacoes";
import Orcamento from "./pages/Orcamento";
import Cartoes from "./pages/Cartoes";
import Categorias from "./pages/Categorias";
import Caixinhas from "./pages/Caixinhas";
import styles from "./App.module.css";
import Contas from "./pages/Contas";
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const { toast } = useAppContext();
  const { categoryHook, txHook, budgetHook, cardHook, accountHook, checkCardLimit } = useFinance();

  const handleAddTx = (localForm) => {
    if (!checkCardLimit(localForm, null)) {
      return { cardLimit: "Valor excede o limite disponível do cartão" };
    }
    txHook.addTx(localForm);
    return null;
  };

  const handleEditTx = (localForm) => {
    if (!checkCardLimit(localForm, txHook.editingTxId)) {
      return { cardLimit: "Valor excede o limite disponível do cartão" };
    }
    txHook.saveEditTx(localForm);
    return null;
  };

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Páginas ── */}
      <main className={styles.content}>
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
      </main>

      {/* ── Modais Globais ── */}
      {txHook.showForm && (
        <TransactionModal
          initialForm={txHook.initialForm}
          categories={categoryHook.categories}
          cards={cardHook.cards}
          accounts={accountHook?.accounts || []}
          isEditing={txHook.editingTxId != null}
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

      {accountHook && accountHook.showAccountModal && (
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