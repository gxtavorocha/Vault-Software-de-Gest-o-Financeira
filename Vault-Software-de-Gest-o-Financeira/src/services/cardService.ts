import { LS_CARDS, loadCards } from "../constants";
import type { StoredCard } from "../types/finance";

const sanitizeCard = (unsafeValue: unknown): StoredCard | null => {
  if (!unsafeValue || typeof unsafeValue !== "object") return null;

  const card = unsafeValue as Partial<StoredCard>;
  const limit = Number(card.limit);
  const baseBalance = Number(card.baseBalance);

  return {
    id: card.id ?? `card_${Date.now()}`,
    name: String(card.name ?? "Cartao"),
    digits: String(card.digits ?? "").replace(/\D/g, "").slice(-4),
    flag: String(card.flag ?? "Visa"),
    limit: Number.isFinite(limit) ? limit : 0,
    baseBalance: Number.isFinite(baseBalance) ? baseBalance : 0,
    due: String(card.due ?? ""),
    grad: Array.isArray(card.grad) ? card.grad.map(String) : undefined,
    bankId: typeof card.bankId === "string" ? card.bankId : undefined,
  };
};

const sanitizeCards = (unsafeValue: unknown): StoredCard[] => {
  if (!Array.isArray(unsafeValue)) return [];

  return unsafeValue.reduce<StoredCard[]>((acc, entry) => {
    const sanitized = sanitizeCard(entry);
    if (sanitized) acc.push(sanitized);
    return acc;
  }, []);
};

export const cardService = {
  getAll: (): StoredCard[] => sanitizeCards(loadCards()),

  saveAll: (cards: StoredCard[]) => {
    localStorage.setItem(LS_CARDS, JSON.stringify(sanitizeCards(cards)));
  },

  addCard: (card: StoredCard): StoredCard => {
    const cards = cardService.getAll();
    cards.push(card);
    cardService.saveAll(cards);
    return card;
  },

  updateCard: (id: StoredCard["id"], updatedData: Partial<StoredCard>) => {
    const cards = cardService
      .getAll()
      .map((card) => (card.id === id ? { ...card, ...updatedData } : card));

    cardService.saveAll(cards);
  },

  deleteCard: (id: StoredCard["id"]) => {
    const cards = cardService.getAll().filter((card) => card.id !== id);
    cardService.saveAll(cards);
  },
};
