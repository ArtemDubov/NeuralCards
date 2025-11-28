// client/src/features/training/hooks/useTrainingAPI.js
import { useState, useCallback } from "react";
// Убрали: import apiClient from "../../../api-client";

export const useTrainingAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getNextCard = async (setId) => {
    try {
      setLoading(true);
      setError(null);

      // ВРЕМЕННАЯ ЗАГЛУШКА
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockCard = {
        id: 1,
        front: "Пример вопроса",
        back: "Пример ответа",
        imageUrl: null,
        audioUrl: null,
        backImageUrl: null,
        backAudioUrl: null,
      };

      const mockResponse = {
        card: mockCard,
        type: "new",
        totalDue: 5,
      };

      return mockResponse;
    } catch (err) {
      const errorMessage = "Ошибка при загрузке карточки";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (cardId, difficulty, isCorrect) => {
    try {
      setLoading(true);
      setError(null);

      // ВРЕМЕННАЯ ЗАГЛУШКА
      await new Promise((resolve) => setTimeout(resolve, 300));

      return { success: true };
    } catch (err) {
      const errorMessage = "Ошибка при сохранении ответа";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    getNextCard,
    submitAnswer,
    loading,
    error,
    clearError,
  };
};
