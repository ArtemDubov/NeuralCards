// Сервис для работы с сессиями тренировок
// Чистая бизнес-логика без состояния

/**
 * Создает новую сессию тренировки
 * @param {string} modeId - ID режима тренировки
 * @param {object} cardset - Набор карточек
 * @returns {object} Новая сессия
 */
export const createSession = (modeId, cardset) => {
  return {
    id: Date.now(),
    mode: modeId,
    cardset,
    currentCardIndex: 0,
    score: 0,
    stats: {
      correct: 0,
      total: 0,
      startTime: new Date().toISOString(),
      lastAnswer: null,
    },
  };
};

/**
 * Обновляет сессию после ответа
 * @param {object} session - Текущая сессия
 * @param {string} cardId - ID карточки
 * @param {boolean} isCorrect - Правильный ли ответ
 * @param {string|null} difficulty - Сложность (опционально)
 * @returns {object} Обновленная сессия
 */
export const updateSessionAfterAnswer = (
  session,
  cardId,
  isCorrect,
  difficulty = null
) => {
  if (!session) return null;

  const newIndex = session.currentCardIndex + 1;
  const newScore = session.score + (isCorrect ? 1 : 0);

  return {
    ...session,
    currentCardIndex: newIndex,
    score: newScore,
    stats: {
      ...session.stats,
      correct: session.stats.correct + (isCorrect ? 1 : 0),
      total: session.stats.total + 1,
      lastAnswer: { cardId, isCorrect, difficulty },
    },
  };
};

/**
 * Проверяет, завершена ли сессия
 * @param {object} session - Сессия для проверки
 * @returns {boolean}
 */
export const isSessionCompleted = (session) => {
  if (!session || !session.cardset?.cards) return false;
  return session.currentCardIndex >= session.cardset.cards.length;
};

/**
 * Рассчитывает прогресс по сессии
 * @param {object} session - Сессия
 * @returns {object|null} Прогресс или null
 */
export const calculateProgress = (session) => {
  if (!session || !session.cardset?.cards) return null;

  const totalCards = session.cardset.cards.length;
  const current = session.currentCardIndex;
  const percentage = Math.round((current / totalCards) * 100);

  return {
    current,
    total: totalCards,
    percentage,
    isCompleted: current >= totalCards,
  };
};

/**
 * Рассчитывает статистику по завершенной сессии
 * @param {object} session - Завершенная сессия
 * @returns {object} Статистика
 */
export const calculateSessionStats = (session) => {
  if (!session) return null;

  const startTime = new Date(session.stats.startTime);
  const endTime = new Date();
  const durationMs = endTime - startTime;
  const durationSec = Math.floor(durationMs / 1000);

  const accuracy =
    session.stats.total > 0
      ? Math.round((session.stats.correct / session.stats.total) * 100)
      : 0;

  return {
    accuracy,
    duration: durationSec,
    totalCards: session.stats.total,
    correctAnswers: session.stats.correct,
    score: session.score,
    avgTimePerCard: durationSec / Math.max(session.stats.total, 1),
  };
};

/**
 * Валидация сессии перед стартом
 * @param {string} modeId - ID режима
 * @param {object} cardset - Набор карточек
 * @param {object} modesConfig - Конфигурация режимов
 * @returns {object} Результат валидации
 */
export const validateSessionStart = (modeId, cardset, modesConfig) => {
  const mode = modesConfig[modeId];

  if (!mode) {
    return { isValid: false, error: `Режим ${modeId} не существует` };
  }

  if (!cardset?.cards) {
    return { isValid: false, error: "Набор карточек невалиден" };
  }

  const cardsCount = cardset.cards.length;
  if (cardsCount < mode.minCards) {
    return {
      isValid: false,
      error: `Для режима "${modeId}" нужно минимум ${mode.minCards} карточек (у вас ${cardsCount})`,
    };
  }

  // Специфичные проверки для режимов
  if (modeId === "audio" && mode.requireAudio) {
    const hasAudioCards = cardset.cards.some((card) => card.audio);
    if (!hasAudioCards) {
      return { isValid: false, error: "В этом режиме нужны карточки с аудио" };
    }
  }

  if (modeId === "memory" && cardsCount % 2 !== 0) {
    return {
      isValid: false,
      error: "Для режима памяти нужно четное количество карточек",
    };
  }

  return { isValid: true };
};
