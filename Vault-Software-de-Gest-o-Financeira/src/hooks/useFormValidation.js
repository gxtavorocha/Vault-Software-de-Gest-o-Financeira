import { useState, useCallback } from "react";

// ─── useFormValidation ──────────────────────────────────────────────────────
// Hook reutilizável para gerenciar estado de erros de formulário.
// Desacoplado de qualquer lógica de negócio — apenas gerencia o state de erros.
//
// ⚡ Preparado para API: quando migrar para validação server-side,
//    basta chamar setErrors() com o objeto retornado pela API.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @returns {Object} { errors, setErrors, clearErrors, clearField, hasError, getError }
 */
export function useFormValidation() {
  const [errors, setErrors] = useState({});

  /** Limpa todos os erros */
  const clearErrors = useCallback(() => setErrors({}), []);

  /** Limpa erro de um campo específico */
  const clearField = useCallback(
    (field) =>
      setErrors((prev) => {
        if (!prev[field]) return prev; // evita re-render desnecessário
        const next = { ...prev };
        delete next[field];
        return next;
      }),
    [],
  );

  /** Retorna true se o campo tem erro */
  const hasError = useCallback((field) => Boolean(errors[field]), [errors]);

  /** Retorna a mensagem de erro do campo, ou string vazia */
  const getError = useCallback((field) => errors[field] || "", [errors]);

  return { errors, setErrors, clearErrors, clearField, hasError, getError };
}
