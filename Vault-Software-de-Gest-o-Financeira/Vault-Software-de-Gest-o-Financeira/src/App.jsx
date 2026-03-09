import { useState, useRef, useEffect, useMemo } from "react";
import "./styles/global.css";

import {
  DEFAULT_CATEGORIES, PRESET_PLANS, CARD_GRADS,
  LS_TX, LS_CAT, LS_PLAN, LS_CUSTBUD, LS_CUSTPLANS, LS_CARDS,
  loadTx, loadCat, loadPlan, loadCustBud, loadCustPlans, loadCards,
} from "./constants";
import { fmt, fmtPct } from "./utils/format";

import Sidebar            from "./components/Sidebar";
import TransactionModal   from "./components/modals/TransactionModal";
import PlanModal          from "./components/modals/PlanModal";
import CardModal          from "./components/modals/CardModal";

import Dashboard   from "./pages/Dashboard";
import Transacoes  from "./pages/Transacoes";
import Orcamento   from "./pages/Orcamento";
import Cartoes     from "./pages/Cartoes";
import Categorias  from "./pages/Categorias";

export default function App() {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState(loadTx);
  const [categories,   setCategories]   = useState(loadCat);
  const [view,         setView]         = useState("dashboard");
  const [month,        setMonth]        = useState(new Date().getMonth());
  const [year,         setYear]         = useState(new Date().getFullYear());
  const [toast,        setToast]        = useState(null);

  // ── Tema ─────────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  // ── Transaction form ─────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [editingTxId, setEditingTxId] = useState(null);
  const [form,     setForm]     = useState({ desc: "", value: "", type: "expense", category: "outros", date: new Date().toISOString().slice(0, 10), received:true, paid: true });
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");

  // ── Category form ────────────────────────────────────────────────────────────
  const [catForm, setCatForm] = useState({ label: "", icon: "✦", color: "#E8B86D" });

  // ── Budget ───────────────────────────────────────────────────────────────────
  const [activePlanId,  setActivePlanId]  = useState(loadPlan);
  const [customBudget,  setCustomBudget]  = useState(loadCustBud);
  const [customPlans,   setCustomPlans]   = useState(loadCustPlans);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlanForm,   setNewPlanForm]   = useState({ name: "", groups: [
    { label: "Grupo A", pct: 50, color: "#6DBFE8", icon: "🏠" },
    { label: "Grupo B", pct: 30, color: "#A86DE8", icon: "🎭" },
    { label: "Reserva", pct: 20, color: "#6DE8A0", icon: "💰" },
  ]});
  const [budTab, setBudTab] = useState("planos");

  // ── Cards ────────────────────────────────────────────────────────────────────
  const [cards,         setCards]         = useState(loadCards);
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard,   setEditingCard]   = useState(null);
  const [cardForm,      setCardForm]      = useState({ name: "", digits: "", flag: "Visa", limit: "", balance: "", due: "", gradIdx: 0 });

  const nextId      = useRef(100);
  const nextCatId   = useRef(500);
  const nextPlanId  = useRef(900);

  // ── Persistence ──────────────────────────────────────────────────────────────
  useEffect(() => { try { localStorage.setItem(LS_TX,        JSON.stringify(transactions)) } catch {} }, [transactions]);
  useEffect(() => { try { localStorage.setItem(LS_CAT,       JSON.stringify(categories))  } catch {} }, [categories]);
  useEffect(() => { try { localStorage.setItem(LS_PLAN,      activePlanId)                } catch {} }, [activePlanId]);
  useEffect(() => { try { localStorage.setItem(LS_CUSTBUD,   JSON.stringify(customBudget))} catch {} }, [customBudget]);
  useEffect(() => { try { localStorage.setItem(LS_CUSTPLANS, JSON.stringify(customPlans)) } catch {} }, [customPlans]);
  useEffect(() => { try { localStorage.setItem(LS_CARDS,     JSON.stringify(cards))       } catch {} }, [cards]);

  // ── Derived data ──────────────────────────────────────────────────────────────
  const getCat = id => categories.find(c => c.id === id);

  const filtered = useMemo(() => transactions.filter(t => {
    const d = new Date(t.date); return d.getMonth() === month && d.getFullYear() === year;
  }), [transactions, month, year]);

  const totalIncome  = useMemo(() => filtered.filter(t => t.type === "income"  && t.received !== false).reduce((s, t) => s + t.value, 0), [filtered]);
  const totalPending = useMemo(() => filtered.filter(t => t.type === "income"  && t.received === false).reduce((s, t) => s + t.value, 0), [filtered]);
  const totalExpense = useMemo(() => filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.value, 0), [filtered]);
  const balance      = totalIncome - totalExpense;
  const savePct      = totalIncome > 0 ? Math.max(0, Math.min(100, (balance / totalIncome) * 100)).toFixed(1) : "0.0";

  const byCategory = useMemo(() => categories.map(cat => {
    const total = filtered.filter(t => t.type === "expense" && t.category === cat.id).reduce((s, t) => s + t.value, 0);
    return { ...cat, total, pctOfExp: totalExpense > 0 ? (total / totalExpense) * 100 : 0, pctOfInc: totalIncome > 0 ? (total / totalIncome) * 100 : 0 };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total), [categories, filtered, totalExpense, totalIncome]);

  const pieData = useMemo(() => byCategory.map(c => ({ name: c.label, value: c.total, color: c.color })), [byCategory]);

  const allPlans = useMemo(() => [
    ...PRESET_PLANS, ...customPlans,
    { id: "custom", name: "Personalizado", badge: "Meu plano", desc: "Defina % para cada categoria", groups: [] },
  ], [customPlans]);

  const activePlan = useMemo(() => allPlans.find(p => p.id === activePlanId) || PRESET_PLANS[0], [allPlans, activePlanId]);

  const budgetGroups = useMemo(() => {
    if (!activePlan || activePlan.id === "custom" || !activePlan.groups?.length) return [];
    return activePlan.groups.map(g => {
      const limit    = (g.pct / 100) * totalIncome;
      const spent    = g.catIds.reduce((s, cid) => s + filtered.filter(t => t.type === "expense" && t.category === cid).reduce((ss, t) => ss + t.value, 0), 0);
      const usedPct  = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
      const cats     = g.catIds.map(cid => {
        const cat = getCat(cid);
        const catSpent = filtered.filter(t => t.type === "expense" && t.category === cid).reduce((s, t) => s + t.value, 0);
        return cat ? { ...cat, spent: catSpent, pctOfGroup: limit > 0 ? (catSpent / limit) * 100 : 0, pctOfInc: totalIncome > 0 ? (catSpent / totalIncome) * 100 : 0 } : null;
      }).filter(Boolean);
      return { ...g, limit, spent, usedPct, cats };
    });
  }, [activePlan, totalIncome, filtered, categories]);

  const customRows = useMemo(() => {
    if (activePlanId !== "custom") return [];
    return categories.map(cat => {
      const e       = customBudget.find(x => x.catId === cat.id) || { pct: 0 };
      const limit   = (e.pct / 100) * totalIncome;
      const spent   = filtered.filter(t => t.type === "expense" && t.category === cat.id).reduce((s, t) => s + t.value, 0);
      return { ...cat, allocPct: e.pct, limit, spent, usedPct: limit > 0 ? Math.min((spent / limit) * 100, 100) : 0, pctOfInc: totalIncome > 0 ? (spent / totalIncome) * 100 : 0 };
    });
  }, [activePlanId, customBudget, categories, filtered, totalIncome]);

  const displayList = useMemo(() => {
    let list = filter === "all" ? filtered : filtered.filter(t => t.type === filter);
    if (search) list = list.filter(t => t.desc.toLowerCase().includes(search.toLowerCase()));
    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filtered, filter, search]);

  const customTotal = customBudget.reduce((s, e) => s + e.pct, 0);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const toast$ = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const openEditTx = (tx) => {
    setEditingTxId(tx.id);
    setForm({
      desc:     tx.desc,
      value:    String(tx.value),
      type:     tx.type,
      category: tx.category,
      date:     tx.date,
      received: tx.received ?? true,
      paid:     tx.paid ?? true,
    });
    setShowForm(true);
  };

  const saveEditTx = () => {
    if (!form.desc || !form.value) return;
    setTransactions(p => p.map((t) => {
      if (t.id === editingTxId) {
        return {
          ...t,
          desc:     form.desc,
          value:    parseFloat(form.value),
          type:     form.type,
          category: form.category,
          date:     form.date,
          received: form.type === "income"  ? form.received : undefined,
          paid:     form.type === "expense" ? form.paid     : undefined,
        };
      } else {
        return t;
      }
    }));
    setShowForm(false);
    setEditingTxId(null);
    toast$("Lançamento atualizado! ✓");
  };

  const addTx = () => {
    if (!form.desc || !form.value) return;
    const t = { ...form, id: nextId.current++, value: parseFloat(form.value) };
    if (t.type === "expense") delete t.received;
    setTransactions(p => [...p, t]);
    setForm({ desc: "", value: "", type: "expense", category: categories[0]?.id || "outros", date: new Date().toISOString().slice(0, 10), received: true });
    setShowForm(false); toast$("Transação adicionada! ✓");
  };

  const toggleReceived = id => setTransactions(p => p.map(t => t.id === id ? { ...t, received: !t.received } : t));
  const togglePaid     = id => setTransactions(p => p.map(t => t.id === id ? { ...t, paid: !t.paid } : t));
  const removeTx       = id => { setTransactions(p => p.filter(t => t.id !== id)); toast$("Transação removida.", "err"); };

  const addCat    = () => {
    if (!catForm.label.trim()) return;
    setCategories(p => [...p, { ...catForm, id: "c_" + nextCatId.current++, custom: true }]);
    setCatForm({ label: "", icon: "✦", color: "#E8B86D" }); toast$("Categoria criada! ✓");
  };
  const removeCat = id => { setCategories(p => p.filter(c => c.id !== id)); toast$("Categoria removida.", "err"); };

  const prevMonth = () => month === 0  ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1);
  const nextMonth = () => month === 11 ? (setMonth(0),  setYear(y => y + 1)) : setMonth(m => m + 1);

  const updCustPct = (catId, pct) => {
    const v = Math.max(0, Math.min(100, parseFloat(pct) || 0));
    setCustomBudget(prev => { const i = prev.findIndex(e => e.catId === catId); return i >= 0 ? prev.map((e, ii) => ii === i ? { ...e, pct: v } : e) : [...prev, { catId, pct: v }]; });
  };

  const savePlan = () => {
    if (!newPlanForm.name.trim()) return;
    const total = newPlanForm.groups.reduce((s, g) => s + (parseFloat(g.pct) || 0), 0);
    if (Math.abs(total - 100) > 0.5) { toast$("Grupos devem somar 100%", "err"); return; }
    const plan = {
      id: "cp_" + nextPlanId.current++, name: newPlanForm.name, badge: "Personalizado",
      desc: newPlanForm.groups.map(g => `${g.label} ${g.pct}%`).join(" · "),
      groups: newPlanForm.groups.map(g => ({ ...g, id: "g_" + Math.random().toString(36).slice(2), catIds: [] })),
    };
    setCustomPlans(p => [...p, plan]);
    setActivePlanId(plan.id); setShowPlanModal(false); toast$(`Plano "${plan.name}" criado! ✓`);
  };
  const removePlan = id => { setCustomPlans(p => p.filter(cp => cp.id !== id)); if (activePlanId === id) setActivePlanId("50-30-20"); toast$("Plano removido.", "err"); };

  const openNewCard  = () => { setEditingCard(null); setCardForm({ name: "", digits: "", flag: "Visa", limit: "", balance: "", due: "", gradIdx: 0 }); setShowCardModal(true); };
  const openEditCard = card => {
    const gi = CARD_GRADS.findIndex(g => g.colors[0] === card.grad[0]);
    setEditingCard(card.id);
    setCardForm({ name: card.name, digits: card.digits, flag: card.flag, limit: String(card.limit), balance: String(card.balance), due: card.due, gradIdx: gi >= 0 ? gi : 0 });
    setShowCardModal(true);
  };
  const saveCard = () => {
    if (!cardForm.name.trim() || !cardForm.digits.trim() || !cardForm.limit) return;
    const grad = CARD_GRADS[cardForm.gradIdx]?.colors || CARD_GRADS[0].colors;
    if (editingCard != null) {
      setCards(p => p.map(c => c.id === editingCard ? { ...c, name: cardForm.name, digits: cardForm.digits, flag: cardForm.flag, limit: parseFloat(cardForm.limit) || 0, balance: parseFloat(cardForm.balance) || 0, due: cardForm.due, grad } : c));
      toast$("Cartão atualizado! ✓");
    } else {
      setCards(p => [...p, { id: Date.now(), name: cardForm.name, digits: cardForm.digits, flag: cardForm.flag, limit: parseFloat(cardForm.limit) || 0, balance: parseFloat(cardForm.balance) || 0, due: cardForm.due, grad }]);
      toast$("Cartão adicionado! ✓");
    }
    setShowCardModal(false);
  };
  const removeCard = id => { setCards(p => p.filter(c => c.id !== id)); toast$("Cartão removido.", "err"); };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="layout">

      <Sidebar
        view={view} setView={setView}
        month={month} year={year}
        prevMonth={prevMonth} nextMonth={nextMonth}
        activePlan={activePlan}
        onNewTx={() => setShowForm(true)}
        theme={theme} toggleTheme={toggleTheme}
      />

      <main className="content">
        {view === "dashboard" && (
          <Dashboard
            month={month} year={year}
            filtered={filtered}
            totalIncome={totalIncome} totalPending={totalPending}
            totalExpense={totalExpense} balance={balance} savePct={savePct}
            byCategory={byCategory} pieData={pieData}
            budgetGroups={budgetGroups} activePlan={activePlan} activePlanId={activePlanId}
            getCat={getCat} toggleReceived={toggleReceived} setView={setView}
          />
        )}
        {view === "transacoes" && (
          <Transacoes
            month={month} year={year}
            displayList={displayList} filter={filter} setFilter={setFilter}
            search={search} setSearch={setSearch}
            openEditTx={openEditTx}
            getCat={getCat} toggleReceived={toggleReceived} togglePaid={togglePaid} removeTx={removeTx}
          />
        )}
        {view === "orcamento" && (
          <Orcamento
            month={month} year={year}
            totalIncome={totalIncome} balance={balance}
            activePlanId={activePlanId} setActivePlanId={setActivePlanId} activePlan={activePlan}
            customPlans={customPlans} removePlan={removePlan}
            budgetGroups={budgetGroups} customRows={customRows}
            customBudget={customBudget} updCustPct={updCustPct} customTotal={customTotal}
            budTab={budTab} setBudTab={setBudTab}
            categories={categories} setShowPlanModal={setShowPlanModal}
            toast$={toast$}
          />
        )}
        {view === "cartoes" && (
          <Cartoes
            cards={cards}
            openNewCard={openNewCard} openEditCard={openEditCard} removeCard={removeCard}
          />
        )}
        {view === "categorias" && (
          <Categorias
            categories={categories} catForm={catForm} setCatForm={setCatForm}
            addCat={addCat} removeCat={removeCat}
          />
        )}
      </main>

      {/* Modals */}
      {showForm && (
        <TransactionModal
          form={form}
          setForm={setForm}
          categories={categories}
          isEditing={editingTxId != null}
          onSave={editingTxId != null ? saveEditTx : addTx}
          onClose={() => { setShowForm(false); setEditingTxId(null); }}
        />
      )}
      {showPlanModal && (
        <PlanModal form={newPlanForm} setForm={setNewPlanForm} onSave={savePlan} onClose={() => setShowPlanModal(false)} />
      )}
      {showCardModal && (
        <CardModal form={cardForm} setForm={setCardForm} isEditing={editingCard != null} onSave={saveCard} onClose={() => setShowCardModal(false)} />
      )}

      {/* Toast */}
      {toast && (
        <div className="toast">
          <div className="tdot" style={{ background: toast.type === "err" ? "var(--red)" : "var(--green)" }} />
          {toast.msg}
        </div>
      )}
    </div>
  );
}