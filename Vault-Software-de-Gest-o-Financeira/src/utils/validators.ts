import type {
  BudgetPlanForm,
  CardForm,
  CategoryForm,
  TransactionForm,
  ValidationErrors,
} from "../types/finance";

type PlanErrorField = `group_${number}` | "name" | "total";

export function validateCard(form: CardForm): ValidationErrors<keyof CardForm> {
  const errors: ValidationErrors<keyof CardForm> = {};

  if (!form.name?.trim()) {
    errors.name = "Informe o nome do cartÃ£o";
  }

  const digitsClean = String(form.digits || "").replace(/\D/g, "");
  if (digitsClean.length !== 4) {
    errors.digits = "Informe os 4 Ãºltimos dÃ­gitos do cartÃ£o";
  }

  const limit = parseFloat(form.limit);
  if (!limit || limit <= 0) {
    errors.limit = "Informe um limite vÃ¡lido maior que zero";
  }

  const due = parseInt(form.due, 10);
  if (!due || due < 1 || due > 31) {
    errors.due = "Informe o dia do vencimento (1 a 31)";
  }

  return errors;
}

export function validateTransaction(
  form: TransactionForm,
): ValidationErrors<keyof TransactionForm> {
  const errors: ValidationErrors<keyof TransactionForm> = {};

  if (!form.desc?.trim()) {
    errors.desc = "Informe a descriÃ§Ã£o da transaÃ§Ã£o";
  }

  const value = parseFloat(form.value);
  if (!value || value <= 0) {
    errors.value = "Informe um valor vÃ¡lido maior que zero";
  }

  if (!form.date) {
    errors.date = "Selecione a data da transaÃ§Ã£o";
  }

  if ((form.type === "expense" || form.type === "income") && !form.paymentMethod) {
    errors.paymentMethod =
      form.type === "expense"
        ? "Selecione a forma de pagamento"
        : "Selecione a forma de recebimento";
  }

  if ((form.paymentMethod === "credito" || form.paymentMethod === "debito") && !form.cardId) {
    errors.cardId = "Selecione o cartÃ£o";
  }

  return errors;
}

export function validatePlan(
  form: BudgetPlanForm,
): ValidationErrors<PlanErrorField> {
  const errors: ValidationErrors<PlanErrorField> = {};

  if (!form.name?.trim()) {
    errors.name = "Informe o nome do plano";
  }

  if (form.groups?.length) {
    form.groups.forEach((group, index) => {
      if (!group.label?.trim()) {
        errors[`group_${index}`] = "Informe o nome do grupo";
      }
    });

    const total = form.groups.reduce(
      (sum, group) => sum + (parseFloat(String(group.pct)) || 0),
      0,
    );

    if (Math.abs(total - 100) > 0.5) {
      errors.total = `Os grupos devem somar 100% (atual: ${total.toFixed(0)}%)`;
    }
  }

  return errors;
}

export function validateCategory(
  form: CategoryForm,
): ValidationErrors<keyof CategoryForm> {
  const errors: ValidationErrors<keyof CategoryForm> = {};

  if (!form.label?.trim()) {
    errors.label = "Informe o nome da categoria";
  }

  return errors;
}

export function isValid<TField extends string>(
  errors: ValidationErrors<TField>,
): boolean {
  return Object.keys(errors).length === 0;
}
