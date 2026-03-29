// ─── Validators ─────────────────────────────────────────────────────────────
// Funções PURAS de validação — sem dependência de React, DOM ou localStorage.
// Cada validador recebe dados do formulário e retorna um objeto de erros:
//   {} = sem erros   |   { campo: "mensagem" } = com erros
//
// ⚡ Preparado para API: estas funções podem ser reutilizadas no backend
//    ou substituídas por validação server-side sem alterar os componentes.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Valida formulário de Cartão
 * @param {Object} form - { name, digits, limit, due }
 * @returns {Object} erros - ex: { name: "Informe o nome do cartão" }
 */
export function validateCard(form) {
  const errors = {};

  if (!form.name?.trim()) {
    errors.name = "Informe o nome do cartão";
  }

  const digitsClean = (form.digits || "").replace(/\D/g, "");
  if (digitsClean.length !== 4) {
    errors.digits = "Informe os 4 últimos dígitos do cartão";
  }

  const limit = parseFloat(form.limit);
  if (!limit || limit <= 0) {
    errors.limit = "Informe um limite válido maior que zero";
  }

  const due = parseInt(form.due, 10);
  if (!due || due < 1 || due > 31) {
    errors.due = "Informe o dia do vencimento (1 a 31)";
  }

  return errors;
}

/**
 * Valida formulário de Transação
 * @param {Object} form - { desc, value, date, type, paymentMethod, cardId }
 * @returns {Object} erros
 */
export function validateTransaction(form) {
  const errors = {};

  if (!form.desc?.trim()) {
    errors.desc = "Informe a descrição da transação";
  }

  const value = parseFloat(form.value);
  if (!value || value <= 0) {
    errors.value = "Informe um valor válido maior que zero";
  }

  if (!form.date) {
    errors.date = "Selecione a data da transação";
  }

  // Forma de pagamento obrigatória para despesa e receita
  if ((form.type === "expense" || form.type === "income") && !form.paymentMethod) {
    errors.paymentMethod = form.type === "expense"
      ? "Selecione a forma de pagamento"
      : "Selecione a forma de recebimento";
  }

  // Cartão obrigatório quando forma é crédito ou débito
  if ((form.paymentMethod === "credito" || form.paymentMethod === "debito") && !form.cardId) {
    errors.cardId = "Selecione o cartão";
  }

  return errors;
}

/**
 * Valida formulário de Plano de Orçamento
 * @param {Object} form - { name, groups: [{ label, pct }] }
 * @returns {Object} erros - ex: { name: "...", "group_0": "..." , total: "..." }
 */
export function validatePlan(form) {
  const errors = {};

  if (!form.name?.trim()) {
    errors.name = "Informe o nome do plano";
  }

  if (form.groups?.length) {
    form.groups.forEach((g, i) => {
      if (!g.label?.trim()) {
        errors[`group_${i}`] = "Informe o nome do grupo";
      }
    });

    const total = form.groups.reduce((s, g) => s + (parseFloat(g.pct) || 0), 0);
    if (Math.abs(total - 100) > 0.5) {
      errors.total = `Os grupos devem somar 100% (atual: ${total.toFixed(0)}%)`;
    }
  }

  return errors;
}

/**
 * Valida formulário de Categoria
 * @param {Object} form - { label }
 * @returns {Object} erros
 */
export function validateCategory(form) {
  const errors = {};

  if (!form.label?.trim()) {
    errors.label = "Informe o nome da categoria";
  }

  return errors;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Verifica se o objeto de erros está vazio (sem erros)
 * @param {Object} errors
 * @returns {boolean}
 */
export function isValid(errors) {
  return Object.keys(errors).length === 0;
}
