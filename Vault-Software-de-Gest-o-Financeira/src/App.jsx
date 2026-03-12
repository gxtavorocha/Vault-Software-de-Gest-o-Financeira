import { useState, useEffect, useMemo } from "react";
import "./styles/global.css";

// ── Hooks ────────────────────────────────────────────────────────────────────
import { useTransactions }   from "./hooks/useTransactions";
import { useCategories }     from "./hooks/useCategories";
import { useCards }          from "./hooks/useCards";
import { useBudget }         from "./hooks/useBudget";
import { useMonthlyHistory } from "./hooks/useMonthlyHistory";

// ── Componentes ───────────────────────────────────────────────────────────────
import Sidebar          from "./components/Sidebar";
import TransactionModal from "./components/modals/TransactionModal";
import PlanModal        from "./components/modals/PlanModal";
import CardModal        from "./components/modals/CardModal";

// ── Páginas ───────────────────────────────────────────────────────────────────
import Dashboard  from "./pages/Dashboard";
import Transacoes from "./pages/Transacoes";
import Orcamento  from "./pages/Orcamento";
import Cartoes    from "./pages/Cartoes";
import Categorias from "./pages/Categorias";

// ════════════════════════════════════════════════════════════════════════════
export default function App() {

  // ── Navegação e data ────────────────────────────────────────────────────────
  const [view,  setView]  = useState("dashboard");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year,  setYear]  = useState(new Date().getFullYear());

  const prevMonth = () => month === 0  ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1);
  const nextMonth = () => month === 11 ? (setMonth(0),  setYear(y => y + 1)) : setMonth(m => m + 1);

  // ── Tema ────────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === "dark" ? "light" : "dark"));

  // ── Toast ───────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);

  const toast$ = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Hooks de domínio ────────────────────────────────────────────────────────
  const categoryHook = useCategories();

  const txHook = useTransactions(categoryHook.categories, month, year);

  const budgetHook = useBudget(
    categoryHook.categories,
    txHook.filtered,
    txHook.totalIncome
  );

  const cardHook = useCards();

  const { monthlyHistory } = useMonthlyHistory(txHook.transactions, month, year);

  // ── Dados derivados ──────────────────────────────────────────────────────────
  const byCategory = useMemo(() =>
    categoryHook.categories
      .map(cat => {
        const total = txHook.filtered
          .filter(t => t.type === "expense" && t.category === cat.id && t.paid !== false)
          .reduce((s, t) => s + t.value, 0);
        return {
          ...cat,
          total,
          pctOfExp: txHook.totalExpense > 0 ? (total / txHook.totalExpense) * 100 : 0,
          pctOfInc: txHook.totalIncome  > 0 ? (total / txHook.totalIncome)  * 100 : 0,
        };
      })
      .filter(c => c.total > 0)
      .sort((a, b) => b.total - a.total),
    [categoryHook.categories, txHook.filtered, txHook.totalExpense, txHook.totalIncome]
  );

  const pieData = useMemo(() =>
    byCategory.map(c => ({ name: c.label, value: c.total, color: c.color })),
    [byCategory]
  );

  // ── Handlers com toast ───────────────────────────────────────────────────────
  const handleAddTx      = ()  => { if (txHook.addTx())       toast$("Transação adicionada! ✓"); };
  const handleEditTx     = ()  => { if (txHook.saveEditTx())  toast$("Lançamento atualizado! ✓"); };
  const handleRemoveTx   = id  => { if (txHook.removeTx(id))  toast$("Transação removida.", "err"); };

  const handleAddCat     = ()  => { if (categoryHook.addCat())      toast$("Categoria criada! ✓"); };
  const handleRemoveCat  = id  => { if (categoryHook.removeCat(id)) toast$("Categoria removida.", "err"); };

  const handleSaveCard   = ()  => {
    const ok = cardHook.saveCard();
    if (ok) toast$(cardHook.editingCard != null ? "Cartão atualizado! ✓" : "Cartão adicionado! ✓");
  };
  const handleRemoveCard = id  => { if (cardHook.removeCard(id))  toast$("Cartão removido.", "err"); };

  const handleSavePlan   = ()  => {
    const result = budgetHook.savePlan();
    if (result === "invalid") toast$("Grupos devem somar 100%", "err");
    else if (result)          toast$(`Plano "${result}" criado! ✓`);
  };
  const handleRemovePlan = id  => { if (budgetHook.removePlan(id)) toast$("Plano removido.", "err"); };

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════

  return (
    <div className="layout">

      {/* ── Sidebar ── */}
      <Sidebar
        view={view}           setView={setView}
        month={month}         year={year}
        prevMonth={prevMonth} nextMonth={nextMonth}
        activePlan={budgetHook.activePlan}
        onNewTx={txHook.openNewTx}
        theme={theme}         toggleTheme={toggleTheme}
      />

      {/* ── Páginas ── */}
      <main className="content">

        {view === "dashboard" && (
          <Dashboard
            month={month}                         year={year}
            filtered={txHook.filtered}
            totalIncome={txHook.totalIncome}      totalPending={txHook.totalPending}
            totalExpense={txHook.totalExpense}
            totalExpensePending={txHook.totalExpensePending}
            balance={txHook.balance}              savePct={txHook.savePct}
            byCategory={byCategory}               pieData={pieData}
            budgetGroups={budgetHook.budgetGroups}
            activePlan={budgetHook.activePlan}    activePlanId={budgetHook.activePlanId}
            getCat={categoryHook.getCat}
            toggleReceived={txHook.toggleReceived}
            togglePaid={txHook.togglePaid}
            setView={setView}
            monthlyHistory={monthlyHistory}
          />
        )}

        {view === "transacoes" && (
          <Transacoes
            month={month}                   year={year}
            displayList={txHook.displayList}
            filter={txHook.filter}          setFilter={txHook.setFilter}
            search={txHook.search}          setSearch={txHook.setSearch}
            openEditTx={txHook.openEditTx}
            getCat={categoryHook.getCat}
            toggleReceived={txHook.toggleReceived}
            togglePaid={txHook.togglePaid}
            removeTx={handleRemoveTx}
          />
        )}

          totalExpensePending={txHook.totalExpensePending}

        {view === "orcamento" && (
          <Orcamento
            month={month}                               year={year}
            totalIncome={txHook.totalIncome}            balance={txHook.balance}
            activePlanId={budgetHook.activePlanId}      setActivePlanId={budgetHook.setActivePlanId}
            activePlan={budgetHook.activePlan}
            customPlans={budgetHook.customPlans}        removePlan={handleRemovePlan}
            budgetGroups={budgetHook.budgetGroups}
            customRows={budgetHook.customRows}
            customBudget={budgetHook.customBudget}      updCustPct={budgetHook.updCustPct}
            customTotal={budgetHook.customTotal}
            budTab={budgetHook.budTab}                  setBudTab={budgetHook.setBudTab}
            categories={categoryHook.categories}
            setShowPlanModal={budgetHook.setShowPlanModal}
            toast$={toast$}
          />
        )}

        {view === "cartoes" && (
          <Cartoes
            cards={cardHook.cards}
            openNewCard={cardHook.openNewCard}
            openEditCard={cardHook.openEditCard}
            removeCard={handleRemoveCard}
          />
        )}

        {view === "categorias" && (
          <Categorias
            categories={categoryHook.categories}
            catForm={categoryHook.catForm}
            setCatForm={categoryHook.setCatForm}
            addCat={handleAddCat}
            removeCat={handleRemoveCat}
          />
        )}

      </main>

      {/* ── Modais ── */}
      {txHook.showForm && (
        <TransactionModal
          form={txHook.form}
          setForm={txHook.setForm}
          categories={categoryHook.categories}
          isEditing={txHook.editingTxId != null}
          onSave={txHook.editingTxId != null ? handleEditTx : handleAddTx}
          onClose={txHook.closeForm}
        />
      )}

      {budgetHook.showPlanModal && (
        <PlanModal
          form={budgetHook.newPlanForm}
          setForm={budgetHook.setNewPlanForm}
          onSave={handleSavePlan}
          onClose={() => budgetHook.setShowPlanModal(false)}
        />
      )}

      {cardHook.showCardModal && (
        <CardModal
          form={cardHook.cardForm}
          setForm={cardHook.setCardForm}
          isEditing={cardHook.editingCard != null}
          onSave={handleSaveCard}
          onClose={() => cardHook.setShowCardModal(false)}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="toast">
          <div
            className="tdot"
            style={{ background: toast.type === "err" ? "var(--color-danger)" : "var(--color-success)" }}
          />
          {toast.msg}
        </div>
      )}

    </div>
  );
}