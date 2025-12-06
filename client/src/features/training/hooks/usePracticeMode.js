/**
 * РЕЖИМ ПРАКТИКИ (ОБНОВЛЕННЫЙ)
 * Использует общий хук useTrainingBase для базовой логики
 * Добавляет уникальную логику переворота карточек и повторения
 */

import { useState, useCallback } from "react";
import { useTrainingBase } from "./shared";

export const usePracticeMode = (cards, onAnswer) => {
  // === БАЗОВАЯ ЛОГИКА ИЗ useTrainingBase ===
  const {
    currentCard,
    currentIndex,
    isCompleted,
    progress,
    stats,
    handleAnswer: baseHandleAnswer,
    nextCard,
    resetTraining,
  } = useTrainingBase(cards, onAnswer);

  // === УНИКАЛЬНАЯ ЛОГИКА РЕЖИМА ПРАКТИКИ ===
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [repeatDeck, setRepeatDeck] = useState([]);
  const [currentDeck, setCurrentDeck] = useState([...cards]);

  // === ПЕРЕВОРОТ КАРТОЧКИ ===
  const handleFlipCard = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setIsFlipped(!isFlipped);

    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  }, [isFlipped, isAnimating]);

  // === ОБРАБОТКА ОТВЕТА "ПОМНЮ" ===
  const handleRemember = useCallback(() => {
    if (!currentCard) return;

    // Используем базовый обработчик с кастомными параметрами
    baseHandleAnswer(true, 0, 10); // difficulty=0 (легко), points=10

    // Убираем карточку из текущей колоды
    setCurrentDeck((prev) => prev.filter((card) => card.id !== currentCard.id));

    // Следующая карточка
    setTimeout(() => {
      setIsFlipped(false);
      nextCard();
    }, 300);
  }, [currentCard, baseHandleAnswer, nextCard]);

  // === ОБРАБОТКА ОТВЕТА "ЗАБЫЛ" ===
  const handleForget = useCallback(() => {
    if (!currentCard) return;

    // Если карточка не перевернута, переворачиваем автоматически
    if (!isFlipped) {
      setIsFlipped(true);
    }

    // Используем базовый обработчик
    baseHandleAnswer(false, 2, 0); // difficulty=2 (трудно), points=0

    // Добавляем в колоду для повторения
    setRepeatDeck((prev) => [...prev, currentCard]);

    // Убираем карточку из текущей колоды
    setCurrentDeck((prev) => prev.filter((card) => card.id !== currentCard.id));

    // Следующая карточка через паузу
    setTimeout(() => {
      setIsFlipped(false);
      nextCard();
    }, 500);
  }, [currentCard, isFlipped, baseHandleAnswer, nextCard]);

  // === СТАТИСТИКА РЕЖИМА ПРАКТИКИ ===
  const practiceStats = {
    ...stats,
    remainingCurrent: currentDeck.length - 1,
    remainingRepeat: repeatDeck.length,
    totalToRepeat: repeatDeck.length,
    isRepeating: repeatDeck.length > 0,
  };

  // === ДОПОЛНИТЕЛЬНЫЙ ПРОГРЕСС ===
  const practiceProgress = {
    ...progress,
    // Для практики учитываем карточки на повторение
    totalWithRepeat: cards.length + repeatDeck.length,
    repeatCount: repeatDeck.length,
  };

  // === РЕСЕТ С УЧЕТОМ ПОВТОРЕНИЙ ===
  const resetPractice = useCallback(() => {
    resetTraining();
    setIsFlipped(false);
    setRepeatDeck([]);
    setCurrentDeck([...cards]);
  }, [resetTraining, cards]);

  return {
    // Из базового хука
    currentCard,
    isCompleted,
    progress: practiceProgress,

    // Уникальное для практики
    isFlipped,
    isAnimating,
    handleFlipCard,
    handleRemember,
    handleForget,
    stats: practiceStats,

    // Дополнительные методы
    resetPractice,
    getRepeatDeck: () => repeatDeck,

    // Флаги
    isPracticeMode: true,
  };
};
