import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api-client";
import { cardSetsKeys } from '../cardSets';
import { useDataStore } from "../../shared/stores/dataStore";

// Добавить карточку
export const useAddCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ setId, cardData }) => {
      const response = await apiClient.post(
        `/api/cards/${setId}/cards`,
        cardData
      );
      return response.data;
    },
    onSuccess: (newCard, { setId }) => {
      console.log("✅ Карточка добавлена!", { newCard, setId });

      // 🔥 ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ ДЕТАЛЬНОГО НАБОРА В REACT QUERY
      queryClient.setQueryData(cardSetsKeys.detail(setId), (old) => {
        if (!old) return old;
        return {
          ...old,
          cards: [...(old.cards || []), newCard],
        };
      });

      // Обновляем кэш всех наборов
      queryClient.setQueryData(cardSetsKeys.all, (old) =>
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
      queryClient.invalidateQueries({ queryKey: cardSetsKeys.detail(setId) });
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
        `/api/cards/${setId}/cards/${cardId}`,
        cardData
      );
      return response.data;
    },
    onSuccess: (updatedCard, { setId }) => {
      console.log("✏️ Карточка обновлена!", { updatedCard, setId });

      // 🔥 ОБНОВЛЯЕМ ДЕТАЛЬНЫЙ НАБОР В REACT QUERY
      queryClient.setQueryData(cardSetsKeys.detail(setId), (old) => {
        if (!old) return old;
        return {
          ...old,
          cards: (old.cards || []).map((card) =>
            card.id === updatedCard.id ? updatedCard : card
          ),
        };
      });

      // Обновляем кэш всех наборов
      queryClient.setQueryData(cardSetsKeys.all, (old) =>
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
      queryClient.invalidateQueries({ queryKey: cardSetsKeys.detail(setId) });
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
      await apiClient.delete(`/api/cards/${setId}/cards/${cardId}`);
      return { setId, cardId };
    },
    onSuccess: ({ setId, cardId }) => {
      console.log("🗑️ Карточка удалена!", { setId, cardId });

      // 🔥 ОБНОВЛЯЕМ ДЕТАЛЬНЫЙ НАБОР В REACT QUERY
      queryClient.setQueryData(cardSetsKeys.detail(setId), (old) => {
        if (!old) return old;
        return {
          ...old,
          cards: (old.cards || []).filter((card) => card.id !== cardId),
        };
      });

      // Обновляем кэш всех наборов
      queryClient.setQueryData(cardSetsKeys.all, (old) =>
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

      queryClient.invalidateQueries({ queryKey: cardSetsKeys.detail(setId) });
    },
    onError: (error) => {
      console.error("❌ Ошибка удаления карточки:", error);
    },
  });
};

// Добавить несколько карточек массово
export const useAddMultipleCards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ setId, cardsData }) => {
      const response = await apiClient.post(
        `/api/cards/${setId}/cards/batch`,
        cardsData
      );

      return response.data;
    },
    onSuccess: (newCards, { setId }) => {
      console.log("✅ Карточки добавлены массово!", {
        count: Array.isArray(newCards) ? newCards.length : 0,
        setId,
      });

      // Добавляем только если есть карточки
      if (Array.isArray(newCards) && newCards.length > 0) {
        // 🔥 ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ
        queryClient.setQueryData(cardSetsKeys.detail(setId), (old) => {
          if (!old) return old;
          return {
            ...old,
            cards: [...(old.cards || []), ...newCards],
          };
        });

        // Обновляем кэш всех наборов
        queryClient.setQueryData(cardSetsKeys.all, (old) =>
          old
            ? old.map((set) =>
                set.id === setId
                  ? { ...set, cards: [...(set.cards || []), ...newCards] }
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
            cards: [...(currentSelectedSet.cards || []), ...newCards],
          });
        }

        queryClient.invalidateQueries({ queryKey: cardSetsKeys.detail(setId) });
      }
    },
    onError: (error) => {
      console.error("❌ Ошибка массового добавления карточек:", error);

      // Если есть частичные данные, не показываем общую ошибку
      const hasPartialData = error?.response?.data?.createdCards;
      if (hasPartialData) {
        console.log("⚠️ Частичные данные получены:", hasPartialData.length);
      }
    },
  });
};
