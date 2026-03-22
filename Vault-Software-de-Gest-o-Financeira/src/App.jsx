import "./styles/global.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useFinance } from "./context/FinanceContext";
import { useAppContext } from "./context/AppContext";

// ── Componentes ───────────────────────────────────────────────────────────────
import Sidebar from "./components/Sidebar";
import TransactionModal from "./components/modals/TransactionModal";
import PlanModal from "./components/modals/PlanModal";
import CardModal from "./components/modals/CardModal";

// ── Páginas ───────────────────────────────────────────────────────────────────
import Dashboard from "./pages/Dashboard";
import Transacoes from "./pages/Transacoes";
import Orcamento from "./pages/Orcamento";
import Cartoes from "./pages/Cartoes";
import Categorias from "./pages/Categorias";

import styles from "./App.module.css";

// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const { toast } = useAppContext();
  const { categoryHook, txHook, budgetHook, cardHook } = useFinance();

  // Handlers transferidos do App antigo que dependem de vários hooks/limites

  const checkCardLimit = () => {
    const form = txHook.form;
    if (form.paymentMethod !== "credito" || !form.cardId || form.paid !== true) {
      return true;
    }

    const card = cardHook.cards.find((c) => c.id == form.cardId);
    if (!card) return true;

    let available = card.available;

    if (txHook.editingTxId != null) {
      const originalTx = txHook.transactions.find((t) => t.id === txHook.editingTxId);
      if (
        originalTx &&
        originalTx.paymentMethod === "credito" &&
        originalTx.cardId == form.cardId &&
        originalTx.paid === true
      ) {
        available += originalTx.value;
      }
    }

    if (parseFloat(form.value) > available) {
      return false;
    }
    return true;
  };

  const handleAddTx = () => {
    if (!checkCardLimit()) return;
    txHook.addTx();
  };

  const handleEditTx = () => {
    if (!checkCardLimit()) return;
    txHook.saveEditTx();
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
        </Routes>
      </main>

      {/* ── Modais Globais ── */}
      {txHook.showForm && (
        <TransactionModal
          form={txHook.form}
          setForm={txHook.setForm}
          categories={categoryHook.categories}
          cards={cardHook.cards}
          isEditing={txHook.editingTxId != null}
          onSave={txHook.editingTxId != null ? handleEditTx : handleAddTx}
          onClose={txHook.closeForm}
        />
      )}

      {budgetHook.showPlanModal && (
        <PlanModal
          form={budgetHook.newPlanForm}
          setForm={budgetHook.setNewPlanForm}
          onSave={() => budgetHook.savePlan()} 
          onClose={() => budgetHook.setShowPlanModal(false)}
        />
      )}

      {cardHook.showCardModal && (
        <CardModal
          form={cardHook.cardForm}
          setForm={cardHook.setCardForm}
          isEditing={cardHook.editingCard != null}
          onSave={() => cardHook.saveCard()}
          onClose={() => cardHook.setShowCardModal(false)}
        />
      )}

      {/* ── Toast Global ── */}
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