import { useState, useMemo, useRef, useEffect } from "react";
import { PRESET_PLANS } from "../constants";
import { budgetService } from "../services/budgetService";

// ── Grupos padrão para novo plano ─────────────────────────────────────────────
const DEFAULT_PLAN_GROUPS = [
  { label: "Gastos Essenciais", pct: 50, color: "#6DBFE8" },
  { label: "Gastos Supérfluos", pct: 30, color: "#A86DE8" },
  { label: "Reserva", pct: 20, color: "#6DE8A0"},
];


const getNextPlanId = (customPlans) => {
  if (!customPlans.length) return 900;
  const nums = customPlans
    .map((p) => {
      const match = String(p.id).match(/^cp_(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  return nums.length > 0 ? Math.max(...nums) + 1 : 900;
};

// ════════════════════════════════════════════════════════════════════════════
export function useBudget(categories, filtered, totalIncome) {
  const [activePlanId, setActivePlanId] = useState(budgetService.getActivePlanId);
  const [customBudget, setCustomBudget] = useState(budgetService.getCustomBudgetRows);
  const [customPlans, setCustomPlans] = useState(budgetService.getCustomPlans);

  useEffect(() => { budgetService.setActivePlanId(activePlanId); }, [activePlanId]);
  useEffect(() => { budgetService.saveCustomBudgetRows(customBudget); }, [customBudget]);
  useEffect(() => { budgetService.saveCustomPlans(customPlans); }, [customPlans]);


  // Inicializa o contador a partir dos dados já existentes no localStorage
  const nextPlanId = useRef(getNextPlanId(customPlans));

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [initialPlanForm, setInitialPlanForm] = useState({
    name: "",
    groups: DEFAULT_PLAN_GROUPS,
  });
  const [budTab, setBudTab] = useState("planos");

  // ── Dados derivados ─────────────────────────────────────────────────────────

  const allPlans = useMemo(
    () => [
      ...PRESET_PLANS,
      ...customPlans,
      {
        id: "custom",
        name: "Personalizado",
        badge: "Meu plano",
        desc: "Defina % para cada categoria",
        groups: [],
      },
    ],
    [customPlans],
  );

  const activePlan = useMemo(
    () => allPlans.find((p) => p.id === activePlanId) || PRESET_PLANS[0],
    [allPlans, activePlanId],
  );

  const getCat = (id) => categories.find((c) => c.id === id);

  const categoryTotalMap = useMemo(() => {
    return filtered.reduce((acc, t) => {
      if (t.type === "expense" && t.paid !== false) {
        const cid = String(t.category);
        acc[cid] = (acc[cid] || 0) + (t.value || 0);
      }
      return acc;
    }, {});
  }, [filtered]);

  const budgetGroups = useMemo(() => {
    if (!activePlan || activePlan.id === "custom" || !activePlan.groups?.length)
      return [];

    return activePlan.groups.map((g) => {
      const limit = (g.pct / 100) * totalIncome;
      const spent = g.catIds.reduce(
        (acc, cid) => acc + (categoryTotalMap[String(cid)] || 0),
        0,
      );
      const usedPct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

      const cats = g.catIds
        .map((cid) => {
          const cat = getCat(cid);
          if (!cat) return null;
          const catSpent = categoryTotalMap[String(cid)] || 0;

          return {
            ...cat,
            spent: catSpent,
            pctOfGroup: limit > 0 ? (catSpent / limit) * 100 : 0,
            pctOfInc: totalIncome > 0 ? (catSpent / totalIncome) * 100 : 0,
          };
        })
        .filter(Boolean);

      return { ...g, limit, spent, usedPct, cats };
    });
  }, [activePlan, totalIncome, categoryTotalMap, categories]);

  const customRows = useMemo(() => {
    if (activePlanId !== "custom") return [];

    return categories.map((cat) => {
      const entry = customBudget.find((x) => String(x.catId) === String(cat.id)) || { pct: 0 };
      const limit = (entry.pct / 100) * totalIncome;
      const spent = categoryTotalMap[String(cat.id)] || 0;

      return {
        ...cat,
        allocPct: entry.pct,
        limit,
        spent,
        usedPct: limit > 0 ? Math.min((spent / limit) * 100, 100) : 0,
        pctOfInc: totalIncome > 0 ? (spent / totalIncome) * 100 : 0,
      };
    });
  }, [activePlanId, customBudget, categories, categoryTotalMap, totalIncome]);

  const customTotal = customBudget.reduce((s, e) => s + e.pct, 0);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const updCustPct = (catId, pct) => {
    const value = Math.max(0, Math.min(100, parseFloat(pct) || 0));
    setCustomBudget((prev) => {
      const idx = prev.findIndex((e) => e.catId === catId);
      return idx >= 0
        ? prev.map((e, i) => (i === idx ? { ...e, pct: value } : e))
        : [...prev, { catId, pct: value }];
    });
  };

  const savePlan = (formParams) => {
    const plan = {
      id: "cp_" + nextPlanId.current++,
      name: formParams.name,
      badge: "Personalizado",
      desc: formParams.groups.map((g) => `${g.label} ${g.pct}%`).join(" · "),
      groups: formParams.groups.map((g) => ({
        ...g,
        id: "g_" + Math.random().toString(36).slice(2),
        catIds: [],
      })),
    };

    setCustomPlans((prev) => [...prev, plan]);
    setActivePlanId(plan.id);
    setShowPlanModal(false);
    return plan.name;
  };

  const removePlan = (id) => {
    setCustomPlans((prev) => prev.filter((cp) => cp.id !== id));
    if (activePlanId === id) setActivePlanId("50-30-20");
    return true;
  };

  // ── Retorno ──────────────────────────────────────────────────────────────────

  return {
    // estado
    activePlanId,
    setActivePlanId,
    customBudget,
    customPlans,
    showPlanModal,
    setShowPlanModal,
    initialPlanForm,
    setInitialPlanForm,
    budTab,
    setBudTab,
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