/**
 * РЕЖИМ ОБРАТНОГО ОТСЧЕТА (ОБНОВЛЕННЫЙ)
 * Использует useTrainingBase и useTrainingTimer с уменьшающимся временем
 */

import { useState, useCallback } from "react";
import { useTrainingBase, useTrainingTimer, calculateProgress } from "./shared";

export const useCountdownMode = (cards, onAnswer) => {
  // === БАЗОВАЯ ЛОГИКА ===
  const {
    currentCard,
    currentIndex,
    isCompleted: baseCompleted,
    score,
    answers,
    handleAnswer: baseHandleAnswer,
    nextCard,
    setScore,
  } = useTrainingBase(cards, onAnswer);

  // === УНИКАЛЬНАЯ ЛОГИКА ОБРАТНОГО ОТСЧЕТА ===
  const [timeBonus, setTimeBonus] = useState(0);
  const [gameActive, setGameActive] = useState(true);

  // Конфигурация режима
  const CONFIG = {
    startTime: 60,
    minTime: 5,
    timeDecrease: 5,
    timeBonus: 2,
    quickAnswerThreshold: 10,
  };

  // Расчет времени для текущей карточки
  const getTimeForCard = useCallback(
    (cardIndex) => {
      const baseTime =
        CONFIG.startTime - cardIndex * CONFIG.timeDecrease + timeBonus;
      return Math.max(baseTime, CONFIG.minTime);
    },
    [timeBonus]
  );

  // Таймер для текущей карточки
  const {
    timeLeft,
    isActive: timerActive,
    isTimeout,
    timeStats,
    resetTimer,
    startTimer,
    pauseTimer,
    addTime,
    formatTime,
  } = useTrainingTimer({
    initialTime: getTimeForCard(0),
    mode: "perCard",
    autoStart: true,
    onTimeout: () => {
      handleTimeout(); // Время на карточку вышло
    },
  });

  // Обновление таймера при смене карточки
  const updateTimerForCard = useCallback(() => {
    const newTime = getTimeForCard(currentIndex);
    resetTimer(newTime);
    if (gameActive) startTimer();
  }, [currentIndex, getTimeForCard, resetTimer, startTimer, gameActive]);

  // Таймаут - время вышло
  const handleTimeout = useCallback(() => {
    if (!currentCard) return;

    setGameActive(false);

    // Используем базовый обработчик
    baseHandleAnswer(false, 2, 0);

    // Пауза перед следующей карточкой
    setTimeout(() => {
      if (currentIndex >= cards.length - 1) {
        // Последняя карточка - игра завершена
        console.log("⏳ Игра завершена! Время вышло");
      } else {
        nextCard();
        updateTimerForCard();
        setGameActive(true);
      }
    }, 1500);
  }, [
    currentCard,
    currentIndex,
    cards.length,
    baseHandleAnswer,
    nextCard,
    updateTimerForCard,
  ]);

  // Обработка ответа с бонусами за скорость
  const handleAnswer = useCallback(
    (isCorrect) => {
      if (!gameActive || !currentCard) return;

      pauseTimer();
      setGameActive(false);

      // Бонус за быстрый ответ
      const timeUsed = getTimeForCard(currentIndex) - timeLeft;
      let bonusPoints = 0;
      let bonusTime = 0;

      if (isCorrect && timeUsed <= CONFIG.quickAnswerThreshold) {
        bonusPoints = 5;
        bonusTime = CONFIG.timeBonus;
      }

      // Обновляем счет и бонусное время
      const points = isCorrect ? 10 + bonusPoints : 0;
      setScore((prev) => prev + points);
      setTimeBonus((prev) => prev + bonusTime);

      // Используем базовый обработчик
      baseHandleAnswer(isCorrect, isCorrect ? 0 : 2, points);

      // Пауза перед следующей карточкой
      setTimeout(() => {
        if (currentIndex >= cards.length - 1) {
          // Последняя карточка - игра завершена
          console.log("🏁 Обратный отсчет завершен!");
        } else {
          // Следующая карточка с бонусным временем
          nextCard();
          updateTimerForCard();
          setGameActive(true);
        }
      }, 1000);
    },
    [
      gameActive,
      currentCard,
      currentIndex,
      timeLeft,
      getTimeForCard,
      baseHandleAnswer,
      nextCard,
      updateTimerForCard,
      pauseTimer,
    ]
  );

  // Быстрые кнопки
  const handleCorrect = () => handleAnswer(true);
  const handleWrong = () => handleAnswer(false);

  // Статистика
  const countdownStats = {
    currentCard: currentIndex + 1,
    totalCards: cards.length,
    timeLeft,
    score,
    timeBonus,
    gameActive,
    timerActive,
    timeForCurrentCard: getTimeForCard(currentIndex),
    nextCardTime:
      currentIndex < cards.length - 1 ? getTimeForCard(currentIndex + 1) : 0,
    isCompleted: baseCompleted || currentIndex >= cards.length,
  };

  const countdownProgress = calculateProgress(currentIndex, cards.length, {
    timeLeft: formatTime(timeLeft),
    timeBonus,
    averageTime: CONFIG.startTime - Math.round(score / 10),
  });

  return {
    currentCard,
    countdownStats,
    countdownProgress,
    isCompleted: countdownStats.isCompleted,
    gameActive,
    timeStats,
    handleCorrect,
    handleWrong,

    // Дополнительные методы
    addBonusTime: (seconds) => {
      addTime(seconds);
      setTimeBonus((prev) => prev + seconds);
    },

    getFinalStats: () => ({
      finalScore: score,
      totalCards: cards.length,
      timeBonusTotal: timeBonus,
      averageTimePerCard:
        cards.length > 0
          ? Math.round((CONFIG.startTime * cards.length - score) / cards.length)
          : 0,
      cardsCompleted: currentIndex,
      quickAnswers: answers.filter((a) => a.points > 10).length,
    }),
  };
};
