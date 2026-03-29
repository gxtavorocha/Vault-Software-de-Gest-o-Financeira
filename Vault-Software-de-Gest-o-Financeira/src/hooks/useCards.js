import { useState, useEffect, useMemo } from "react";
import { BANK_CARDS } from "../constants";
import { cardService } from "../services/cardService";

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
export function useCards(transactions = [], month, year) {
  const [cards, setCards] = useState(cardService.getAll);

  useEffect(() => {
    cardService.saveAll(cards);
  }, [cards]);

  const [initialCardForm, setInitialCardForm] = useState(EMPTY_CARD_FORM);
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const openNewCard = () => {
    setEditingCard(null);
    setInitialCardForm(EMPTY_CARD_FORM);
    setShowCardModal(true);
  };

  const cardsWithBill = useMemo(() => {
    const billMap = transactions.reduce((acc, tx) => {
      if (
        tx.paymentMethod === "credito" &&
        tx.type === "expense" &&
        tx.paid === true
      ) {
        const d = new Date(tx.date + "T12:00:00");
        if (d.getMonth() === month && d.getFullYear() === year) {
          const cid = String(tx.cardId);
          acc[cid] = (acc[cid] || 0) + (tx.value || 0);
        }
      }
      return acc;
    }, {});

    return cards.map((card) => {
      const bill = billMap[String(card.id)] || 0;
      const baseBalance = parseFloat(card.baseBalance) || 0;
      const totalBalance = baseBalance + bill;
      
      return {
        ...card,
        balance: totalBalance,
        available: (parseFloat(card.limit) || 0) - totalBalance,
      };
    });
  }, [cards, transactions, month, year]);


  const openEditCard = (card) => {
    let gradIdx = BANK_CARDS.findIndex((g) => g.id === card.bankId);
    if (gradIdx === -1) {
      gradIdx = BANK_CARDS.findIndex((g) => g.colors[0] === card.grad?.[0]);
    }
    setEditingCard(card.id);
    setInitialCardForm({
      name: card.name,
      digits: card.digits,
      flag: card.flag,
      limit: String(card.limit),
      balance: String(card.baseBalance || 0),
      due: card.due,
      gradIdx: gradIdx >= 0 ? gradIdx : 0,
    });
    setShowCardModal(true);
  };

  const saveCard = (formParams) => {
    const digitsClean = formParams.digits.replace(/\D/g, "").slice(0, 4);
    const bank = BANK_CARDS[formParams.gradIdx] || BANK_CARDS[0];
    const data = {
      name: formParams.name.trim(),
      digits: digitsClean,
      flag: formParams.flag,
      limit: parseFloat(formParams.limit) || 0,
      baseBalance: parseFloat(formParams.balance) || 0,
      due: formParams.due,
      grad: bank.colors,
      bankId: bank.id,
    };

    if (editingCard != null) {
      setCards((prev) =>
        prev.map((c) => (c.id === editingCard ? { ...c, ...data } : c)),
      );
    } else {
      setCards((prev) => [...prev, { id: Date.now(), ...data }]);
    }

    setShowCardModal(false);
  };

  const removeCard = (id) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  // ── Retorno ──────────────────────────────────────────────────────────────────

  return {
    // estado
    cards: cardsWithBill,
    initialCardForm,
    showCardModal,
    setShowCardModal,
    editingCard,
    // handlers
    openNewCard,
    openEditCard,
    saveCard,
    removeCard,
  };
}