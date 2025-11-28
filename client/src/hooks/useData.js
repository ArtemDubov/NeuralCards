import { useState, useCallback, useEffect } from "react";
import apiClient from "../api-client";
import { useAuth } from "./useAuth";

export const useData = () => {
  const { isLoggedIn } = useAuth();

  const [state, setState] = useState({
    cardsets: [],
    selectedSet: null,
    searchResults: null,
    searchQuery: "",
    isSearching: false,
  });

  const loadCardsets = useCallback(async () => {
    try {
      const response = await apiClient.get("/api/cardsets");
      const cardsets = response.data;

      // ОБНОВЛЕНИЕ: Используем один вызов setState для обновления обоих состояний
      setState((prev) => {
        const updatedState = {
          ...prev,
          cardsets,
        };

        // Обновляем selectedSet если он есть
        if (prev.selectedSet) {
          const updatedSelectedSet = cardsets.find(
            (set) => set.id === prev.selectedSet.id
          );
          if (updatedSelectedSet) {
            updatedState.selectedSet = updatedSelectedSet;
          }
        }

        return updatedState;
      });

      return cardsets;
    } catch (error) {
      console.error("Ошибка загрузки наборов:", error);
      return [];
    }
  }, []);

  const createSet = useCallback(async (setData) => {
    try {
      const response = await apiClient.post("/api/cardsets", setData);
      const newSet = response.data;

      // Оптимистичное обновление
      setState((prev) => ({
        ...prev,
        cardsets: [...prev.cardsets, newSet],
        selectedSet: newSet, // Сразу выбираем новый набор
      }));

      return newSet;
    } catch (error) {
      console.error("Ошибка создания набора:", error);
      throw error;
    }
  }, []);

  const deleteSet = useCallback(
    async (setId) => {
      try {
        // Оптимистичное обновление
        setState((prev) => ({
          ...prev,
          cardsets: prev.cardsets.filter((set) => set.id !== setId),
          selectedSet: prev.selectedSet?.id === setId ? null : prev.selectedSet,
        }));

        await apiClient.delete(`/api/cardsets/${setId}`);

        // Перезагружаем для синхронизации
        await loadCardsets();

        return true;
      } catch (error) {
        // Откатываем оптимистичное обновление в случае ошибки
        await loadCardsets();
        console.error("Ошибка удаления набора:", error);
        throw error;
      }
    },
    [loadCardsets]
  );

  const addCard = useCallback(async (setId, cardData) => {
    try {
      const response = await apiClient.post(
        `/api/cardsets/${setId}/cards`,
        cardData
      );
      const newCard = response.data;

      // Оптимистичное обновление
      setState((prev) => {
        const updatedCardsets = prev.cardsets.map((set) => {
          if (set.id === setId) {
            return {
              ...set,
              cards: [...(set.cards || []), newCard],
            };
          }
          return set;
        });

        const updatedSelectedSet = updatedCardsets.find(
          (set) => set.id === setId
        );

        return {
          ...prev,
          cardsets: updatedCardsets,
          selectedSet:
            prev.selectedSet?.id === setId
              ? updatedSelectedSet
              : prev.selectedSet,
        };
      });

      return newCard;
    } catch (error) {
      console.error("Ошибка добавления карточки:", error);
      throw error;
    }
  }, []);

  const updateCard = useCallback(async (setId, cardId, cardData) => {
    try {
      const response = await apiClient.put(
        `/api/cardsets/${setId}/cards/${cardId}`,
        cardData
      );
      const updatedCard = response.data;

      // Оптимистичное обновление
      setState((prev) => {
        const updatedCardsets = prev.cardsets.map((set) => {
          if (set.id === setId) {
            return {
              ...set,
              cards: (set.cards || []).map((card) =>
                card.id === cardId ? { ...card, ...updatedCard } : card
              ),
            };
          }
          return set;
        });

        const updatedSelectedSet = updatedCardsets.find(
          (set) => set.id === setId
        );

        return {
          ...prev,
          cardsets: updatedCardsets,
          selectedSet:
            prev.selectedSet?.id === setId
              ? updatedSelectedSet
              : prev.selectedSet,
        };
      });

      return updatedCard;
    } catch (error) {
      console.error("Ошибка обновления карточки:", error);
      throw error;
    }
  }, []);

  const deleteCard = useCallback(
    async (setId, cardId) => {
      try {
        // Оптимистичное обновление
        setState((prev) => {
          const updatedCardsets = prev.cardsets.map((set) => {
            if (set.id === setId) {
              return {
                ...set,
                cards: (set.cards || []).filter((card) => card.id !== cardId),
              };
            }
            return set;
          });

          const updatedSelectedSet = updatedCardsets.find(
            (set) => set.id === setId
          );

          return {
            ...prev,
            cardsets: updatedCardsets,
            selectedSet:
              prev.selectedSet?.id === setId
                ? updatedSelectedSet
                : prev.selectedSet,
          };
        });

        await apiClient.delete(`/api/cardsets/${setId}/cards/${cardId}`);

        return true;
      } catch (error) {
        // Откатываем в случае ошибки
        await loadCardsets();
        console.error("Ошибка удаления карточки:", error);
        throw error;
      }
    },
    [loadCardsets]
  );

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setState((prev) => ({ ...prev, searchResults: null, searchQuery: "" }));
      return;
    }

    setState((prev) => ({ ...prev, isSearching: true, searchQuery: query }));

    try {
      const [cardsetsResults, cardsResults] = await Promise.all([
        apiClient.get(
          `/api/search/cardsets?query=${encodeURIComponent(query)}`
        ),
        apiClient.get(`/api/search/cards?query=${encodeURIComponent(query)}`),
      ]);

      setState((prev) => ({
        ...prev,
        searchResults: {
          cardsets: cardsetsResults.data,
          cards: cardsResults.data,
          query,
        },
        isSearching: false,
      }));
    } catch (error) {
      console.error("Ошибка поиска:", error);
      setState((prev) => ({ ...prev, isSearching: false }));
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadCardsets();
    }
  }, [isLoggedIn, loadCardsets]);

  return {
    ...state,
    loadCardsets,
    createSet,
    deleteSet,
    addCard,
    updateCard,
    deleteCard,
    handleSearch,
    setSelectedSet: (set) =>
      setState((prev) => ({ ...prev, selectedSet: set })),
    clearSearch: () =>
      setState((prev) => ({ ...prev, searchResults: null, searchQuery: "" })),
  };
};
