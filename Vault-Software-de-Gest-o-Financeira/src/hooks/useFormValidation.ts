import { useState, useCallback } from "react";
import type { ValidationErrors } from "../types/finance";

// ─── useFormValidation ──────────────────────────────────────────────────────
// Hook reutilizável para gerenciar estado de erros de formulário.
// Desacoplado de qualquer lógica de negócio — apenas gerencia o state de erros.
//
// ⚡ Preparado para API: quando migrar para validação server-side,
//    basta chamar setErrors() com o objeto retornado pela API.
// ─────────────────────────────────────────────────────────────────────────────

export function useFormValidation<TField extends string = string>() {
  const [errors, setErrors] = useState<ValidationErrors<TField>>({});

  /** Limpa todos os erros */
  const clearErrors = useCallback(() => setErrors({}), []);

  /** Limpa erro de um campo específico */
  const clearField = useCallback(
    (field: TField | string) =>
      setErrors((prev) => {
        if (!prev[field]) return prev; // evita re-render desnecessário
        const next = { ...prev };
        delete next[field];
        return next;
      }),
    [],
  );

  /** Retorna true se o campo tem erro */
  const hasError = useCallback(
    (field: TField | string) => Boolean(errors[field]),
    [errors],
  );

  /** Retorna a mensagem de erro do campo, ou string vazia */
  const getError = useCallback(
    (field: TField | string) => errors[field] || "",
    [errors],
  );

  return { errors, setErrors, clearErrors, clearField, hasError, getError };
}
