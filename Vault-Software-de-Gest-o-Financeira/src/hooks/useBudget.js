import { useState, useMemo, useRef } from "react";
import {
  LS_PLAN, LS_CUSTBUD, LS_CUSTPLANS,
  PRESET_PLANS,
  loadPlan, loadCustBud, loadCustPlans,
} from "../constants";
import { useLocalStorage } from "./useLocalStorage";

// ── Grupos padrão para novo plano ─────────────────────────────────────────────
const DEFAULT_PLAN_GROUPS = [
  { label: "Gastos Essenciais", pct: 50, color: "#6DBFE8", icon: "🏠" },
  { label: "Gastos Supérfluos", pct: 30, color: "#A86DE8", icon: "🎭" },
  { label: "Reserva",           pct: 20, color: "#6DE8A0", icon: "💰" },
];

// ════════════════════════════════════════════════════════════════════════════
export function useBudget(categories, filtered, totalIncome) {

  const nextPlanId = useRef(900);

  const [activePlanId,  setActivePlanId]  = useLocalStorage(LS_PLAN,      loadPlan);
  const [customBudget,  setCustomBudget]  = useLocalStorage(LS_CUSTBUD,   loadCustBud);
  const [customPlans,   setCustomPlans]   = useLocalStorage(LS_CUSTPLANS, loadCustPlans);

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlanForm,   setNewPlanForm]   = useState({ name: "", groups: DEFAULT_PLAN_GROUPS });
  const [budTab,        setBudTab]        = useState("planos");

  // ── Dados derivados ─────────────────────────────────────────────────────────

  const allPlans = useMemo(() => [
    ...PRESET_PLANS,
    ...customPlans,
    { id: "custom", name: "Personalizado", badge: "Meu plano", desc: "Defina % para cada categoria", groups: [] },
  ], [customPlans]);

  const activePlan = useMemo(() =>
    allPlans.find(p => p.id === activePlanId) || PRESET_PLANS[0],
    [allPlans, activePlanId]
  );

  const getCat = (id) => categories.find(c => c.id === id);

  const budgetGroups = useMemo(() => {
    if (!activePlan || activePlan.id === "custom" || !activePlan.groups?.length) return [];

    return activePlan.groups.map(g => {
      const limit   = (g.pct / 100) * totalIncome;
      const spent   = g.catIds.reduce((s, cid) =>
        s + filtered
          .filter(t => t.type === "expense" && t.category === cid)
          .reduce((ss, t) => ss + t.value, 0),
        0
      );
      const usedPct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

      const cats = g.catIds
        .map(cid => {
          const cat      = getCat(cid);
          const catSpent = filtered
            .filter(t => t.type === "expense" && t.category === cid)
            .reduce((s, t) => s + t.value, 0);

          return cat ? {
            ...cat,
            spent:      catSpent,
            pctOfGroup: limit       > 0 ? (catSpent / limit)       * 100 : 0,
            pctOfInc:   totalIncome > 0 ? (catSpent / totalIncome)  * 100 : 0,
          } : null;
        })
        .filter(Boolean);

      return { ...g, limit, spent, usedPct, cats };
    });
  }, [activePlan, totalIncome, filtered, categories]);

  const customRows = useMemo(() => {
    if (activePlanId !== "custom") return [];

    return categories.map(cat => {
      const entry   = customBudget.find(x => x.catId === cat.id) || { pct: 0 };
      const limit   = (entry.pct / 100) * totalIncome;
      const spent   = filtered
        .filter(t => t.type === "expense" && t.category === cat.id)
        .reduce((s, t) => s + t.value, 0);

      return {
        ...cat,
        allocPct: entry.pct,
        limit,
        spent,
        usedPct:  limit       > 0 ? Math.min((spent / limit)       * 100, 100) : 0,
        pctOfInc: totalIncome > 0 ? (spent / totalIncome) * 100 : 0,
      };
    });
  }, [activePlanId, customBudget, categories, filtered, totalIncome]);

  const customTotal = customBudget.reduce((s, e) => s + e.pct, 0);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const updCustPct = (catId, pct) => {
    const value = Math.max(0, Math.min(100, parseFloat(pct) || 0));
    setCustomBudget(prev => {
      const idx = prev.findIndex(e => e.catId === catId);
      return idx >= 0
        ? prev.map((e, i) => (i === idx ? { ...e, pct: value } : e))
        : [...prev, { catId, pct: value }];
    });
  };

  const savePlan = () => {
    if (!newPlanForm.name.trim()) return false;

    const total = newPlanForm.groups.reduce((s, g) => s + (parseFloat(g.pct) || 0), 0);
    if (Math.abs(total - 100) > 0.5) return "invalid";

    const plan = {
      id:     "cp_" + nextPlanId.current++,
      name:   newPlanForm.name,
      badge:  "Personalizado",
      desc:   newPlanForm.groups.map(g => `${g.label} ${g.pct}%`).join(" · "),
      groups: newPlanForm.groups.map(g => ({
        ...g,
        id:     "g_" + Math.random().toString(36).slice(2),
        catIds: [],
      })),
    };

    setCustomPlans(prev => [...prev, plan]);
    setActivePlanId(plan.id);
    setShowPlanModal(false);
    return plan.name;
  };

  const removePlan = (id) => {
    setCustomPlans(prev => prev.filter(cp => cp.id !== id));
    if (activePlanId === id) setActivePlanId("50-30-20");
    return true;
  };

  // ── Retorno ──────────────────────────────────────────────────────────────────

  return {
    // estado
    activePlanId, setActivePlanId,
    customBudget,
    customPlans,
    showPlanModal, setShowPlanModal,
    newPlanForm,   setNewPlanForm,
    budTab,        setBudTab,
    // dados derivados
    allPlans,
    activePlan,
    budgetGroups,
    customRows,
    customTotal,
    // handlers
    updCustPct,
    savePlan,
    removePlan,
  };
}
