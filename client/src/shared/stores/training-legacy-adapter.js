// /shared/stores/training-legacy-adapter.js
/**
 * Адаптер для постепенного перехода на новую архитектуру
 * Позволяет использовать старый и новый API одновременно
 */

import { useTraining } from "../hooks/useTraining";

// Для компонентов, которые используют деструктуризацию
export const useTrainingStore = () => {
  const training = useTraining();

  // Маппинг старого API на новый
  return {
    // Состояние
    session: training.session,
    modes: training.modes,

    // Действия
    startSession: training.startSession,
    endSession: training.endSession,
    submitAnswer: training.submitAnswer,
    addMode: training.addCustomMode,

    // Селекторы
    getCurrentMode: training.getCurrentMode,
    getProgress: training.getProgress,
    getSessionStats: training.getSessionStats,

    // Новые методы (добавлены для совместимости)
    setSession: training.updateSession, // псевдоним
    updateSession: training.updateSession,
    clearSession: training.endSession, // псевдоним
  };
};

// Реэкспорт всего остального для обратной совместимости
export {
  getModeById,
  getAllModes,
  getAvailableModesForCardsCount,
} from "../configs/training-modes-config";

export {
  createSession,
  updateSessionAfterAnswer,
  calculateSessionStats,
  validateSessionStart,
} from "../services/training-session-service";
