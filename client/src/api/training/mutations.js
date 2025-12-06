import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api-client";
import { trainingKeys } from "./queries";

// Отправить результат ответа на карточку
export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cardId, difficulty, isCorrect }) => {
      const response = await apiClient.post("/api/training/submit-answer", {
        cardId,
        difficulty,
        isCorrect,
      });
      return response.data;
    },
    onSuccess: (data, { setId }) => {
      if (setId) {
        queryClient.invalidateQueries({
          queryKey: trainingKeys.cards(setId),
        });
      }
    },
  });
};

// Завершить тренировку (сохранить статистику)
export const useCompleteTraining = () => {
  return useMutation({
    mutationFn: async ({ sessionId, stats }) => {
      const response = await apiClient.post("/api/training/complete", {
        sessionId,
        ...stats,
      });
      return response.data;
    },
  });
};
