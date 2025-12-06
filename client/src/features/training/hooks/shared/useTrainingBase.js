/**
 * БАЗОВЫЙ ХУК ДЛЯ ВСЕХ РЕЖИМОВ ТРЕНИРОВОК
 * Содержит общую логику, которую используют 90% режимов
 *
 * Используется в: practice, quiz, sprint, exam, countdown, wave, tournament, carousel
 * Не используется в: memory (особая логика), audio (аудио), mixer (микширование), ai (ai-логика)
 */

import { useState, useCallback } from "react";

export const useTrainingBase = (cards = [], onAnswer) => {
  // Проверяем, что cards - массив
  const safeCards = Array.isArray(cards) ? cards : [];

  // === ОБЩЕЕ СОСТОЯНИЕ ===
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);

  // === ОБЩИЕ СЕЛЕКТОРЫ ===
  const currentCard = safeCards?.[currentIndex] || null;
  const totalCards = safeCards?.length || 0;
  const isLastCard = currentIndex >= totalCards - 1;

  // === ОБЩАЯ ЛОГИКА ОБРАБОТКИ ОТВЕТА ===
  const handleAnswer = useCallback(
    (isCorrect, difficulty = null, customPoints = null) => {
      if (!currentCard) return;

      // Расчет очков (можно переопределить в режиме)
      const points = customPoints !== null ? customPoints : isCorrect ? 10 : 0;

      // Обновляем состояние
      setScore((prev) => prev + points);
      setAnswers((prev) => [
        ...prev,
        {
          cardId: currentCard.id,
          isCorrect,
          difficulty,
          points,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Передаем в родительский обработчик (training-store)
      onAnswer(isCorrect, difficulty);

      // Переход к следующей карточке или завершение
      if (isLastCard) {
        setIsCompleted(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }

      return { isCorrect, points };
    },
    [currentCard, isLastCard, onAnswer]
  );

  // === ОБЩИЕ ДЕЙСТВИЯ ===
  const nextCard = useCallback(() => {
    if (isLastCard) {
      setIsCompleted(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [isLastCard]);

  const previousCard = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const resetTraining = useCallback(() => {
    setCurrentIndex(0);
    setIsCompleted(false);
    setScore(0);
    setAnswers([]);
  }, []);

  // === ОБЩАЯ СТАТИСТИКА ===
  const progress = {
    current: currentIndex + 1,
    total: totalCards,
    percentage:
      totalCards > 0 ? Math.round(((currentIndex + 1) / totalCards) * 100) : 0,
    isCompleted,
  };

  const stats = {
    score,
    totalCards,
    correctAnswers: answers.filter((a) => a.isCorrect).length,
    totalAnswers: answers.length,
    accuracy:
      answers.length > 0
        ? Math.round(
            (answers.filter((a) => a.isCorrect).length / answers.length) * 100
          )
        : 0,
  };

  // === ЭКСПОРТ ВСЕГО, ЧТО МОЖЕТ ПОТРЕБОВАТЬСЯ ===
  return {
    // Состояние
    currentCard,
    currentIndex,
    isCompleted,
    score,
    answers,

    // Селекторы
    progress,
    stats,
    isLastCard,
    totalCards,

    // Действия
    handleAnswer,
    nextCard,
    previousCard,
    resetTraining,
    setCurrentIndex,
    setIsCompleted,
    setScore,

    // Утилиты для расширения
    base: {
      getCurrentCard: () => currentCard,
      getProgress: () => progress,
      getStats: () => stats,
    },
  };
};
