/**
 * РЕЖИМ МИКСЕРА (ИСПРАВЛЕННЫЙ)
 */

import { useState, useEffect, useCallback } from "react";
import {
  useTrainingBase,
  mixCardsFromSets,
  getSetColor,
  calculateProgress,
} from "./shared";

export const useMixerMode = (cardsets = [], onAnswer) => {
  // Добавляем значение по умолчанию
  // === БАЗОВАЯ ЛОГИКА ===
  const [mixedCards, setMixedCards] = useState([]);

  const {
    currentCard,
    currentIndex,
    isCompleted: baseCompleted,
    score,
    answers,
    handleAnswer: baseHandleAnswer,
    nextCard,
    setCurrentIndex,
    setIsCompleted,
    setScore,
  } = useTrainingBase(mixedCards, onAnswer);

  // === УНИКАЛЬНАЯ ЛОГИКА МИКСЕРА ===
  const [selectedSets, setSelectedSets] = useState([]);
  const [setStats, setSetStats] = useState({});
  const [mixerActive, setMixerActive] = useState(true);
  const [maxSets] = useState(3);

  // Инициализация при выборе наборов
  useEffect(() => {
    if (!Array.isArray(selectedSets) || selectedSets.length === 0) {
      // Проверяем массив
      setMixedCards([]);
      return;
    }

    // Смешиваем карточки из выбранных наборов
    const mixed = mixCardsFromSets(selectedSets);
    setMixedCards(mixed);

    // Инициализируем статистику по наборам
    const newSetStats = {};
    selectedSets.forEach((set) => {
      if (set && set.cards && Array.isArray(set.cards)) {
        // Проверяем set
        newSetStats[set.id] = {
          title: set.title || `Набор ${set.id}`,
          totalCards: set.cards.length,
          answered: 0,
          correct: 0,
          color: getSetColor(set.id),
        };
      }
    });

    setSetStats(newSetStats);
    setCurrentIndex(0);
    setMixerActive(true);
  }, [selectedSets, setCurrentIndex]);

  // Обработка ответа
  const handleAnswer = useCallback(
    (isCorrect, difficulty = null) => {
      if (!currentCard || !mixerActive) return;

      // Обновляем общий счет
      const points = isCorrect ? 10 : 0;
      setScore((prev) => prev + points);

      // Обновляем статистику по набору
      if (currentCard.sourceSet && currentCard.sourceSet.id) {
        setSetStats((prev) => ({
          ...prev,
          [currentCard.sourceSet.id]: {
            ...prev[currentCard.sourceSet.id],
            answered: (prev[currentCard.sourceSet.id]?.answered || 0) + 1,
            correct:
              (prev[currentCard.sourceSet.id]?.correct || 0) +
              (isCorrect ? 1 : 0),
          },
        }));
      }

      // Используем базовый обработчик
      baseHandleAnswer(isCorrect, difficulty, points);

      // Следующая карточка
      if (currentIndex >= mixedCards.length - 1) {
        finishMixer();
      } else {
        nextCard();
      }
    },
    [
      currentCard,
      currentIndex,
      mixedCards.length,
      mixerActive,
      baseHandleAnswer,
      nextCard,
      setScore,
    ]
  );

  // Завершение миксера
  const finishMixer = useCallback(() => {
    setMixerActive(false);
    setIsCompleted(true);
  }, [setIsCompleted]);

  // Выбор наборов для микса
  const selectSets = useCallback(
    (sets) => {
      if (!Array.isArray(sets)) {
        console.error("Наборы должны быть массивом");
        return;
      }

      if (sets.length === 0 || sets.length > maxSets) {
        console.error(`Можно выбрать от 1 до ${maxSets} наборов`);
        return;
      }

      // Фильтруем некорректные наборы
      const validSets = sets.filter(
        (set) => set && set.id && set.cards && Array.isArray(set.cards)
      );

      if (validSets.length === 0) {
        console.error("Нет корректных наборов для микса");
        return;
      }

      setSelectedSets(validSets);
    },
    [maxSets]
  );

  // Быстрые кнопки
  const handleCorrect = () => handleAnswer(true, 0);
  const handleWrong = () => handleAnswer(false, 2);

  // Расчет эффективности по наборам
  const getSetEfficiency = useCallback(
    (setId) => {
      const stats = setStats[setId];
      if (!stats || stats.answered === 0) return 0;
      return Math.round((stats.correct / stats.answered) * 100);
    },
    [setStats]
  );

  // Статистика миксера
  const mixerStats = {
    selectedSetsCount: selectedSets.length,
    totalCards: mixedCards.length,
    currentCard: currentIndex + 1,
    score,
    setStats,
    progress:
      mixedCards.length > 0
        ? Math.round(((currentIndex + 1) / mixedCards.length) * 100)
        : 0,
    isCompleted: !mixerActive || baseCompleted,
    mixerActive,
  };

  const mixerProgress = calculateProgress(currentIndex, mixedCards.length, {
    selectedSets: selectedSets.map((s) => s?.title || "Без названия"),
    efficiencyBySet: selectedSets.reduce((acc, set) => {
      if (set && set.id) {
        acc[set.title || set.id] = getSetEfficiency(set.id);
      }
      return acc;
    }, {}),
  });

  return {
    currentCard,
    mixerStats,
    mixerProgress,
    isCompleted: mixerStats.isCompleted,
    mixerActive,
    selectSets,
    handleCorrect,
    handleWrong,

    // Дополнительные методы
    resetMixer: () => {
      setSelectedSets([]);
      setMixedCards([]);
      setSetStats({});
      setMixerActive(true);
      setIsCompleted(false);
      setCurrentIndex(0);
    },

    // Геттеры для компонентов
    getAvailableSets: () => (Array.isArray(cardsets) ? cardsets : []),
    getSelectedSets: () => selectedSets,

    // Результаты
    getFinalResults: () => {
      const results = {
        totalCards: mixedCards.length,
        selectedSets: selectedSets.map((s) => ({
          title: s?.title || `Набор ${s?.id}`,
          efficiency: getSetEfficiency(s?.id),
          correct: setStats[s?.id]?.correct || 0,
          total: setStats[s?.id]?.totalCards || 0,
          color: getSetColor(s?.id),
        })),
        finalScore: score,
        overallEfficiency:
          mixedCards.length > 0
            ? Math.round((score / 10 / mixedCards.length) * 100)
            : 0,
      };

      // Находим самый эффективный набор
      if (results.selectedSets.length > 0) {
        results.mostEffectiveSet = results.selectedSets.reduce(
          (best, current) => {
            return !best || current.efficiency > best.efficiency
              ? current
              : best;
          },
          null
        );
      }

      return results;
    },
  };
};
