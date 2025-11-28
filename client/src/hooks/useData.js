import { useState, useCallback, useEffect } from "react";
import apiClient from "../api-client";
import { useAuth } from "./useAuth";

export const useData = () => {
  const auth = useAuth(); // Получаем весь объект auth
  const { isLoggedIn, user } = auth; // Деструктурируем

  console.log("🔍 [useData] Состояние auth:", {
    isLoggedIn,
    user: user?.email,
    loading: auth.loading,
  });

  const [state, setState] = useState({
    cardsets: [],
    selectedSet: null,
    searchResults: null,
    searchQuery: "",
    isSearching: false,
  });

  const loadCardsets = useCallback(async () => {
    try {
      console.log("🟡 [useData] Загружаем наборы карточек...");
      const response = await apiClient.get("/api/cardsets");
      const cardsets = response.data;
      console.log("✅ [useData] Наборы загружены:", cardsets.length, "шт");

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
      console.error("❌ [useData] Ошибка загрузки наборов:", error);
      return [];
    }
  }, []);

  const createSet = useCallback(async (setData) => {
    try {
      console.log("🟡 [useData] createSet начал выполнение");
      console.log(
        "📤 [useData] Отправляемые данные:",
        JSON.stringify(setData, null, 2)
      );
      console.log(
        "🔑 [useData] Токен для запроса:",
        localStorage.getItem("token")
      );
      console.log("🌐 [useData] BaseURL:", apiClient.defaults.baseURL);

      const response = await apiClient.post("/api/cardsets", setData);
      const newSet = response.data;

      console.log("✅ [useData] Набор успешно создан на сервере:", newSet);

      // Оптимистичное обновление
      setState((prev) => ({
        ...prev,
        cardsets: [...prev.cardsets, newSet],
        selectedSet: newSet, // Сразу выбираем новый набор
      }));

      console.log("✅ [useData] Локальное состояние обновлено");
      return newSet;
    } catch (error) {
      console.error("❌ [useData] Ошибка создания набора:");
      console.error("❌ [useData] Сообщение ошибки:", error.message);
      console.error("❌ [useData] Статус ошибки:", error.response?.status);
      console.error("❌ [useData] Данные ошибки:", error.response?.data);
      console.error("❌ [useData] Заголовки запроса:", error.config?.headers);
      console.error("❌ [useData] URL запроса:", error.config?.url);
      console.error("❌ [useData] Метод запроса:", error.config?.method);
      console.error("❌ [useData] Данные запроса:", error.config?.data);

      throw error;
    }
  }, []);

  const deleteSet = useCallback(
    async (setId) => {
      try {
        console.log("🟡 [useData] Удаляем набор:", setId);

        // Оптимистичное обновление
        setState((prev) => ({
          ...prev,
          cardsets: prev.cardsets.filter((set) => set.id !== setId),
          selectedSet: prev.selectedSet?.id === setId ? null : prev.selectedSet,
        }));

        await apiClient.delete(`/api/cardsets/${setId}`);

        // Перезагружаем для синхронизации
        await loadCardsets();

        console.log("✅ [useData] Набор успешно удален");
        return true;
      } catch (error) {
        // Откатываем оптимистичное обновление в случае ошибки
        await loadCardsets();
        console.error("❌ [useData] Ошибка удаления набора:", error);
        throw error;
      }
    },
    [loadCardsets]
  );

  const addCard = useCallback(async (setId, cardData) => {
    try {
      console.log("🟡 [useData] Добавляем карточку в набор:", setId);
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

      console.log("✅ [useData] Карточка успешно добавлена");
      return newCard;
    } catch (error) {
      console.error("❌ [useData] Ошибка добавления карточки:", error);
      throw error;
    }
  }, []);

  const updateCard = useCallback(async (setId, cardId, cardData) => {
    try {
      console.log("🟡 [useData] Обновляем карточку:", cardId);
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

      console.log("✅ [useData] Карточка успешно обновлена");
      return updatedCard;
    } catch (error) {
      console.error("❌ [useData] Ошибка обновления карточки:", error);
      throw error;
    }
  }, []);

  const deleteCard = useCallback(
    async (setId, cardId) => {
      try {
        console.log("🟡 [useData] Удаляем карточку:", cardId);

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

        console.log("✅ [useData] Карточка успешно удалена");
        return true;
      } catch (error) {
        // Откатываем в случае ошибки
        await loadCardsets();
        console.error("❌ [useData] Ошибка удаления карточки:", error);
        throw error;
      }
    },
    [loadCardsets]
  );

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      console.log("🔍 [useData] Поиск очищен");
      setState((prev) => ({ ...prev, searchResults: null, searchQuery: "" }));
      return;
    }

    console.log("🔍 [useData] Выполняем поиск:", query);
    setState((prev) => ({ ...prev, isSearching: true, searchQuery: query }));

    try {
      const [cardsetsResults, cardsResults] = await Promise.all([
        apiClient.get(
          `/api/search/cardsets?query=${encodeURIComponent(query)}`
        ),
        apiClient.get(`/api/search/cards?query=${encodeURIComponent(query)}`),
      ]);

      console.log("✅ [useData] Результаты поиска получены:", {
        наборы: cardsetsResults.data.length,
        карточки: cardsResults.data.length,
      });

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
      console.error("❌ [useData] Ошибка поиска:", error);
      setState((prev) => ({ ...prev, isSearching: false }));
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      console.log("🟡 [useData] Пользователь авторизован, загружаем наборы...");
      loadCardsets();
    } else {
      console.log("🔴 [useData] Пользователь не авторизован");
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
