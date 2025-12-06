/**
 * КАРУСЕЛЬНЫЙ РЕЖИМ (ОБНОВЛЕННЫЙ)
 * Использует общие утилиты для чередования режимов
 * Сохраняет логику переключения между разными типами тренировок
 */

import { useState, useEffect, useCallback } from "react";
import {
  useTrainingBase,
  generateQuizAnswers,
  createMemoryPairs,
} from "./shared";

export const useCarouselMode = (cards, onAnswer) => {
  // === БАЗОВАЯ ЛОГИКА ===
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
  } = useTrainingBase(cards, onAnswer);

  // === УНИКАЛЬНАЯ ЛОГИКА КАРУСЕЛИ ===
  const [currentMode, setCurrentMode] = useState(null);
  const [modeCards, setModeCards] = useState([]);
  const [carouselProgress, setCarouselProgress] = useState({
    completedModes: [],
    currentModeIndex: 0,
    totalModes: 4,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scores, setScores] = useState({});

  // Режимы карусели в порядке прохождения
  const CAROUSEL_MODES = [
    { id: "practice", name: "🔄 Разминка", icon: "🔄", cardsNeeded: 3 },
    { id: "quiz", name: "🎯 Викторина", icon: "🎯", cardsNeeded: 3 },
    { id: "sprint", name: "⚡ Спринт", icon: "⚡", cardsNeeded: 3 },
    { id: "memory", name: "🧠 Память", icon: "🧠", cardsNeeded: 6 },
  ];

  // Инициализация карусели
  useEffect(() => {
    if (cards.length < 12) {
      console.error("Для карусели нужно минимум 12 карточек");
      return;
    }

    // Начинаем с первого режима
    startMode(0);
  }, [cards]);

  // Запуск конкретного режима
  const startMode = useCallback(
    (modeIndex) => {
      if (modeIndex >= CAROUSEL_MODES.length) {
        // Карусель завершена
        console.log("🎠 Карусель завершена!");
        setIsCompleted(true);
        return;
      }

      const mode = CAROUSEL_MODES[modeIndex];
      setIsTransitioning(true);

      // Подготавливаем карточки для режима
      const cardsForMode = getCardsForMode(mode.id, cards, mode.cardsNeeded);

      setTimeout(() => {
        setCurrentMode(mode);
        setModeCards(cardsForMode);
        setCurrentIndex(0);
        setIsTransitioning(false);

        setCarouselProgress((prev) => ({
          ...prev,
          currentModeIndex: modeIndex,
        }));

        console.log(
          `🎠 Запущен режим: ${mode.name}, карточек: ${cardsForMode.length}`
        );
      }, 1000);
    },
    [cards, setIsCompleted]
  );

  // Подбор карточек для конкретного режима
  const getCardsForMode = (modeId, allCards, count) => {
    switch (modeId) {
      case "memory":
        // Для памяти нужны пары
        const pairedCount = Math.min(
          count * 2,
          Math.floor(allCards.length / 2) * 2
        );
        return [...allCards]
          .sort(() => Math.random() - 0.5)
          .slice(0, pairedCount);

      case "quiz":
        // Для викторины нужны карточки с вариантами
        return [...allCards].sort(() => Math.random() - 0.5).slice(0, count);

      default:
        // Для остальных режимов просто случайные карточки
        return [...allCards].sort(() => Math.random() - 0.5).slice(0, count);
    }
  };

  // Обработка ответа с учетом текущего режима
  const handleAnswer = useCallback(
    (isCorrect, difficulty = null, modeSpecific = {}) => {
      if (!currentMode) return;

      // Отправляем статистику
      baseHandleAnswer(isCorrect, difficulty, isCorrect ? 10 : 0);

      // Обновляем счет для текущего режима
      setScores((prev) => ({
        ...prev,
        [currentMode.id]: {
          ...prev[currentMode.id],
          correct: (prev[currentMode.id]?.correct || 0) + (isCorrect ? 1 : 0),
          total: (prev[currentMode.id]?.total || 0) + 1,
          lastAnswer: {
            isCorrect,
            difficulty,
            timestamp: new Date().toISOString(),
            ...modeSpecific,
          },
        },
      }));

      // Следующая карточка или режим
      if (currentIndex >= modeCards.length - 1) {
        // Режим завершен
        finishCurrentMode();
      } else {
        nextCard();
      }
    },
    [currentMode, currentIndex, modeCards.length, baseHandleAnswer, nextCard]
  );

  // Завершение текущего режима
  const finishCurrentMode = useCallback(() => {
    if (!currentMode) return;

    console.log(`🏁 Режим ${currentMode.name} завершен`);

    // Добавляем режим в завершенные
    setCarouselProgress((prev) => ({
      ...prev,
      completedModes: [...prev.completedModes, currentMode.id],
    }));

    // Переход к следующему режиму
    const nextModeIndex = carouselProgress.currentModeIndex + 1;

    if (nextModeIndex < CAROUSEL_MODES.length) {
      setIsTransitioning(true);

      // Пауза перед следующим режимом
      setTimeout(() => {
        startMode(nextModeIndex);
      }, 2000);
    } else {
      // Все режимы пройдены
      console.log("🎉 Вся карусель пройдена!");
    }
  }, [currentMode, carouselProgress.currentModeIndex, startMode]);

  // Генерация вариантов для викторины
  const getQuizAnswers = useCallback(() => {
    if (!currentCard || currentMode?.id !== "quiz") return [];
    return generateQuizAnswers(currentCard, modeCards, 4);
  }, [currentCard, currentMode, modeCards]);

  // Создание пар для памяти
  const getMemoryPairs = useCallback(() => {
    if (currentMode?.id !== "memory") return [];
    return createMemoryPairs(modeCards, 3); // 3 пары для памяти в карусели
  }, [currentMode, modeCards]);

  // Подсказки для текущего режима
  const getModeInstructions = useCallback(() => {
    if (!currentMode) return "";

    const instructions = {
      practice: "🔄 Классическое повторение. Открой ответ и оцени сложность.",
      quiz: "🎯 Выбери правильный ответ из вариантов.",
      sprint: '⚡ Быстрые ответы! Жми "Знаю" или "Не знаю".',
      memory: "🧠 Найди пары вопрос-ответ. Тренируй память!",
    };

    return instructions[currentMode.id] || "";
  }, [currentMode]);

  // Быстрые кнопки для разных режимов
  const getModeButtons = useCallback(() => {
    if (!currentMode) return {};

    if (currentMode.id === "sprint") {
      return {
        primary: { label: "✅ Знаю", action: () => handleAnswer(true, 0) },
        secondary: {
          label: "❌ Не знаю",
          action: () => handleAnswer(false, 2),
        },
      };
    }

    if (currentMode.id === "quiz") {
      return {
        isQuiz: true,
        answers: getQuizAnswers(),
      };
    }

    // Для practice и memory - стандартные кнопки
    return {
      primary: { label: "Показать ответ", action: () => {} },
      secondary: null,
    };
  }, [currentMode, handleAnswer, getQuizAnswers]);

  // Статистика карусели
  const carouselStats = {
    currentMode,
    modeProgress:
      modeCards.length > 0
        ? Math.round(((currentIndex + 1) / modeCards.length) * 100)
        : 0,
    completedModes: carouselProgress.completedModes.length,
    totalModes: CAROUSEL_MODES.length,
    nextMode: CAROUSEL_MODES[carouselProgress.currentModeIndex + 1],
    scores,
    isTransitioning,
    isCompleted:
      carouselProgress.completedModes.length >= CAROUSEL_MODES.length ||
      baseCompleted,
  };

  return {
    currentCard,
    carouselStats,
    isCompleted: carouselStats.isCompleted,
    isTransitioning,
    modeInstructions: getModeInstructions(),
    modeButtons: getModeButtons(),
    handleAnswer,

    // Режим-специфичные данные
    quizAnswers: currentMode?.id === "quiz" ? getQuizAnswers() : [],
    memoryPairs: currentMode?.id === "memory" ? getMemoryPairs() : [],

    // Управление
    skipCurrentMode: finishCurrentMode,

    // Результаты
    getFinalResults: () => ({
      totalModes: carouselStats.totalModes,
      completedModes: carouselStats.completedModes,
      scores,
      totalCorrect: Object.values(scores).reduce(
        (sum, score) => sum + (score.correct || 0),
        0
      ),
      totalQuestions: Object.values(scores).reduce(
        (sum, score) => sum + (score.total || 0),
        0
      ),
      overallScore: calculateOverallScore(scores),
      modeDetails: CAROUSEL_MODES.map((mode) => ({
        mode: mode.name,
        score: scores[mode.id]?.correct || 0,
        total: scores[mode.id]?.total || 0,
        accuracy:
          scores[mode.id]?.total > 0
            ? Math.round(
                (scores[mode.id].correct / scores[mode.id].total) * 100
              )
            : 0,
      })),
    }),
  };
};

// Расчет общего счета
function calculateOverallScore(scores) {
  const totalCorrect = Object.values(scores).reduce(
    (sum, score) => sum + (score.correct || 0),
    0
  );
  const totalQuestions = Object.values(scores).reduce(
    (sum, score) => sum + (score.total || 0),
    0
  );

  return totalQuestions > 0
    ? Math.round((totalCorrect / totalQuestions) * 100)
    : 0;
}
