import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api-client";
import { cardSetsKeys } from "./queries";
import { useDataStore } from "../../shared/stores/dataStore";

// Обновить набор
export const useUpdateSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ setId, data }) => {
      console.log("✏️ [mutation] Обновление набора:", { setId, data });

      // ВАЖНО: Формируем полный объект для отправки
      const requestData = {
        title: data.title || "",
        description: data.description || null,
        isPublic: data.isPublic !== undefined ? data.isPublic : false,
        tags: Array.isArray(data.tags) ? data.tags : [],
      };

      console.log("📤 [mutation] Отправляем данные:", requestData);

      try {
        const response = await apiClient.put(
          `/api/cardSets/${setId}`,
          requestData
        );
        console.log("✅ [mutation] Набор обновлён:", response.data);
        return response.data;
      } catch (error) {
        console.error("❌ [mutation] Ошибка обновления:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        throw error;
      }
    },
    onSuccess: (updatedSet) => {
      console.log("🔄 [mutation] Обновляем кэш для набора:", updatedSet?.id);

      // 1. Обновляем общий список наборов
      queryClient.setQueryData(cardSetsKeys.all, (old) =>
        old
          ? old.map((set) => (set.id === updatedSet.id ? updatedSet : set))
          : []
      );

      // 2. Обновляем детальный запрос
      queryClient.setQueryData(cardSetsKeys.detail(updatedSet.id), updatedSet);

      // 3. Инвалидируем кэш для перезапроса
      queryClient.invalidateQueries({
        queryKey: cardSetsKeys.detail(updatedSet.id),
        refetchType: "none", // Не делаем повторный запрос, т.к. уже обновили данные
      });

      // 4. Обновляем в Zustand store
      const dataStore = useDataStore.getState();
      const currentSelectedSet = dataStore.selectedSet;
      if (currentSelectedSet && currentSelectedSet.id === updatedSet.id) {
        dataStore.setSelectedSet(updatedSet);
      }

      console.log("✅ [mutation] Кэш обновлён");
    },
    onError: (error) => {
      console.error(
        "🔥 [mutation] Критическая ошибка обновления набора:",
        error
      );
    },
  });
};

export const useCreateSet = () => {
  return useMutation({
    mutationFn: async (data) => {
      console.log("🔄 Создание набора (полные данные):", data);
      console.log("🔄 Тип tags:", typeof data.tags, data.tags);

      // ВАЖНО: Отправляем массив строк как есть
      const formattedData = {
        title: data.title || "",
        tags: Array.isArray(data.tags)
          ? data.tags // Оставляем как массив строк
          : [], // Если не массив - пустой массив
      };

      console.log("🔄 Данные для отправки:", formattedData);

      try {
        console.log("🔄 Пробуем POST /cardSets...");
        const response = await apiClient.post("/cardSets", formattedData);
        return response.data;
      } catch (error) {
        if (error.response?.status === 404) {
          console.log("🔄 Пробуем POST /api/cardSets...");
          const response = await apiClient.post("/api/cardSets", formattedData);
          return response.data;
        }
        throw error;
      }
    },
    onError: (error) => {
      console.error("Ошибка создания набора:", error);
    },
  });
};

export const useDeleteSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (setId) => {
      console.log("🔄 Удаление набора:", setId);

      // Пробуем разные endpoint'ы
      const endpoints = [`/cardSets/${setId}`, `/api/cardSets/${setId}`];

      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Пробуем DELETE ${endpoint}...`);
          await apiClient.delete(endpoint);
          console.log(`✅ DELETE ${endpoint} успешен`);
          return setId;
        } catch (error) {
          console.log(`⚠️ DELETE ${endpoint} не сработал:`, error.message);
        }
      }

      throw new Error("Не удалось удалить набор");
    },
    onSuccess: (setId) => {
      queryClient.setQueryData(cardSetsKeys.all, (old) =>
        old ? old.filter((set) => set.id !== setId) : []
      );
    },
  });
};
