import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api-client";
import { cardsetsKeys } from "../cardsets/queries";
import { useDataStore } from "../../shared/stores/dataStore";

// Добавить карточку
export const useAddCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ setId, cardData }) => {
      const response = await apiClient.post(
        `/api/cardsets/${setId}/cards`,
        cardData
      );
      return response.data;
    },
    onSuccess: (newCard, { setId }) => {
      console.log("✅ Карточка добавлена!", { newCard, setId });

      // 🔥 ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ ДЕТАЛЬНОГО НАБОРА В REACT QUERY
      queryClient.setQueryData(cardsetsKeys.detail(setId), (old) => {
        if (!old) return old;
        return {
          ...old,
          cards: [...(old.cards || []), newCard],
        };
      });

      // Обновляем кэш всех наборов
      queryClient.setQueryData(cardsetsKeys.all, (old) =>
        old
          ? old.map((set) =>
              set.id === setId
                ? { ...set, cards: [...(set.cards || []), newCard] }
                : set
            )
          : []
      );

      // 🔥 СИНХРОНИЗИРУЕМ ZUSTAND
      const dataStore = useDataStore.getState();
      const currentSelectedSet = dataStore.selectedSet;

      if (currentSelectedSet && currentSelectedSet.id === setId) {
        dataStore.setSelectedSet({
          ...currentSelectedSet,
          cards: [...(currentSelectedSet.cards || []), newCard],
        });
      }

      // Инвалидируем для гарантии свежих данных
      queryClient.invalidateQueries({ queryKey: cardsetsKeys.detail(setId) });
    },
    onError: (error) => {
      console.error("❌ Ошибка добавления карточки:", error);
    },
  });
};

// Обновить карточку
export const useUpdateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ setId, cardId, cardData }) => {
      const response = await apiClient.put(
        `/api/cardsets/${setId}/cards/${cardId}`,
        cardData
      );
      return response.data;
    },
    onSuccess: (updatedCard, { setId }) => {
      console.log("✏️ Карточка обновлена!", { updatedCard, setId });

      // 🔥 ОБНОВЛЯЕМ ДЕТАЛЬНЫЙ НАБОР В REACT QUERY
      queryClient.setQueryData(cardsetsKeys.detail(setId), (old) => {
        if (!old) return old;
        return {
          ...old,
          cards: (old.cards || []).map((card) =>
            card.id === updatedCard.id ? updatedCard : card
          ),
        };
      });

      // Обновляем кэш всех наборов
      queryClient.setQueryData(cardsetsKeys.all, (old) =>
        old
          ? old.map((set) =>
              set.id === setId
                ? {
                    ...set,
                    cards: (set.cards || []).map((card) =>
                      card.id === updatedCard.id ? updatedCard : card
                    ),
                  }
                : set
            )
          : []
      );

      // 🔥 СИНХРОНИЗИРУЕМ ZUSTAND
      const dataStore = useDataStore.getState();
      const currentSelectedSet = dataStore.selectedSet;

      if (currentSelectedSet && currentSelectedSet.id === setId) {
        dataStore.setSelectedSet({
          ...currentSelectedSet,
          cards: (currentSelectedSet.cards || []).map((card) =>
            card.id === updatedCard.id ? updatedCard : card
          ),
        });
      }

      // Инвалидируем для гарантии
      queryClient.invalidateQueries({ queryKey: cardsetsKeys.detail(setId) });
    },
    onError: (error) => {
      console.error("❌ Ошибка обновления карточки:", error);
    },
  });
};

// Удалить карточку
export const useDeleteCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ setId, cardId }) => {
      await apiClient.delete(`/api/cardsets/${setId}/cards/${cardId}`);
      return { setId, cardId };
    },
    onSuccess: ({ setId, cardId }) => {
      console.log("🗑️ Карточка удалена!", { setId, cardId });

      // 🔥 ОБНОВЛЯЕМ ДЕТАЛЬНЫЙ НАБОР В REACT QUERY
      queryClient.setQueryData(cardsetsKeys.detail(setId), (old) => {
        if (!old) return old;
        return {
          ...old,
          cards: (old.cards || []).filter((card) => card.id !== cardId),
        };
      });

      // Обновляем кэш всех наборов
      queryClient.setQueryData(cardsetsKeys.all, (old) =>
        old
          ? old.map((set) =>
              set.id === setId
                ? {
                    ...set,
                    cards: (set.cards || []).filter(
                      (card) => card.id !== cardId
                    ),
                  }
                : set
            )
          : []
      );

      // 🔥 СИНХРОНИЗИРУЕМ ZUSTAND
      const dataStore = useDataStore.getState();
      const currentSelectedSet = dataStore.selectedSet;

      if (currentSelectedSet && currentSelectedSet.id === setId) {
        dataStore.setSelectedSet({
          ...currentSelectedSet,
          cards: (currentSelectedSet.cards || []).filter(
            (card) => card.id !== cardId
          ),
        });
      }

      queryClient.invalidateQueries({ queryKey: cardsetsKeys.detail(setId) });
    },
    onError: (error) => {
      console.error("❌ Ошибка удаления карточки:", error);
    },
  });
};
