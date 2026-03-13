// ─── CATEGORIES ──────────────────────────────────────────────────────────────
import { GiHouse } from "react-icons/gi";
import { FaPix, FaCreditCard } from "react-icons/fa6";
import { FaMoneyBillWave, FaBarcode, FaUniversity } from "react-icons/fa";

export const PAYMENT_METHODS = [
  { value: "dinheiro", label: "Dinheiro", Icon: FaMoneyBillWave },
  { value: "pix", label: "Pix", Icon: FaPix },
  { value: "debito", label: "Débito", Icon: FaCreditCard },
  { value: "credito", label: "Crédito", Icon: FaCreditCard },
  { value: "boleto", label: "Boleto", Icon: FaBarcode },
];

export const DEFAULT_CATEGORIES = [
  { id: "moradia", label: "Moradia", icon: GiHouse, custom: false },
  { id: "alimentacao", label: "Alimentação", icon: "🍽️", custom: false },
  { id: "transporte", label: "Transporte", icon: "🚗", custom: false },
  { id: "saude", label: "Saúde", icon: "💊", custom: false },
  { id: "lazer", label: "Lazer", icon: "🎭", custom: false },
  { id: "educacao", label: "Educação", icon: "📚", custom: false },
  { id: "outros", label: "Outros", icon: "✦", custom: false },
  { id: "investimentos", label: "Investimentos", icon: "✦", custom: false },
];

export const PRESET_COLORS = [
  "#E8B86D",
  "#6DBFE8",
  "#8BE86D",
  "#E86DB8",
  "#A86DE8",
  "#6DE8C8",
  "#E8986D",
  "#E86D6D",
  "#6D8BE8",
  "#E8D96D",
  "#6DE87A",
  "#E86D9A",
];

export const PRESET_ICONS = [
  "🏠",
  "🍽️",
  "🚗",
  "💊",
  "🎭",
  "📚",
  "✦",
  "💰",
  "🎮",
  "✈️",
  "👗",
  "🐾",
  "🏋️",
  "🎵",
  "📱",
  "🛒",
  "💡",
  "🏦",
  "🎁",
  "🍺",
  "🏥",
  "🧾",
];

export const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// ─── BUDGET PLANS ────────────────────────────────────────────────────────────

export const PRESET_PLANS = [
  {
    id: "50-30-20",
    name: "50 / 30 / 20",
    badge: "Clássico",
    desc: "A regra de ouro das finanças pessoais",
    groups: [
      {
        id: "nec",
        label: "Necessidades",
        pct: 50,
        color: "#6DBFE8",
        icon: "🏠",
        catIds: ["moradia", "alimentacao", "saude", "transporte"],
      },
      {
        id: "des",
        label: "Desejos",
        pct: 30,
        color: "#A86DE8",
        icon: "🎭",
        catIds: ["lazer", "educacao", "outros"],
      },
      {
        id: "pou",
        label: "Poupança",
        pct: 20,
        color: "#6DE8A0",
        icon: "💰",
        catIds: [],
      },
    ],
  },
  {
    id: "70-20-10",
    name: "70 / 20 / 10",
    badge: "Agressivo",
    desc: "Para quem tem mais gastos fixos essenciais",
    groups: [
      {
        id: "nec",
        label: "Necessidades",
        pct: 70,
        color: "#6DBFE8",
        icon: "🏠",
        catIds: ["moradia", "alimentacao", "saude", "transporte"],
      },
      {
        id: "des",
        label: "Desejos",
        pct: 20,
        color: "#A86DE8",
        icon: "🎭",
        catIds: ["lazer", "educacao", "outros"],
      },
      {
        id: "pou",
        label: "Poupança",
        pct: 10,
        color: "#6DE8A0",
        icon: "💰",
        catIds: [],
      },
    ],
  },
  {
    id: "80-10-10",
    name: "80 / 10 / 10",
    badge: "Conservador",
    desc: "Para renda menor com foco em sobrevivência",
    groups: [
      {
        id: "nec",
        label: "Necessidades",
        pct: 80,
        color: "#6DBFE8",
        icon: "🏠",
        catIds: ["moradia", "alimentacao", "saude", "transporte"],
      },
      {
        id: "des",
        label: "Desejos",
        pct: 10,
        color: "#A86DE8",
        icon: "🎭",
        catIds: ["lazer", "educacao", "outros"],
      },
      {
        id: "pou",
        label: "Poupança",
        pct: 10,
        color: "#6DE8A0",
        icon: "💰",
        catIds: [],
      },
    ],
  },
];

// ─── CARDS ────────────────────────────────────────────────────────────────────

export const DEFAULT_CARDS = [
  {
    id: 1,
    name: "Nubank Ultravioleta",
    digits: "3421",
    balance: 4250,
    limit: 12000,
    grad: ["#7c3aed", "#4c1d95"],
    flag: "Mastercard",
    due: "15",
  },
  {
    id: 2,
    name: "Itaú Personnalité",
    digits: "8870",
    balance: 1830,
    limit: 8000,
    grad: ["#b45309", "#92400e"],
    flag: "Visa",
    due: "08",
  },
];

export const CARD_GRADS = [
  { label: "Roxo", colors: ["#7c3aed", "#4c1d95"] },
  { label: "Âmbar", colors: ["#b45309", "#92400e"] },
  { label: "Slate", colors: ["#334155", "#0f172a"] },
  { label: "Rose", colors: ["#be123c", "#881337"] },
  { label: "Teal", colors: ["#0f766e", "#134e4a"] },
  { label: "Indigo", colors: ["#4338ca", "#312e81"] },
  { label: "Ouro", colors: ["#92400e", "#78350f"] },
  { label: "Grafite", colors: ["#374151", "#111827"] },
];

export const SAMPLE_TX = [];

export const MONTHLY_HIST = [];

export const LS_TX = "orcpro_tx";
export const LS_CAT = "orcpro_cat";
export const LS_PLAN = "orcpro_plan";
export const LS_CUSTBUD = "orcpro_custbud";
export const LS_CUSTPLANS = "orcpro_custplans";
export const LS_CARDS = "orcpro_cards";

export const loadTx = () => {
  try {
    const v = localStorage.getItem(LS_TX);
    return v ? JSON.parse(v) : [];
  } catch {
    return SAMPLE_TX;
  }
};
export const loadCat = () => {
  try {
    const v = localStorage.getItem(LS_CAT);
    return v ? JSON.parse(v) : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
};
export const loadPlan = () => {
  try {
    const v = localStorage.getItem(LS_PLAN);
    return v || "50-30-20";
  } catch {
    return "50-30-20";
  }
};
export const loadCustBud = () => {
  try {
    const v = localStorage.getItem(LS_CUSTBUD);
    return v ? JSON.parse(v) : [];
  } catch {
    return [];
  }
};
export const loadCustPlans = () => {
  try {
    const v = localStorage.getItem(LS_CUSTPLANS);
    return v ? JSON.parse(v) : [];
  } catch {
    return [];
  }
};
export const loadCards = () => {
  try {
    const v = localStorage.getItem(LS_CARDS);
    return v ? JSON.parse(v) : [];
  } catch {
    return DEFAULT_CARDS;
  }
};
