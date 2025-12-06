/**
 * РЕЖИМ ВОЛН (ОБНОВЛЕННЫЙ)
 * Использует useTrainingBase для прогресса и useTrainingTimer для таймера волн
 */

import { useState, useEffect, useCallback } from "react";
import { useTrainingBase, useTrainingTimer, calculateProgress } from "./shared";

export const useWaveMode = (cards, onAnswer) => {
  // === БАЗОВАЯ ЛОГИКА ===
  const {
    currentCard,
    currentIndex,
    isCompleted: baseCompleted,
    score,
    answers,
    handleAnswer: baseHandleAnswer,
    setScore,
    setCurrentIndex,
    setIsCompleted,
  } = useTrainingBase(cards, onAnswer);

  // === УНИКАЛЬНАЯ ЛОГИКА ВОЛН ===
  const [wave, setWave] = useState(1);
  const [waveCards, setWaveCards] = useState([]);
  const [waveActive, setWaveActive] = useState(true);

  // Конфигурация волн
  const WAVE_CONFIG = {
    totalWaves: 3,
    timePerWave: 30,
    baseCards: 3,
    cardsIncreasePerWave: 2,
  };

  // Таймер для текущей волны
  const {
    timeLeft,
    isActive: timerActive,
    isTimeout,
    timeStats,
    resetTimer,
    startTimer,
    pauseTimer,
    ormatTime,
  } = useTrainingTimer({
    initialTime: WAVE_CONFIG.timePerWave,
    mode: "wave",
    autoStart: true,
    onTimeout: () => {
      handleWaveEnd(false); // Таймаут волны
    },
  });

  // Инициализация текущей волны
  useEffect(() => {
    if (!cards.length) return;

    const cardsForWave =
      WAVE_CONFIG.baseCards + (wave - 1) * WAVE_CONFIG.cardsIncreasePerWave;
    const shuffled = [...cards]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(cardsForWave, cards.length));

    setWaveCards(shuffled);
    setCurrentIndex(0);
    setWaveActive(true);
    resetTimer(WAVE_CONFIG.timePerWave);

    console.log(`🌊 Волна ${wave}: ${shuffled.length} карточек`);
  }, [cards, wave, resetTimer]);

  // Завершение волны (успешно или по таймауту)
  const handleWaveEnd = useCallback(
    (isSuccess) => {
      setWaveActive(false);
      pauseTimer();

      if (!isSuccess) {
        console.log(`⏰ Время волны ${wave} вышло!`);
      }

      // Переход к следующей волне или завершение
      if (wave >= WAVE_CONFIG.totalWaves) {
        setIsCompleted(true);
        console.log("🏁 Все волны завершены!");
      } else {
        setTimeout(() => {
          setWave((prev) => prev + 1);
        }, 2000);
      }
    },
    [wave, WAVE_CONFIG.totalWaves, setIsCompleted, pauseTimer]
  );

  // Обработка ответа с бонусом за волну
  const handleAnswer = useCallback(
    (isCorrect) => {
      if (!waveActive || !currentCard) return;

      // Бонусные очки за волну (волна 2 = x2, волна 3 = x3)
      const waveMultiplier = wave;
      const basePoints = isCorrect ? 10 : 0;
      const bonusPoints = isCorrect ? 5 * waveMultiplier : 0;
      const totalPoints = basePoints + bonusPoints;

      // Используем базовый обработчик с кастомными очками
      baseHandleAnswer(isCorrect, isCorrect ? 0 : 2, totalPoints);

      // Проверяем, завершена ли текущая волна
      if (currentIndex >= waveCards.length - 1) {
        handleWaveEnd(true); // Волна успешно завершена
      }
    },
    [
      waveActive,
      currentCard,
      wave,
      currentIndex,
      waveCards.length,
      baseHandleAnswer,
      handleWaveEnd,
    ]
  );

  // Быстрые кнопки
  const handleCorrect = () => handleAnswer(true);
  const handleWrong = () => handleAnswer(false);

  // Статистика волн
  const waveStats = {
    wave,
    totalWaves: WAVE_CONFIG.totalWaves,
    timeLeft,
    timerActive,
    waveActive,
    cardsInWave: waveCards.length,
    currentCardInWave: currentIndex + 1,
    score,
    waveMultiplier: wave,
    isCompleted: baseCompleted || wave > WAVE_CONFIG.totalWaves,
  };

  // Прогресс по волнам
  const waveProgress = calculateProgress(currentIndex, waveCards.length, {
    wave,
    totalWaves: WAVE_CONFIG.totalWaves,
    wavePercentage: Math.round(((wave - 1) / WAVE_CONFIG.totalWaves) * 100),
  });

  return {
    currentCard,
    waveStats,
    waveProgress,
    isCompleted: waveStats.isCompleted,
    waveActive,
    timeStats,
    handleCorrect,
    handleWrong,
    pauseWave: pauseTimer,
    resumeWave: startTimer,

    // Дополнительная статистика
    getWaveResults: () => ({
      wavesCompleted: wave - 1,
      totalWaves: WAVE_CONFIG.totalWaves,
      totalScore: score,
      averageScorePerWave: wave > 1 ? Math.round(score / (wave - 1)) : 0,
      timeBonus: Math.max(0, timeLeft), // Оставшееся время как бонус
    }),
  };
};
