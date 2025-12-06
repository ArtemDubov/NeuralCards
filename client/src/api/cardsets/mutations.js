import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api-client";
import { cardsetsKeys } from "./queries";
import { useDataStore } from "../../shared/stores/dataStore";

// Обновить набор - ПОЛНОСТЬЮ ПЕРЕПИСАННАЯ ВЕРСИЯ
export const useUpdateSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ setId, data }) => {
      console.log("✏️ Обновление набора:", { setId, data });

      // Подготавливаем данные для отправки
      const requestData = {
        title: data.title,
        tags: data.tags || [],
      };

      // Пробуем разные endpoint'ы по очереди
      const endpoints = [
        `/api/cardsets/${setId}`, // Основной endpoint
        `/cardsets/${setId}`, // Альтернативный endpoint
      ];

      const methods = ["put", "patch", "post"]; // Пробуем все методы

      for (const endpoint of endpoints) {
        for (const method of methods) {
          try {
            console.log(`🔄 Пробуем ${method.toUpperCase()} ${endpoint}...`);
            const response = await apiClient[method](endpoint, requestData);
            console.log(
              `✅ ${method.toUpperCase()} ${endpoint} успешен:`,
              response.data
            );
            return response.data;
          } catch (error) {
            console.log(
              `⚠️ ${method.toUpperCase()} ${endpoint} не сработал:`,
              error.message
            );
            // Продолжаем пробовать следующий метод
          }
        }
      }

      // Если ни один endpoint не сработал
      throw new Error("Все endpoint'ы для обновления набора не сработали");
    },
    onSuccess: (updatedSet) => {
      console.log("🔄 Обновляем кэш для набора:", updatedSet?.id);

      if (updatedSet?.id) {
        // Обновляем в кэше
        queryClient.setQueryData(cardsetsKeys.all, (old) =>
          old
            ? old.map((set) => (set.id === updatedSet.id ? updatedSet : set))
            : []
        );

        // Обновляем детальный запрос
        queryClient.setQueryData(
          cardsetsKeys.detail(updatedSet.id),
          updatedSet
        );

        // Инвалидируем детальный запрос
        queryClient.invalidateQueries({
          queryKey: cardsetsKeys.detail(updatedSet.id),
        });

        // Синхронизируем с Zustand store
        const dataStore = useDataStore.getState();
        const currentSelectedSet = dataStore.selectedSet;
        if (currentSelectedSet && currentSelectedSet.id === updatedSet.id) {
          dataStore.setSelectedSet(updatedSet);
        }
      }
    },
    onError: (error) => {
      console.error("🔥 Критическая ошибка обновления набора:", error);
      console.error("Детали ошибки:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    },
  });
};

// Обновить остальные мутации тоже (остаются без изменений)
export const useCreateSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (setData) => {
      console.log("🔄 Создание набора (полные данные):", setData);
      console.log("🔄 Тип tags:", typeof setData.tags, setData.tags);

      // УБРАТЬ преобразование в строку! Отправляем массив как есть
      const dataToSend = {
        title: setData.title,
        tags: setData.tags, // ← Оставляем как МАССИВ, не преобразуем в строку!
      };

      console.log("🔄 Данные для отправки:", dataToSend);

      // Пробуем разные endpoint'ы
      const endpoints = ["/cardsets", "/api/cardsets"];

      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Пробуем POST ${endpoint}...`);
          const response = await apiClient.post(endpoint, dataToSend);
          console.log(`✅ POST ${endpoint} успешен:`, response.data);
          return response.data;
        } catch (error) {
          console.log(`⚠️ POST ${endpoint} не сработал:`, error.message);
          console.log("Ответ сервера:", error.response?.data);
        }
      }

      throw new Error("Не удалось создать набор");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardsetsKeys.all });
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
      const endpoints = [`/cardsets/${setId}`, `/api/cardsets/${setId}`];

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
      queryClient.setQueryData(cardsetsKeys.all, (old) =>
        old ? old.filter((set) => set.id !== setId) : []
      );
    },
  });
};
