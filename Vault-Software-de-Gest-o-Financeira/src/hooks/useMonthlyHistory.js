import { useMemo } from "react";
import { MONTHS } from "../constants";

export function useMonthlyHistory(transactions, month, year) {
  const monthlyHistory = useMemo(() => {
    const groupedTxs = transactions.reduce((acc, t) => {
      const d = new Date(t.date + "T12:00:00");
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    }, {});

    const history = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - i, 1);
      const mIdx = d.getMonth();
      const yIdx = d.getFullYear();
      const key = `${yIdx}-${mIdx}`;
      
      const monthName = MONTHS?.[mIdx]?.substring(0, 3) ?? `M${mIdx + 1}`;
      const txsInMonth = groupedTxs[key] || [];

      let receitas = 0;
      let despesas = 0;
      let investimentos = 0;

      for (const t of txsInMonth) {
        if (t.paid === false || t.received === false) continue;
        if (t.type === "income") receitas += t.value || 0;
        else if (t.type === "expense") despesas += t.value || 0;
        else if (t.type === "investment") investimentos += t.value || 0;
      }

      history.push({
        m: monthName,
        r: receitas,
        d: despesas,
        i: investimentos,
      });
    }

    return history;
  }, [transactions, month, year]);

  return useMemo(() => ({ monthlyHistory }), [monthlyHistory]);
}