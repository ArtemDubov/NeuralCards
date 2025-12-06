/**
 * РЕЖИМ ЭКЗАМЕНА (ОБНОВЛЕННЫЙ)
 * Использует useTrainingBase и useTrainingTimer для ограничения времени на карточку
 */

import { useState, useCallback } from "react";
import { useTrainingBase, useTrainingTimer, calculateProgress } from "./shared";

export const useExamMode = (cards, onAnswer) => {
  // === БАЗОВАЯ ЛОГИКА ===
  const {
    currentCard,
    currentIndex,
    isCompleted: baseCompleted,
    score,
    answers,
    handleAnswer: baseHandleAnswer,
    nextCard,
    setIsCompleted,
  } = useTrainingBase(cards, onAnswer);

  // === УНИКАЛЬНАЯ ЛОГИКА ЭКЗАМЕНА ===
  const [examAnswers, setExamAnswers] = useState([]);
  const [timeouts, setTimeouts] = useState(0);

  // Таймер для текущей карточки (30 секунд на ответ)
  const {
    timeLeft,
    isActive: timerActive,
    isTimeout,
    timeStats,
    resetTimer,
    startTimer,
    pauseTimer,
    formatTime,
  } = useTrainingTimer({
    initialTime: 30,
    mode: "perCard",
    autoStart: true,
    onTimeout: () => {
      handleTimeout(); // Таймаут на карточке
    },
  });

  // Таймаут - автоматически неправильный ответ
  const handleTimeout = useCallback(() => {
    if (!currentCard) return;

    const answer = {
      cardId: currentCard.id,
      isCorrect: false,
      timeUsed: 30,
      wasTimeout: true,
    };

    setExamAnswers((prev) => [...prev, answer]);
    setTimeouts((prev) => prev + 1);

    // Используем базовый обработчик
    baseHandleAnswer(false, 2, 0);

    // Следующая карточка
    if (currentIndex >= cards.length - 1) {
      finishExam();
    } else {
      nextCard();
      resetTimer(30);
    }
  }, [
    currentCard,
    currentIndex,
    cards.length,
    baseHandleAnswer,
    nextCard,
    resetTimer,
  ]);

  // Обработка ответа пользователя
  const handleAnswer = useCallback(
    (isCorrect) => {
      if (!currentCard || !timerActive) return;

      const timeUsed = 30 - timeLeft;
      const answer = {
        cardId: currentCard.id,
        isCorrect,
        timeUsed,
        wasTimeout: false,
      };

      setExamAnswers((prev) => [...prev, answer]);
      pauseTimer();

      // Используем базовый обработчик
      baseHandleAnswer(isCorrect, isCorrect ? 0 : 2, isCorrect ? 10 : 0);

      // Пауза перед следующей карточкой
      setTimeout(() => {
        if (currentIndex >= cards.length - 1) {
          finishExam();
        } else {
          nextCard();
          resetTimer(30);
          startTimer();
        }
      }, 1000);
    },
    [
      currentCard,
      timerActive,
      timeLeft,
      currentIndex,
      cards.length,
      baseHandleAnswer,
      nextCard,
      resetTimer,
      startTimer,
      pauseTimer,
    ]
  );

  // Завершение экзамена
  const finishExam = useCallback(() => {
    setIsCompleted(true);
    pauseTimer();
  }, [setIsCompleted, pauseTimer]);

  // Быстрые кнопки
  const handleCorrect = () => handleAnswer(true);
  const handleWrong = () => handleAnswer(false);

  // Статистика экзамена
  const correctAnswers = examAnswers.filter((a) => a.isCorrect).length;
  const totalAnswered = examAnswers.length;
  const examScore =
    totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
  const passed = examScore >= 75;

  const examStats = {
    current: currentIndex + 1,
    total: cards.length,
    timeLeft,
    correct: correctAnswers,
    answered: totalAnswered,
    timeouts,
    score: examScore,
    passed,
    isCompleted: baseCompleted,
    timerActive,
  };

  const examProgress = calculateProgress(currentIndex, cards.length, {
    score: examScore,
    passed,
    timeLeft: formatTime(timeLeft),
  });

  return {
    currentCard,
    examStats,
    examProgress,
    isCompleted: baseCompleted,
    timerActive,
    handleCorrect,
    handleWrong,
    timeStats,

    // Результаты экзамена
    getExamResults: () => ({
      score: examScore,
      correct: correctAnswers,
      total: totalAnswered,
      timeouts,
      passed,
      totalTime: examAnswers.reduce((sum, a) => sum + a.timeUsed, 0),
      averageTime:
        totalAnswered > 0
          ? Math.round(
              examAnswers.reduce((sum, a) => sum + a.timeUsed, 0) /
                totalAnswered
            )
          : 0,
    }),
  };
};
