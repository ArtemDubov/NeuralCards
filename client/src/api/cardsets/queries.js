import { useQuery } from "@tanstack/react-query";
import apiClient from "../../api-client";

// Ключи для кэширования (БЕЗ as const)
export const cardsetsKeys = {
  all: ["cardsets"],
  lists: () => [...cardsetsKeys.all, "list"],
  list: (filters) => [...cardsetsKeys.lists(), { filters }],
  details: () => [...cardsetsKeys.all, "detail"],
  detail: (id) => [...cardsetsKeys.details(), id],
};

// Получить все наборы
export const useCardsets = () => {
  return useQuery({
    queryKey: cardsetsKeys.all,
    queryFn: async () => {
      const response = await apiClient.get("/api/cardsets");
      return response.data;
    },
  });
};

// Получить конкретный набор
export const useCardset = (id) => {
  return useQuery({
    queryKey: cardsetsKeys.detail(id),
    queryFn: async () => {
      if (!id || isNaN(id)) return null;

      try {
        const response = await apiClient.get(`/api/cardsets/${id}`);
        return response.data;
      } catch (error) {
        if (error.response?.status === 404) return null; // Набор удален
        throw error; // Другие ошибки
      }
    },
    enabled: !!id && !isNaN(id),
    retry: false, // Не повторять запрос
  });
};
