import { useState, useEffect, useMemo, useCallback } from "react";
import { BANK_CARDS } from "../constants";
import { cardService } from "../services/cardService";
import type { Card, CardForm, StoredCard, Transaction } from "../types/finance";

export const EMPTY_CARD_FORM: CardForm = {
  name: "",
  digits: "",
  flag: "Visa",
  limit: "",
  balance: "",
  due: "",
  gradIdx: 0,
};

const getDateValue = (date: string): number => {
  const parsed = new Date(`${String(date ?? "")}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

export function useCards(transactions: Transaction[] = [], month: number, year: number) {
  const [cards, setCards] = useState<StoredCard[]>(cardService.getAll);

  useEffect(() => {
    cardService.saveAll(cards);
  }, [cards]);

  const [initialCardForm, setInitialCardForm] = useState<CardForm>(EMPTY_CARD_FORM);
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Card["id"] | null>(null);

  const openNewCard = useCallback(() => {
    setEditingCard(null);
    setInitialCardForm(EMPTY_CARD_FORM);
    setShowCardModal(true);
  }, []);

  const cardsWithBill = useMemo<Card[]>(() => {
    const billMap = transactions.reduce<Record<string, number>>((acc, transaction) => {
      if (
        transaction.paymentMethod === "credito" &&
        transaction.type === "expense" &&
        transaction.paid === true
      ) {
        const parsedDate = new Date(getDateValue(transaction.date));

        if (parsedDate.getMonth() === month && parsedDate.getFullYear() === year) {
          const cardId = String(transaction.cardId);
          acc[cardId] = (acc[cardId] || 0) + (transaction.value || 0);
        }
      }

      return acc;
    }, {});

    return cards.map((card) => {
      const bill = billMap[String(card.id)] || 0;
      const baseBalance = Number(card.baseBalance) || 0;
      const totalBalance = baseBalance + bill;

      return {
        ...card,
        balance: totalBalance,
        available: (Number(card.limit) || 0) - totalBalance,
      };
    });
  }, [cards, month, transactions, year]);

  const openEditCard = useCallback((card: Card) => {
    let gradIdx = BANK_CARDS.findIndex((bank) => bank.id === card.bankId);

    if (gradIdx === -1) {
      gradIdx = BANK_CARDS.findIndex((bank) => bank.colors[0] === card.grad?.[0]);
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
  }, []);

  const saveCard = useCallback(
    (formParams: CardForm) => {
      const digitsClean = formParams.digits.replace(/\D/g, "").slice(0, 4);
      const bank = BANK_CARDS[formParams.gradIdx] || BANK_CARDS[0];
      const data: Omit<StoredCard, "id"> = {
        name: formParams.name.trim(),
        digits: digitsClean,
        flag: formParams.flag,
        limit: parseFloat(formParams.limit) || 0,
        baseBalance: parseFloat(formParams.balance) || 0,
        due: formParams.due,
        grad: bank.colors,
        bankId: bank.id,
      };

      setCards((prev) => {
        if (editingCard != null) {
          return prev.map((card) =>
            card.id === editingCard ? { ...card, ...data } : card,
          );
        }

        return [...prev, { id: Date.now(), ...data }];
      });

      setShowCardModal(false);
    },
    [editingCard],
  );

  const removeCard = useCallback((id: Card["id"]) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
    return true;
  }, []);

  return useMemo(
    () => ({
      cards: cardsWithBill,
      initialCardForm,
      showCardModal,
      setShowCardModal,
      editingCard,
      openNewCard,
      openEditCard,
      saveCard,
      removeCard,
    }),
    [
      cardsWithBill,
      editingCard,
      initialCardForm,
      openEditCard,
      openNewCard,
      removeCard,
      saveCard,
      showCardModal,
    ],
  );
}
