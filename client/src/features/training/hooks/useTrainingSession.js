import { useTrainingStore } from "../../../shared/stores/training-legacy-adapter";

export const useTrainingSession = () => {
  const store = useTrainingStore();
  const { session, startSession, endSession, submitAnswer, getCurrentMode } =
    store;

  // Карточки из выбранного набора
  const cards = session?.cardset?.cards || [];

  // Флаги состояния
  const isCompleted = session?.stats?.isCompleted || false;
  const currentCard = cards[session?.currentCardIndex];

  // Прогресс
  const progress = {
    current: session?.currentCardIndex || 0,
    total: cards.length,
    isCompleted,
    percentage: cards.length
      ? Math.round(((session?.currentCardIndex || 0) / cards.length) * 100)
      : 0,
  };

  // Обработчик ответа
  const handleAnswer = (isCorrect, difficulty = null) => {
    if (!currentCard || isCompleted) return;
    submitAnswer(currentCard.id, isCorrect, difficulty);
  };

  return {
    // Состояние
    session,
    currentCard,
    cards,
    progress,

    // Флаги
    isActive: !!session && !isCompleted,
    isCompleted,
    isLoading: false,
    error: null,

    // Действия
    handleAnswer,
    startSession,
    endSession,

    // Селекторы
    currentMode: getCurrentMode(),
  };
};
