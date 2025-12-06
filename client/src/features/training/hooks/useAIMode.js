/**
 * AI РЕЖИМ (ОБНОВЛЕННЫЙ)
 * Использует общие утилиты для расчета сложности и рекомендаций
 * Сохраняет адаптивную логику AI тренера
 */

import { useState, useEffect, useCallback } from "react";
import {
  useTrainingBase,
  calculateDifficulty,
  calculateProgress,
} from "./shared";

export const useAIMode = (cards, onAnswer) => {
  // === БАЗОВАЯ ЛОГИКА ===
  const {
    currentCard: baseCurrentCard,
    currentIndex: baseCurrentIndex,
    isCompleted: baseCompleted,
    score,
    answers,
    handleAnswer: baseHandleAnswer,
    nextCard,
    setCurrentIndex,
    setIsCompleted,
  } = useTrainingBase(cards, onAnswer);

  // === УНИКАЛЬНАЯ ЛОГИКА AI РЕЖИМА ===
  const [cardHistory, setCardHistory] = useState([]);
  const [difficulty, setDifficulty] = useState("medium");
  const [focusArea, setFocusArea] = useState("weakest");
  const [aiStats, setAiStats] = useState({
    weakCards: [],
    strongCards: [],
    newCards: [],
    masteredCards: [],
  });

  // Анализ карточек при запуске
  useEffect(() => {
    if (cards.length === 0) return;

    // Имитация AI анализа карточек
    const analyzed = analyzeCards(cards);
    setAiStats(analyzed);

    // Выбираем первую карточку на основе фокуса
    selectNextCard(analyzed, focusArea);
  }, [cards, focusArea]);

  // Анализ карточек (имитация AI)
  const analyzeCards = (allCards) => {
    const total = allCards.length;

    // В реальном приложении здесь был бы ML алгоритм
    // Пока используем простую эвристику

    return {
      weakCards: allCards.slice(0, Math.ceil(total * 0.3)), // 30% слабых
      strongCards: allCards.slice(
        Math.ceil(total * 0.3),
        Math.ceil(total * 0.6)
      ),
      newCards: allCards.slice(Math.ceil(total * 0.6), Math.ceil(total * 0.8)),
      masteredCards: allCards.slice(Math.ceil(total * 0.8)),
    };
  };

  // Выбор следующей карточки на основе AI логики
  const selectNextCard = useCallback(
    (analysis, focus = focusArea) => {
      let pool = [];

      // Выбираем пул карточек в зависимости от фокуса
      switch (focus) {
        case "weakest":
          pool = analysis.weakCards;
          break;
        case "new":
          pool =
            analysis.newCards.length > 0
              ? analysis.newCards
              : analysis.weakCards;
          break;
        case "review":
          pool = [...analysis.weakCards, ...analysis.strongCards];
          break;
        case "mixed":
        default:
          pool = cards;
          break;
      }

      // Если пул пустой, берем из всех карточек
      if (pool.length === 0) {
        pool = cards;
      }

      // Выбираем случайную карточку из пула
      const randomIndex = Math.floor(Math.random() * pool.length);
      const selected = pool[randomIndex];

      // Обновляем текущую карточку через индексацию
      const cardIndex = cards.findIndex((card) => card.id === selected.id);
      if (cardIndex !== -1) {
        setCurrentIndex(cardIndex);
      }

      // Обновляем историю карточек
      setCardHistory((prev) => [
        ...prev,
        {
          cardId: selected.id,
          timestamp: new Date().toISOString(),
          focusArea: focus,
          difficulty,
        },
      ]);
    },
    [cards, focusArea, difficulty, setCurrentIndex]
  );

  // Обработка ответа с адаптивной логикой AI
  const handleAnswer = useCallback(
    (isCorrect, userDifficulty = null) => {
      if (!baseCurrentCard) return;

      // Отправляем статистику
      baseHandleAnswer(
        isCorrect,
        userDifficulty || (isCorrect ? 0 : 2),
        isCorrect ? 10 : 0
      );

      // AI логика: адаптируем сложность и фокус
      const currentCardId = baseCurrentCard.id;

      if (!isCorrect) {
        // Если ошибся - добавляем в слабые, уменьшаем сложность
        setAiStats((prev) => ({
          ...prev,
          weakCards: [...prev.weakCards, baseCurrentCard].filter(
            (card, index, self) =>
              index === self.findIndex((c) => c.id === card.id)
          ),
        }));

        if (difficulty === "hard") {
          setDifficulty("medium");
        } else if (difficulty === "medium") {
          setDifficulty("easy");
        }

        // Фокусируемся на слабых местах
        setFocusArea("weakest");
      } else {
        // Если ответил правильно - возможно повышаем сложность
        if (userDifficulty === 0) {
          // easy ответ - может повысить сложность
          if (difficulty === "easy" && Math.random() > 0.7) {
            setDifficulty("medium");
          }
        }

        // Чередуем фокусы для разнообразия
        const focuses = ["weakest", "new", "review", "mixed"];
        const nextFocus = focuses[Math.floor(Math.random() * focuses.length)];
        setFocusArea(nextFocus);
      }

      // Обновляем историю
      setCardHistory((prev) => [
        ...prev,
        {
          cardId: currentCardId,
          isCorrect,
          difficulty: userDifficulty || difficulty,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Выбираем следующую карточку на основе обновленной статистики
      selectNextCard(aiStats, focusArea);
    },
    [
      baseCurrentCard,
      difficulty,
      focusArea,
      aiStats,
      baseHandleAnswer,
      selectNextCard,
    ]
  );

  // Смена фокуса тренировки
  const changeFocus = useCallback(
    (newFocus) => {
      setFocusArea(newFocus);
      selectNextCard(aiStats, newFocus);
    },
    [aiStats, selectNextCard]
  );

  // Смена сложности
  const changeDifficulty = useCallback((newDifficulty) => {
    setDifficulty(newDifficulty);
  }, []);

  // Расчет серии правильных ответов
  const calculateStreak = useCallback(() => {
    if (cardHistory.length === 0) return 0;

    let streak = 0;
    for (let i = cardHistory.length - 1; i >= 0; i--) {
      if (cardHistory[i].isCorrect) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [cardHistory]);

  // Рекомендации AI
  const recommendations = {
    focus: `Сосредоточьтесь на ${getFocusDescription(focusArea)}`,
    difficulty: `Текущая сложность: ${getDifficultyDescription(difficulty)}`,
    tip: getAITip(aiStats, focusArea, difficulty),
    streak: calculateStreak(),
  };

  // Статистика AI тренера
  const aiModeStats = {
    totalCards: cards.length,
    weakCount: aiStats.weakCards.length,
    strongCount: aiStats.strongCards.length,
    newCount: aiStats.newCards.length,
    masteredCount: aiStats.masteredCards.length,
    focusArea,
    difficulty,
    historyLength: cardHistory.length,
    currentStreak: calculateStreak(),
    isCompleted: baseCompleted,
    adaptiveMode: true,
  };

  const aiProgress = calculateProgress(baseCurrentIndex, cards.length, {
    focusArea,
    difficulty,
    streak: calculateStreak(),
    weakCardsCount: aiStats.weakCards.length,
  });

  return {
    currentCard: baseCurrentCard,
    aiStats: aiModeStats,
    aiProgress,
    isCompleted: baseCompleted,
    recommendations,
    focusArea,
    difficulty,
    handleAnswer,
    changeFocus,
    changeDifficulty,

    // Дополнительные методы
    getCardHistory: () => cardHistory,
    getCardStats: (cardId) => {
      const cardAnswers = cardHistory.filter((item) => item.cardId === cardId);
      return {
        totalAttempts: cardAnswers.length,
        correctAttempts: cardAnswers.filter((item) => item.isCorrect).length,
        difficulty: calculateDifficulty(cardAnswers, cardId),
      };
    },

    // Результаты
    getAIResults: () => ({
      totalCards: cards.length,
      cardsAnalyzed: cardHistory.length,
      weakAreas: aiStats.weakCards.map((card) => card.front),
      strongAreas: aiStats.strongCards.map((card) => card.front),
      recommendation: recommendations.tip,
      overallProgress: Math.round(
        (aiStats.masteredCards.length / cards.length) * 100
      ),
      adaptationLevel: getAdaptationLevel(cardHistory),
    }),
  };
};

// Вспомогательные функции
function getFocusDescription(focus) {
  const map = {
    weakest: "слабых местах",
    new: "новых карточках",
    review: "повторении",
    mixed: "всем материале",
  };
  return map[focus] || "материале";
}

function getDifficultyDescription(diff) {
  const map = {
    easy: "🟢 Легкая",
    medium: "🟡 Средняя",
    hard: "🔴 Сложная",
  };
  return map[diff] || "Средняя";
}

function getAITip(stats, focus, difficulty) {
  const tips = [
    "Попробуйте ассоциации для лучшего запоминания",
    "Делайте перерывы каждые 25 минут",
    "Повторяйте сложные карточки перед сном",
    "Используйте метод интервальных повторений",
    "Создавайте ментальные карты для сложных тем",
  ];

  if (stats.weakCards.length > stats.strongCards.length) {
    return "У вас много слабых мест. Рекомендую больше практиковаться!";
  }

  if (difficulty === "easy" && stats.weakCards.length === 0) {
    return "Вы освоили легкий уровень! Попробуйте среднюю сложность.";
  }

  return tips[Math.floor(Math.random() * tips.length)];
}

function getAdaptationLevel(history) {
  if (history.length < 10) return "начальный";
  if (history.length < 30) return "средний";
  return "продвинутый";
}
