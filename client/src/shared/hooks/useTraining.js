// /shared/hooks/useTraining.js
import { useTrainingStore } from "../stores/training-store";
import {
  createSession,
  updateSessionAfterAnswer,
  validateSessionStart,
  calculateSessionStats,
  isSessionCompleted,
} from "../services/training-session-service";
import {
  getModeById,
  getAllModes,
  getAvailableModesForCardsCount,
} from "../configs/training-modes-config";

/**
 * Фасад-хук для обратной совместимости со старым API
 * Объединяет store, сервисы и конфиги в один удобный интерфейс
 */
export const useTraining = () => {
  const {
    session,
    modes,
    sessionHistory,
    setSession,
    clearSession,
    updateSession,
    addToHistory,
    addCustomMode,
    getCurrentMode: storeGetCurrentMode,
    getProgress: storeGetProgress,
  } = useTrainingStore();

  // === СОВМЕСТИМОСТЬ СО СТАРЫМ API ===

  const startSession = (modeId, cardSet) => {
    // Валидация
    const validation = validateSessionStart(modeId, cardSet, modes);
    if (!validation.isValid) {
      console.error(validation.error);
      return false;
    }

    // Создание сессии
    const newSession = createSession(modeId, cardSet);
    setSession(newSession);
    return true;
  };

  const endSession = () => {
    if (session) {
      addToHistory(session);
    }
    clearSession();
  };

  const submitAnswer = (cardId, isCorrect, difficulty = null) => {
    if (!session) return;

    updateSession((currentSession) =>
      updateSessionAfterAnswer(currentSession, cardId, isCorrect, difficulty)
    );
  };

  // === УЛУЧШЕННОЕ API ===

  const completeSession = () => {
    if (!session) return;

    const stats = calculateSessionStats(session);
    addToHistory({ ...session, stats });
    clearSession();
    return stats;
  };

  // === СЕЛЕКТОРЫ ===

  const getProgress = () => storeGetProgress();

  const getCurrentMode = () => storeGetCurrentMode();

  const getSessionStats = () => {
    if (!session) return null;
    return {
      score: session.score,
      ...session.stats,
    };
  };

  const isValidModeForCardSet = (modeId, cardSet) => {
    const validation = validateSessionStart(modeId, cardSet, modes);
    return validation.isValid;
  };

  // === ЭКСПОРТ ВСЕГО НУЖНОГО ===

  return {
    // Состояние
    session,
    modes,
    sessionHistory,

    // Основные действия (старое API)
    startSession,
    endSession,
    submitAnswer,

    // Новые действия
    completeSession,
    updateSession,
    addCustomMode,

    // Селекторы
    getProgress,
    getCurrentMode,
    getSessionStats,
    isValidModeForCardSet,
    isSessionCompleted: () => isSessionCompleted(session),

    // Конфиги и сервисы (для прямого доступа)
    config: {
      getModeById: (id) => getModeById(id),
      getAllModes: () => getAllModes(),
      getAvailableModesForCardsCount: (count) =>
        getAvailableModesForCardsCount(count),
    },
  };
};
