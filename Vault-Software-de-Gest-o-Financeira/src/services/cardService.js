import { LS_CARDS, loadCards } from "../constants";

export const cardService = {
  getAll: () => {
    return loadCards();
  },

  saveAll: (cards) => {
    localStorage.setItem(LS_CARDS, JSON.stringify(cards));
  },

  addCard: (card) => {
    const cards = cardService.getAll();
    cards.push(card);
    cardService.saveAll(cards);
    return card;
  },

  updateCard: (id, updatedData) => {
    let cards = cardService.getAll();
    cards = cards.map((c) => (c.id === id ? { ...c, ...updatedData } : c));
    cardService.saveAll(cards);
  },

  deleteCard: (id) => {
    let cards = cardService.getAll();
    cards = cards.filter((c) => c.id !== id);
    cardService.saveAll(cards);
  }
};
