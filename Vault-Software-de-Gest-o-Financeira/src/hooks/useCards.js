import { useState } from "react";
import { LS_CARDS, CARD_GRADS, loadCards } from "../constants";
import { useLocalStorage } from "./useLocalStorage";

// ── Formulário vazio padrão ───────────────────────────────────────────────────
export const EMPTY_CARD_FORM = {
  name: "",
  digits: "",
  flag: "Visa",
  limit: "",
  balance: "",
  due: "",
  gradIdx: 0,
};

// ════════════════════════════════════════════════════════════════════════════
export function useCards() {
  const [cards, setCards] = useLocalStorage(LS_CARDS, loadCards);
  const [cardForm, setCardForm] = useState(EMPTY_CARD_FORM);
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const openNewCard = () => {
    setEditingCard(null);
    setCardForm(EMPTY_CARD_FORM);
    setShowCardModal(true);
  };

  const openEditCard = (card) => {
    const gradIdx = CARD_GRADS.findIndex((g) => g.colors[0] === card.grad[0]);
    setEditingCard(card.id);
    setCardForm({
      name: card.name,
      digits: card.digits,
      flag: card.flag,
      limit: String(card.limit),
      balance: String(card.balance),
      due: card.due,
      gradIdx: gradIdx >= 0 ? gradIdx : 0,
    });
    setShowCardModal(true);
  };

  const saveCard = () => {
    if (!cardForm.name.trim() || !cardForm.digits.trim() || !cardForm.limit)
      return false;

    const grad = CARD_GRADS[cardForm.gradIdx]?.colors || CARD_GRADS[0].colors;
    const data = {
      name: cardForm.name,
      digits: cardForm.digits,
      flag: cardForm.flag,
      limit: parseFloat(cardForm.limit) || 0,
      balance: parseFloat(cardForm.balance) || 0,
      due: cardForm.due,
      grad,
    };

    if (editingCard != null) {
      setCards((prev) =>
        prev.map((c) => (c.id === editingCard ? { ...c, ...data } : c)),
      );
    } else {
      setCards((prev) => [...prev, { id: Date.now(), ...data }]);
    }

    setShowCardModal(false);
    return true;
  };

  const removeCard = (id) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  // ── Retorno ──────────────────────────────────────────────────────────────────

  return {
    // estado
    cards,
    cardForm,
    setCardForm,
    showCardModal,
    editingCard,
    // handlers
    openNewCard,
    openEditCard,
    saveCard,
    removeCard,
  };
}
