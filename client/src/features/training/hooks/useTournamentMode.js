/**
 * ТУРНИРНЫЙ РЕЖИМ (ОБНОВЛЕННЫЙ)
 * Использует useTrainingBase для базовой логики и useTrainingTimer для ограничения времени
 * Сохраняет логику уровней и квалификации
 */

import { useState, useEffect, useCallback } from "react";
import {
  useTrainingBase,
  useTrainingTimer,
  calculateProgress,
  calculateDifficulty,
} from "./shared";

export const useTournamentMode = (cards, onAnswer) => {
  // === БАЗОВАЯ ЛОГИКА ===
  const {
    currentCard,
    currentIndex,
    isCompleted: baseCompleted,
    score,
    answers,
    handleAnswer: baseHandleAnswer,
    setCurrentIndex,
    setIsCompleted,
    setScore,
  } = useTrainingBase(cards, onAnswer);

  // === УНИКАЛЬНАЯ ЛОГИКА ТУРНИРА ===
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);
  const [tournamentCards, setTournamentCards] = useState([]);
  const [roundStats, setRoundStats] = useState([]);
  const [timeBonus, setTimeBonus] = useState(0);
  const [roundActive, setRoundActive] = useState(true);
  const [tournamentCompleted, setTournamentCompleted] = useState(false);

  // Конфигурация турнира
  const TOURNAMENT_CONFIG = {
    totalLevels: 5,
    cardsPerLevel: [5, 7, 10, 12, 15],
    qualifyingScore: 80,
    timeLimit: 10,
    timeBonusPoints: 5,
  };

  // Таймер для ответа (10 секунд на карточку с бонусом за скорость)
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
    initialTime: TOURNAMENT_CONFIG.timeLimit,
    mode: "perCard",
    autoStart: true,
    onTimeout: () => {
      handleAnswerWithTimer(false, TOURNAMENT_CONFIG.timeLimit); // Таймаут = неправильный
    },
  });

  // Инициализация уровня
  useEffect(() => {
    if (cards.length < TOURNAMENT_CONFIG.cardsPerLevel[level - 1]) {
      console.error("Недостаточно карточек для турнира");
      return;
    }

    const cardsForLevel = TOURNAMENT_CONFIG.cardsPerLevel[level - 1];
    const shuffled = [...cards]
      .sort(() => Math.random() - 0.5)
      .slice(0, cardsForLevel);

    setTournamentCards(shuffled);
    setCurrentIndex(0);
    setRoundActive(true);
    setTimeBonus(0);
    resetTimer(TOURNAMENT_CONFIG.timeLimit);

    console.log(`🏆 Уровень ${level}: ${cardsForLevel} карточек`);
  }, [cards, level, resetTimer]);

  // Обработка ответа с турнирной логикой
  const handleAnswerWithTimer = useCallback(
    (isCorrect, responseTime = null) => {
      if (!currentCard || !roundActive) return;

      // Базовые очки
      let points = isCorrect ? 10 : 0;

      // Бонус за скорость
      if (
        isCorrect &&
        responseTime &&
        responseTime <= TOURNAMENT_CONFIG.timeLimit
      ) {
        points += TOURNAMENT_CONFIG.timeBonusPoints;
        setTimeBonus((prev) => prev + TOURNAMENT_CONFIG.timeBonusPoints);
      }

      // Обновляем счет
      setScore((prev) => prev + points);

      // Обновляем статистику раунда
      const roundStat = {
        cardId: currentCard.id,
        isCorrect,
        points,
        responseTime,
        level,
        round,
      };

      setRoundStats((prev) => [...prev, roundStat]);

      // Используем базовый обработчик
      baseHandleAnswer(isCorrect, isCorrect ? 0 : 2, points);

      // Пауза перед следующей карточкой
      setTimeout(() => {
        if (currentIndex >= tournamentCards.length - 1) {
          // Уровень завершен
          finishLevel();
        } else {
          setCurrentIndex((prev) => prev + 1);
          resetTimer(TOURNAMENT_CONFIG.timeLimit);
        }
      }, 1000);
    },
    [
      currentCard,
      currentIndex,
      tournamentCards.length,
      level,
      round,
      roundActive,
      baseHandleAnswer,
      resetTimer,
      setScore,
    ]
  );

  // Завершение уровня
  const finishLevel = useCallback(() => {
    setRoundActive(false);
    pauseTimer();

    const totalPossible = tournamentCards.length * 10;
    const levelStats = roundStats.filter((stat) => stat.level === level);
    const levelScore = levelStats.reduce((sum, stat) => sum + stat.points, 0);
    const percentage = Math.round((levelScore / totalPossible) * 100);
    const qualified = percentage >= TOURNAMENT_CONFIG.qualifyingScore;

    console.log(`🏁 Уровень ${level} завершен:`, {
      score: levelScore,
      totalPossible,
      percentage,
      qualified,
      timeBonus,
    });

    // Если прошел квалификацию или это последний уровень
    if (qualified || level >= TOURNAMENT_CONFIG.totalLevels) {
      if (level >= TOURNAMENT_CONFIG.totalLevels) {
        // Турнир завершен!
        setTournamentCompleted(true);
        setIsCompleted(true);
      } else {
        // Переход на следующий уровень
        setTimeout(() => {
          setLevel((prev) => prev + 1);
          setRound((prev) => prev + 1);
          setRoundStats((prev) => prev.filter((stat) => stat.level !== level));
        }, 3000);
      }
    } else {
      // Не прошел - можно повторить уровень
      console.log("Не прошел квалификацию, можно повторить");
    }
  }, [
    level,
    tournamentCards.length,
    roundStats,
    timeBonus,
    setIsCompleted,
    pauseTimer,
  ]);

  // Быстрые кнопки (имитация с таймером)
  const handleCorrect = useCallback(() => {
    const responseTime = TOURNAMENT_CONFIG.timeLimit - timeLeft;
    handleAnswerWithTimer(true, responseTime);
  }, [timeLeft, handleAnswerWithTimer]);

  const handleWrong = useCallback(() => {
    handleAnswerWithTimer(false, TOURNAMENT_CONFIG.timeLimit);
  }, [handleAnswerWithTimer]);

  // Перезапуск уровня
  const restartLevel = useCallback(() => {
    setRoundStats((prev) => prev.filter((stat) => stat.level !== level));
    setCurrentIndex(0);
    setRoundActive(true);
    setTimeBonus(0);
    resetTimer(TOURNAMENT_CONFIG.timeLimit);
  }, [level, resetTimer]);

  // Статистика турнира
  const tournamentStats = {
    level,
    totalLevels: TOURNAMENT_CONFIG.totalLevels,
    round,
    score,
    timeBonus,
    currentCard: currentIndex + 1,
    totalCards: tournamentCards.length,
    levelProgress:
      tournamentCards.length > 0
        ? Math.round(((currentIndex + 1) / tournamentCards.length) * 100)
        : 0,
    qualifiedForNextLevel: calculateQualification(),
    roundActive,
    tournamentCompleted,
  };

  // Расчет квалификации
  function calculateQualification() {
    if (tournamentCards.length === 0) return false;
    const levelStats = roundStats.filter((stat) => stat.level === level);
    const levelScore = levelStats.reduce((sum, stat) => sum + stat.points, 0);
    const totalPossible = tournamentCards.length * 10;
    const percentage = Math.round((levelScore / totalPossible) * 100);
    return percentage >= TOURNAMENT_CONFIG.qualifyingScore;
  }

  // Награды за уровни
  const getLevelReward = (levelNum) => {
    const rewards = {
      1: "🥉 Бронза",
      2: "🥈 Серебро",
      3: "🥇 Золото",
      4: "💎 Платина",
      5: "👑 Чемпион",
    };
    return rewards[levelNum] || "Участник";
  };

  const tournamentProgress = calculateProgress(
    currentIndex,
    tournamentCards.length,
    {
      level,
      totalLevels: TOURNAMENT_CONFIG.totalLevels,
      qualified: calculateQualification(),
    }
  );

  return {
    currentCard,
    tournamentStats,
    tournamentProgress,
    isCompleted: tournamentCompleted,
    roundActive,
    timeStats,
    handleCorrect,
    handleWrong,
    restartLevel,
    getLevelReward,

    // Дополнительные методы
    skipLevel: () => {
      // Принудительный переход на следующий уровень (для тестирования)
      if (level < TOURNAMENT_CONFIG.totalLevels) {
        setLevel((prev) => prev + 1);
        setRound((prev) => prev + 1);
      }
    },

    getTournamentResults: () => ({
      finalScore: score,
      levelsCompleted: level - 1,
      totalLevels: TOURNAMENT_CONFIG.totalLevels,
      timeBonusTotal: timeBonus,
      averageScore: level > 1 ? Math.round(score / (level - 1)) : 0,
      champion: level > TOURNAMENT_CONFIG.totalLevels,
      rewards: Array.from(
        { length: Math.min(level, TOURNAMENT_CONFIG.totalLevels) },
        (_, i) => getLevelReward(i + 1)
      ),
    }),
  };
};
