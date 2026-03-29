// ─── PAYMENT METHODS ─────────────────────────────────────────────────────────
import { FaPix, FaCreditCard } from "react-icons/fa6";
import { FaMoneyBillWave, FaBarcode } from "react-icons/fa";

export const PAYMENT_METHODS = [
  { value: "dinheiro", label: "Dinheiro", Icon: FaMoneyBillWave },
  { value: "pix", label: "Pix", Icon: FaPix },
  { value: "debito", label: "Débito", Icon: FaCreditCard },
  { value: "credito", label: "Crédito", Icon: FaCreditCard },
  { value: "boleto", label: "Boleto", Icon: FaBarcode },
];

export const PAYMENT_METHODS_RECEIPTS = [
  { value: "dinheiro", label: "Dinheiro", Icon: FaMoneyBillWave },
  { value: "pix", label: "Pix", Icon: FaPix },
];

// ─── ICON MAP ────────────────────────────────────────────────────────────────
// Mapeia chaves string (salváveis no localStorage) para componentes React Icons.
// Use sempre essas chaves nos campos `icon` das categorias.
import { GiHouse, GiKnifeFork, GiHealthNormal } from "react-icons/gi";
import {
  MdDirectionsCar,
  MdSportsEsports,
  MdSchool,
  MdMoreHoriz,
  MdAttachMoney,
  MdTrendingUp,
  MdFlight,
  MdPets,
  MdShoppingCart,
  MdLightbulb,
  MdAccountBalance,
  MdCardGiftcard,
  MdSportsBar,
  MdLocalHospital,
  MdReceipt,
  MdFitnessCenter,
  MdMusicNote,
  MdPhoneAndroid
} from "react-icons/md";
import { FaChartLine, FaGraduationCap, FaStar, FaPiggyBank, FaGasPump } from "react-icons/fa";
import { BsHouseHeart, BsFillArrowThroughHeartFill } from "react-icons/bs";
import { TbChartDonutFilled, TbCategory } from "react-icons/tb";
import { HiMiniScissors } from "react-icons/hi2";

export const ICON_MAP = {
  moradia:       GiHouse,
  alimentacao:   GiKnifeFork,
  transporte:    MdDirectionsCar,
  saude:         GiHealthNormal,
  lazer:         MdSportsEsports,
  educacao:      FaGraduationCap,
  outros:        FaStar,
  investimentos: MdTrendingUp,
  renda:         MdAttachMoney,
  viagem:        MdFlight,
  pets:          MdPets,
  compras:       MdShoppingCart,
  luz:           MdLightbulb,
  banco:         MdAccountBalance,
  presente:      MdCardGiftcard,
  bebida:        MdSportsBar,
  hospital:      MdLocalHospital,
  conta:         MdReceipt,
  academia:      MdFitnessCenter,
  musica:        MdMusicNote,
  celular:       MdPhoneAndroid,
  grafico:       FaChartLine,
  casa2:         BsHouseHeart,
  escola:        MdSchool,
  cartao:        FaStar,
  geral:         MdMoreHoriz,
  reserva:       FaPiggyBank,
  corte:         HiMiniScissors,
  coracao:       BsFillArrowThroughHeartFill,
  gas:           FaGasPump,
};

// Helper para renderizar ícone a partir de chave string
// Uso: <CatIcon name={cat.icon} size={18} color={cat.color} />
// ─── CATEGORIES ──────────────────────────────────────────────────────────────
export const DEFAULT_CATEGORIES = [
  { id: "moradia",       label: "Moradia",       icon: "moradia",       color: "#6DBFE8", custom: false },
  { id: "alimentacao",   label: "Alimentação",   icon: "alimentacao",   color: "#E8B86D", custom: false },
  { id: "transporte",   label: "Transporte",     icon: "transporte",    color: "#626464ff", custom: false },
  { id: "saude",         label: "Saúde",         icon: "saude",         color: "#E86D6D", custom: false },
  { id: "lazer",         label: "Lazer",         icon: "lazer",         color: "#A86DE8", custom: false },
  { id: "educacao",      label: "Educação",      icon: "educacao",      color: "#4dc7b3ff", custom: false },
  { id: "outros",        label: "Outros",        icon: "outros",        color: "#E8986D", custom: false },
  { id: "investimentos", label: "Investimentos", icon: "investimentos", color: "#33bdc2ff", custom: false },
  { id: "renda", label: "Renda", icon: "renda" , color: "#168a2fff", custom: false },
];

