/**
 * РЕЖИМ СПРИНТА (ОБНОВЛЕННЫЙ)
 * Использует общий таймер useTrainingTimer
 * Добавляет логику быстрых ответов и циклического прохождения
 */

import { useCallback } from "react";
import { useTrainingBase, useTrainingTimer } from "./shared";

export const useSprintMode = (cards, onAnswer) => {
  // === БАЗОВАЯ ЛОГИКА ИЗ useTrainingBase ===
  const {
    currentCard,
    currentIndex,
    isCompleted,
    progress,
    stats,
    handleAnswer: baseHandleAnswer,
    resetTraining,
  } = useTrainingBase(cards, onAnswer);

  // === ТАЙМЕР СПРИНТА (60 секунд на всю тренировку) ===
  const {
    timeLeft,
    isActive,
    isTimeout,
    timeStats,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
  } = useTrainingTimer({
    initialTime: 60,
    mode: "global",
    autoStart: true,
    onTimeout: () => {
      console.log("⏱️ Время спринта вышло!");
    },
  });

  // === УНИКАЛЬНАЯ ЛОГИКА СПРИНТА ===

  // Обработка правильного ответа
  const handleCorrect = useCallback(() => {
    if (!isActive || !currentCard) return;

    // Используем базовый обработчик с бонусом за скорость
    const timeBonus = timeLeft > 45 ? 5 : 0; // Бонус если много времени осталось
    baseHandleAnswer(true, 0, 10 + timeBonus);
  }, [currentCard, isActive, timeLeft, baseHandleAnswer]);

  // Обработка неправильного ответа
  const handleWrong = useCallback(() => {
    if (!isActive || !currentCard) return;

    baseHandleAnswer(false, 2, 0);
  }, [currentCard, isActive, baseHandleAnswer]);

  // Сброс спринта
  const resetSprint = useCallback(() => {
    resetTraining();
    resetTimer();
    startTimer();
  }, [resetTraining, resetTimer, startTimer]);

  // Пауза/продолжение
  const togglePause = useCallback(() => {
    if (isActive) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [isActive, pauseTimer, startTimer]);

  // === СТАТИСТИКА СПРИНТА ===
  const sprintStats = {
    ...stats,
    timeLeft,
    isActive,
    isTimeout,
    timeFormatted: formatTime(),
    speed:
      progress.total > 0
        ? Math.round((stats.correctAnswers / (60 - timeLeft)) * 60) // карточек в минуту
        : 0,
    timeBonus: Math.max(0, timeLeft - 45), // бонусное время
  };

  // === ДОПОЛНИТЕЛЬНЫЙ ПРОГРЕСС ===
  const sprintProgress = {
    ...progress,
    // В спринте карточки идут по кругу
    isCyclic: true,
    currentCycle: Math.floor(currentIndex / cards.length) + 1,
  };

  return {
    // Из базового хука
    currentCard,
    isCompleted: isCompleted || isTimeout,
    progress: sprintProgress,

    // Из таймера
    timeLeft,
    isActive,
    isTimeout,
    timeStats,

    // Уникальное для спринта
    handleCorrect,
    handleWrong,
    stats: sprintStats,

    // Управление
    resetSprint,
    togglePause,

    // Флаги
    isSprintMode: true,
    isTimedMode: true,
  };
};
