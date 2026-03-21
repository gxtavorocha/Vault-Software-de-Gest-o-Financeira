import { LS_PLAN, LS_CUSTBUD, LS_CUSTPLANS, loadPlan, loadCustBud, loadCustPlans } from "../constants";

export const budgetService = {
  getActivePlanId: () => loadPlan(),
  setActivePlanId: (planId) => localStorage.setItem(LS_PLAN, planId),

  getCustomBudgetRows: () => loadCustBud(),
  saveCustomBudgetRows: (rows) => localStorage.setItem(LS_CUSTBUD, JSON.stringify(rows)),

  getCustomPlans: () => loadCustPlans(),
  saveCustomPlans: (plans) => localStorage.setItem(LS_CUSTPLANS, JSON.stringify(plans)),

  addCustomPlan: (plan) => {
    const plans = budgetService.getCustomPlans();
    plans.push(plan);
    budgetService.saveCustomPlans(plans);
  },

  deleteCustomPlan: (id) => {
    let plans = budgetService.getCustomPlans();
    plans = plans.filter((p) => p.id !== id);
    budgetService.saveCustomPlans(plans);
  }
};
