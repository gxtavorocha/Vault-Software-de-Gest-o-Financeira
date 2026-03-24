import { useState, useEffect, useMemo } from "react";
import { CARD_GRADS } from "../constants";
import { cardService } from "../services/cardService";
// ── Formulário vazio padrão ───────────────────────────────────────────────────
export const EMPTY_CARD_FORM = {
  name: "",
  digits: "",
  flag: "Visa",
  limit: "",
  due: "",
  gradIdx: 0,
};

// ════════════════════════════════════════════════════════════════════════════
export function useCards(transactions =[], month,year) {
  const [cards, setCards] = useState(cardService.getAll);

  useEffect(() => {
    cardService.saveAll(cards);
  }, [cards]);
  const [cardForm, setCardForm] = useState(EMPTY_CARD_FORM);
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const openNewCard = () => {
    setEditingCard(null);
    setCardForm(EMPTY_CARD_FORM);
    setShowCardModal(true);
  };


  const cardsWithBill = useMemo(() => {
    // 1. Pre-calculate bills per card for the current month/year
    const billMap = transactions.reduce((acc, tx) => {
      if (
        tx.paymentMethod === "credito" &&
        tx.type === "expense" &&
        tx.paid === true
      ) {
        const d = new Date(tx.date + "T12:00:00"); // Standardized date parsing
        if (d.getMonth() === month && d.getFullYear() === year) {
          const cid = String(tx.cardId);
          acc[cid] = (acc[cid] || 0) + (tx.value || 0);
        }
      }
      return acc;
    }, {});

    // 2. Map cards to their bills
    return cards.map((card) => {
      const bill = billMap[String(card.id)] || 0;
      return {
        ...card,
        balance: bill,
        available: (parseFloat(card.limit) || 0) - bill,
      };
    });
  }, [cards, transactions, month, year]);





  const openEditCard = (card) => {
    // BUG CORRIGIDO #2: acesso seguro a card.grad com optional chaining
    const gradIdx = CARD_GRADS.findIndex((g) => g.colors[0] === card.grad?.[0]);
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
    // BUG CORRIGIDO #3: valida que digits tem exatamente 4 dígitos numéricos
    const digitsClean = cardForm.digits.replace(/\D/g, "").slice(0, 4);

    if (!cardForm.name.trim() || digitsClean.length !== 4 || !cardForm.limit)
      return false;

    const grad = CARD_GRADS[cardForm.gradIdx]?.colors || CARD_GRADS[0].colors;
    const data = {
      name: cardForm.name.trim(),
      digits: digitsClean,
      flag: cardForm.flag,
      limit: parseFloat(cardForm.limit) || 0,
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
    cards: cardsWithBill,
    cardForm,
    setCardForm,
    showCardModal,
    setShowCardModal, // BUG CORRIGIDO #1: estava faltando no retorno
    editingCard,
    // handlers
    openNewCard,
    openEditCard,
    saveCard,
    removeCard,
  };
}