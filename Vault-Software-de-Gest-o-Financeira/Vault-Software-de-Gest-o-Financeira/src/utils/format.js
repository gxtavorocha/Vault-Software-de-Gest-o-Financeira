export const fmt    = v => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
export const fmtPct = v => `${parseFloat(v).toFixed(1)}%`;
