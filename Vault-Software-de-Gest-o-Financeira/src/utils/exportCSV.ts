// utils/exportCSV.js

const BOM = "\uFEFF";

function toCsv(data, filename) {
  if (!data?.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
  );
  const csv = BOM + [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function exportTransactions(transactions = [], categories = []) {
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.label]));

  const data = transactions.map((t) => ({
    "Data"            : t.date ?? "",
    "Descrição"       : t.desc ?? "",
    "Tipo"            : t.type === "expense" ? "Despesa"
                      : t.type === "income"  ? "Receita"
                      : "Investimento",
    "Valor (R$)"      : Number(t.value ?? 0).toFixed(2).replace(".", ","),
    "Categoria"       : catMap[t.category] ?? t.category ?? "",
    "Forma Pagamento" : t.paymentMethod ?? "",
    "ID Cartão"       : t.cardId ?? "",
    "ID Conta"        : t.accountId ?? "",
    "Status"          : t.paid === false     ? "Pendente"
                      : t.received === false ? "À Receber"
                      : "Concluído",
  }));

  toCsv(data, `transacoes_${today()}.csv`);
}

export function exportCards(cards = []) {
  const data = cards.map((c) => ({
    "ID"          : c.id ?? "",
    "Nome"        : c.name ?? "",
    "Últimos 4"   : c.digits ?? "",
    "Limite (R$)" : Number(c.limit ?? 0).toFixed(2).replace(".", ","),
    "Usado (R$)"  : Number(c.used ?? 0).toFixed(2).replace(".", ","),
  }));
  toCsv(data, `cartoes_${today()}.csv`);
}

export function exportAccounts(accounts = []) {
  const data = accounts.map((a) => ({
    "ID"          : a.id ?? "",
    "Nome"        : a.name ?? "",
    "Tipo"        : a.type ?? "",
    "Saldo (R$)"  : Number(a.balance ?? 0).toFixed(2).replace(".", ","),
  }));
  toCsv(data, `contas_${today()}.csv`);
}

export function exportCategories(categories = []) {
  const data = categories.map((c) => ({
    "ID"    : c.id ?? "",
    "Nome"  : c.label ?? "",
    "Ícone" : c.icon ?? "",
    "Cor"   : c.color ?? "",
  }));
  toCsv(data, `categorias_${today()}.csv`);
}

export function exportAll({ transactions, cards, accounts, categories }) {
  exportTransactions(transactions, categories);
  exportCards(cards);
  exportAccounts(accounts);
  exportCategories(categories);
}