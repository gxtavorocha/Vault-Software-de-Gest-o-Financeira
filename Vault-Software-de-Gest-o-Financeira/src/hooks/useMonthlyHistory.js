import { useMemo } from "react";
import { MONTHS } from "../constants";

// ════════════════════════════════════════════════════════════════════════════
export function useMonthlyHistory(transactions, month, year) {
  const monthlyHistory = useMemo(() => {
    const history = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - i, 1);
      const monthIndex = d.getMonth();
      const yearIndex = d.getFullYear();
      const monthName = MONTHS[monthIndex].substring(0, 3);

      const txsInMonth = transactions.filter((t) => {
        const txDate = new Date(t.date + "T12:00:00");
        return (
          txDate.getMonth() === monthIndex && txDate.getFullYear() === yearIndex
        );
      });

      const receitas = txsInMonth
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.value, 0);

      const despesas = txsInMonth
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.value, 0);

      history.push({ m: monthName, r: receitas, d: despesas });
    }

    return history;
  }, [transactions, month, year]);

  return { monthlyHistory };
}
