/**
 * ОБЩИЕ ПОМОЩНИКИ ДЛЯ РЕЖИМОВ ТРЕНИРОВОК
 * Чистые функции без состояния
 */

/**
 * Генерация вариантов ответов для викторин
 * Используется в: quiz, carousel, exam (если есть варианты)
 */
export const generateQuizAnswers = (correctCard, allCards, count = 4) => {
  if (!correctCard || !allCards || allCards.length < count) {
    return [];
  }

  // Выбираем неправильные карточки (исключая правильную)
  const wrongCards = allCards
    .filter((card) => card.id !== correctCard.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, count - 1);

  // Собираем все варианты и перемешиваем
  const allAnswers = [correctCard.back, ...wrongCards.map((card) => card.back)];

  return [...allAnswers].sort(() => Math.random() - 0.5);
};

/**
 * Создание пар для режима памяти
 * Используется в: memory, carousel (в режиме памяти)
 */
export const createMemoryPairs = (cards, maxPairs = 6) => {
  if (!cards || cards.length < 2) return [];

  // Берем только первые N карточек для пар
  const gameCards = cards.slice(0, maxPairs * 2);

  // Создаем пары [вопрос, ответ]
  const pairs = gameCards.flatMap((card, index) => [
    {
      id: `${card.id}-q`,
      type: "question",
      content: card.front,
      pairId: index,
      cardId: card.id,
      flipped: false,
    },
    {
      id: `${card.id}-a`,
      type: "answer",
      content: card.back,
      pairId: index,
      cardId: card.id,
      flipped: false,
    },
  ]);

  // Перемешиваем
  return [...pairs].sort(() => Math.random() - 0.5);
};

/**
 * Расчет прогресса с дополнительными метриками
 * Используется в: всех режимах
 */
export const calculateProgress = (current, total, additional = {}) => {
  const base = {
    current: current + 1,
    total,
    percentage: total > 0 ? Math.round(((current + 1) / total) * 100) : 0,
    isCompleted: current >= total,
  };

  return { ...base, ...additional };
};

/**
 * Фильтрация карточек с аудио
 * Используется в: audio, carousel (если есть аудио-режим)
 */
export const filterAudioCards = (cards) => {
  return cards.filter((card) => card.audioUrl || card.backAudioUrl);
};

/**
 * Смешивание карточек из нескольких наборов
 * Используется в: mixer, tournament (если наборы из разных тем)
 */
export const mixCardsFromSets = (cardSets, maxCardsPerSet = null) => {
  const allCards = [];

  cardSets.forEach((set) => {
    if (set.cards && Array.isArray(set.cards)) {
      const cardsToAdd = maxCardsPerSet
        ? set.cards.slice(0, maxCardsPerSet)
        : set.cards;

      const cardsWithSetInfo = cardsToAdd.map((card) => ({
        ...card,
        sourceSet: {
          id: set.id,
          title: set.title,
          color: getSetColor(set.id),
        },
      }));

      allCards.push(...cardsWithSetInfo);
    }
  });

  // Перемешиваем все карточки
  return [...allCards].sort(() => Math.random() - 0.5);
};

/**
 * Генерация цвета для набора (визуальное различение)
 * Используется в: mixer
 */
export const getSetColor = (setId) => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#FFD166",
    "#06D6A0",
    "#118AB2",
    "#EF476F",
    "#073B4C",
    "#7209B7",
    "#F72585",
    "#3A0CA3",
    "#4361EE",
    "#4CC9F0",
  ];

  if (!setId) return colors[0];

  // Преобразуем ID в число для детерминированного выбора
  const idStr = String(setId);
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Расчет сложности на основе ответов (для AI режима)
 * Используется в: ai, practice (адаптивная сложность)
 */
export const calculateDifficulty = (cardHistory, cardId) => {
  const cardAnswers = cardHistory.filter((item) => item.cardId === cardId);

  if (cardAnswers.length === 0) return "medium";

  const correctCount = cardAnswers.filter((item) => item.isCorrect).length;
  const total = cardAnswers.length;
  const accuracy = (correctCount / total) * 100;

  if (accuracy >= 80) return "easy";
  if (accuracy >= 50) return "medium";
  return "hard";
};

/**
 * Форматирование статистики для CompletionScreen
 * Используется в: всех режимах при завершении
 */
export const formatSessionStats = (
  answers,
  startTime,
  endTime = new Date()
) => {
  const correct = answers.filter((a) => a.isCorrect).length;
  const total = answers.length;
  const duration = (new Date(endTime) - new Date(startTime)) / 1000;

  return {
    correct,
    total,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    duration: Math.round(duration),
    averageTime: total > 0 ? Math.round(duration / total) : 0,
    score: answers.reduce((sum, a) => sum + (a.points || 0), 0),
  };
};
