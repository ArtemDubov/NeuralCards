import { useState, useCallback } from "react";

export const usePracticeMode = (initialCards = []) => {
  const [cards, setCards] = useState(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState({
    learned: 0,
    repeats: 0,
    totalProcessed: 0,
  });

  const currentCard = cards[currentIndex] || null;

  const handleAnswer = useCallback(
    (remembered) => {
      setStats((prev) => ({
        ...prev,
        learned: remembered ? prev.learned + 1 : prev.learned,
        repeats: remembered ? prev.repeats : prev.repeats + 1,
        totalProcessed: prev.totalProcessed + 1,
      }));

      if (remembered) {
        // Убираем карточку из колоды
        const newCards = cards.filter((_, idx) => idx !== currentIndex);
        setCards(newCards);

        if (newCards.length > 0) {
          // Переходим к следующей карточке, если она есть
          const nextIndex = currentIndex < newCards.length ? currentIndex : 0;
          setCurrentIndex(nextIndex);
        } else {
          // Колода пуста
          setCurrentIndex(-1);
        }
      } else {
        // Перемещаем карточку в конец
        const currentCard = cards[currentIndex];
        const newCards = [
          ...cards.filter((_, idx) => idx !== currentIndex),
          currentCard,
        ];
        setCards(newCards);

        // Переходим к следующей карточке
        const nextIndex = currentIndex < newCards.length - 1 ? currentIndex : 0;
        setCurrentIndex(nextIndex);
      }
    },
    [cards, currentIndex]
  );

  const isCompleted = cards.length === 0;

  return {
    currentCard,
    cards,
    stats,
    handleAnswer,
    isCompleted,
    progressPercentage:
      cards.length > 0
        ? Math.round((stats.learned / initialCards.length) * 100)
        : 100,
  };
};