// ─── PRESET ICONS (chaves do ICON_MAP) ───────────────────────────────────────
export const PRESET_ICONS = [
  "moradia",
  "alimentacao",
  "transporte",
  "saude",
  "lazer",
  "educacao",
  "outros",
  "investimentos",
  "renda",
  "viagem",
  "pets",
  "compras",
  "academia",
  "musica",
  "celular",
  "luz",
  "banco",
  "presente",
  "bebida",
  "hospital",
  "conta",
  "reserva",
  "corte",
  "coracao",
  "gas",
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

export const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// ─── BUDGET PLANS ────────────────────────────────────────────────────────────
export const PRESET_PLANS = [
  {
    id: "50-30-20",
    name: "50 / 30 / 20",
    badge: "Clássico",
    desc: "A regra de ouro das finanças pessoais",
    groups: [
      { id: "nec", label: "Necessidades", pct: 50, color: "#6DBFE8", icon: "moradia",       catIds: ["moradia", "alimentacao", "saude", "transporte"] },
      { id: "des", label: "Desejos",      pct: 30, color: "#A86DE8", icon: "lazer",         catIds: ["lazer", "educacao", "outros"] },
      { id: "pou", label: "Poupança",     pct: 20, color: "#6DE8A0", icon: "investimentos", catIds: [] },
    ],
  },
  {
    id: "70-20-10",
    name: "70 / 20 / 10",
    badge: "Agressivo",
    desc: "Para quem tem mais gastos fixos essenciais",
    groups: [
      { id: "nec", label: "Necessidades", pct: 70, color: "#6DBFE8", icon: "moradia",       catIds: ["moradia", "alimentacao", "saude", "transporte"] },
      { id: "des", label: "Desejos",      pct: 20, color: "#A86DE8", icon: "lazer",         catIds: ["lazer", "educacao", "outros"] },
      { id: "pou", label: "Poupança",     pct: 10, color: "#6DE8A0", icon: "investimentos", catIds: [] },
    ],
  },
  {
    id: "80-10-10",
    name: "80 / 10 / 10",
    badge: "Conservador",
    desc: "Para renda menor com foco em sobrevivência",
    groups: [
      { id: "nec", label: "Necessidades", pct: 80, color: "#6DBFE8", icon: "moradia",       catIds: ["moradia", "alimentacao", "saude", "transporte"] },
      { id: "des", label: "Desejos",      pct: 10, color: "#A86DE8", icon: "lazer",         catIds: ["lazer", "educacao", "outros"] },
      { id: "pou", label: "Poupança",     pct: 10, color: "#6DE8A0", icon: "investimentos", catIds: [] },
    ],
  },
];

// ─── CARDS ────────────────────────────────────────────────────────────────────
export const DEFAULT_CARDS = [
  
];

export const BANK_CARDS = [
  { id: "nubank", name: "Nubank", domain: "nubank.com.br", colors: ["#820AD1", "#61079e"], textColor: "#ffffff" },
  { id: "itau", name: "Itaú", domain: "itau.com.br", colors: ["#EC7000", "#FF8e1a"], textColor: "#ffffff" },
  { id: "itau_personnalite", name: "Itaú Personnalité", domain: "itau.com.br", colors: ["#1B1B1B", "#2b2b2b"], textColor: "#D4AF37" },
  { id: "bb", name: "Banco do Brasil", domain: "bb.com.br", colors: ["#F9D000", "#FFe233"], textColor: "#111111" },
  { id: "bb_alt", name: "BB Ourocard", domain: "bb.com.br", colors: ["#004785", "#00325d"], textColor: "#ffffff" },
  { id: "santander", name: "Santander", domain: "santander.com.br", colors: ["#EC0000", "#c40000"], textColor: "#ffffff" },
  { id: "c6", name: "C6 Bank", domain: "c6bank.com.br", colors: ["#242424", "#0A0A0A"], textColor: "#ffffff" },
  { id: "c6_carbon", name: "C6 Carbon", domain: "c6bank.com.br", colors: ["#000000", "#111111"], textColor: "#ffffff" },
  { id: "inter", name: "Banco Inter", domain: "bancointer.com.br", colors: ["#FF7A00", "#d46500"], textColor: "#ffffff" },
  { id: "bradesco", name: "Bradesco", domain: "bradesco.com.br", colors: ["#CC092F", "#9a0623"], textColor: "#ffffff" },
  { id: "bradesco_prime", name: "Bradesco Prime", domain: "bradesco.com.br", colors: ["#1a1a1a", "#292929"], textColor: "#ffffff" },
  { id: "bradesco_amex", name: "Bradesco Amex", domain: "bradesco.com.br", colors: ["#001C5A", "#00103A"], textColor: "#ffffff" },
  { id: "picpay", name: "PicPay", domain: "picpay.com", colors: ["#11C76F", "#0e9151"], textColor: "#ffffff" },
  { id: "mercadopago", name: "Mercado Pago", domain: "mercadopago.com.br", colors: ["#009DE0", "#007eb3"], textColor: "#ffffff" },
  { id: "sicredi", name: "Sicredi", domain: "sicredi.com.br", colors: ["#00573D", "#003726"], textColor: "#ffffff" },
  { id: "sicoob", name: "Sicoob", domain: "sicoob.com.br", colors: ["#00A78F", "#007161"], textColor: "#ffffff" },
  { id: "caixa", name: "Caixa", domain: "caixa.gov.br", colors: ["#005CA9", "#003f74"], textColor: "#ffffff" },
  { id: "safra", name: "Banco Safra", domain: "safra.com.br", colors: ["#000033", "#00001a"], textColor: "#D4AF37", border: "1px solid #D4AF37" },
  { id: "xp", name: "XP", domain: "xpi.com.br", colors: ["#171717", "#0a0a0a"], textColor: "#ffffff" },
  { id: "btg", name: "BTG Pactual", domain: "btgpactual.com", colors: ["#1e2d42", "#0b111a"], textColor: "#ffffff" },
  { id: "black", name: "Black Genérico", domain: "", colors: ["#000000", "#191919"], textColor: "#ffffff" },
  { id: "prata", name: "Platinum Genérico", domain: "", colors: ["#e0e0e0", "#b3b3b3"], textColor: "#111111" },
];

export const SAMPLE_TX = [];
export const MONTHLY_HIST = [];

// ─── LOCALSTORAGE KEYS ────────────────────────────────────────────────────────
export const LS_TX        = "orcpro_tx";
export const LS_CAT       = "orcpro_cat";
export const LS_PLAN      = "orcpro_plan";
export const LS_CUSTBUD   = "orcpro_custbud";
export const LS_CUSTPLANS = "orcpro_custplans";
export const LS_CARDS     = "orcpro_cards";

// ─── LOADERS ─────────────────────────────────────────────────────────────────
export const loadTx = () => {
  try { const v = localStorage.getItem(LS_TX);        return v ? JSON.parse(v) : []; }
  catch { return SAMPLE_TX; }
};
export const loadCat = () => {
  try { const v = localStorage.getItem(LS_CAT);       return v ? JSON.parse(v) : DEFAULT_CATEGORIES; }
  catch { return DEFAULT_CATEGORIES; }
};
export const loadPlan = () => {
  try { const v = localStorage.getItem(LS_PLAN);      return v || "50-30-20"; }
  catch { return "50-30-20"; }
};
export const loadCustBud = () => {
  try { const v = localStorage.getItem(LS_CUSTBUD);   return v ? JSON.parse(v) : []; }
  catch { return []; }
};
export const loadCustPlans = () => {
  try { const v = localStorage.getItem(LS_CUSTPLANS); return v ? JSON.parse(v) : []; }
  catch { return []; }
};
export const loadCards = () => {
  try { const v = localStorage.getItem(LS_CARDS);     return v ? JSON.parse(v) : []; }
  catch { return DEFAULT_CARDS; }
};