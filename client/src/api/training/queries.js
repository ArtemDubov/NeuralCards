import { useQuery } from "@tanstack/react-query";
import apiClient from "../../api-client";

export const trainingKeys = {
  all: ["training"],
  cards: (setId) => [...trainingKeys.all, "cards", setId],
  session: (sessionId) => [...trainingKeys.all, "session", sessionId],
};

// Получить карточки для тренировки
export const useTrainingCards = (setId) => {
  return useQuery({
    queryKey: trainingKeys.cards(setId),
    queryFn: async () => {
      if (!setId) return [];
      const response = await apiClient.get(`/api/cardsets/${setId}`);
      return response.data.cards || [];
    },
    enabled: !!setId,
  });
};

// Получить статистику тренировок
export const useTrainingStats = (setId) => {
  return useQuery({
    queryKey: [...trainingKeys.cards(setId), "stats"],
    queryFn: async () => {
      const response = await apiClient.get(`/api/training/progress/${setId}`);
      return response.data;
    },
  });
};
