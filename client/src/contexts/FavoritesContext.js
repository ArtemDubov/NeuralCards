import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import apiClient from "../api-client";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favoriteSets, setFavoriteSets] = useState(new Set());
  const [favoriteCards, setFavoriteCards] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка избранного с сервера
  const loadFavorites = useCallback(async () => {
    try {
      console.log("🔄 [FavoritesContext] Загрузка избранного...");
      setIsLoading(true);

      const [setsResponse, cardsResponse] = await Promise.all([
        apiClient.get("/api/favorites"),
        apiClient.get("/api/favorites/cards"),
      ]);

      const setsIds = new Set(
        setsResponse.data.map((fav) => fav.cardsetId || fav.id)
      );
      const cardsIds = new Set(
        cardsResponse.data.map((fav) => fav.cardId || fav.id)
      );

      console.log("✅ [FavoritesContext] Избранное загружено:", {
        наборы: setsIds.size,
        карточки: cardsIds.size,
      });

      setFavoriteSets(setsIds);
      setFavoriteCards(cardsIds);

      return { sets: setsIds, cards: cardsIds };
    } catch (error) {
      console.error("❌ [FavoritesContext] Ошибка загрузки избранного:", error);
      return { sets: new Set(), cards: new Set() };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Проверка, является ли набор избранным
  const isSetFavorite = useCallback(
    (setId) => {
      return favoriteSets.has(setId);
    },
    [favoriteSets]
  );

  // Проверка, является ли карточка избранной
  const isCardFavorite = useCallback(
    (cardId) => {
      return favoriteCards.has(cardId);
    },
    [favoriteCards]
  );

  // Добавление набора в избранное
  const addFavoriteSet = useCallback(async (setId) => {
    try {
      console.log(`⭐ [FavoritesContext] Добавляем набор ${setId} в избранное`);

      // Оптимистичное обновление
      setFavoriteSets((prev) => new Set([...prev, setId]));

      await apiClient.post(`/api/favorites/${setId}`);

      console.log(`✅ [FavoritesContext] Набор ${setId} добавлен в избранное`);

      // Отправляем событие для обновления UI
      window.dispatchEvent(
        new CustomEvent("favoritesUpdated", {
          detail: { itemType: "cardset", itemId: setId, isFavorite: true },
        })
      );

      return true;
    } catch (error) {
      // Откатываем при ошибке
      setFavoriteSets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(setId);
        return newSet;
      });

      console.error(
        `❌ [FavoritesContext] Ошибка добавления набора ${setId}:`,
        error
      );
      throw error;
    }
  }, []);

  // Удаление набора из избранного
  const removeFavoriteSet = useCallback(async (setId) => {
    try {
      console.log(`🗑️ [FavoritesContext] Удаляем набор ${setId} из избранного`);

      // Оптимистичное обновление
      setFavoriteSets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(setId);
        return newSet;
      });

      await apiClient.delete(`/api/favorites/${setId}`);

      console.log(`✅ [FavoritesContext] Набор ${setId} удален из избранного`);

      // Отправляем событие для обновления UI
      window.dispatchEvent(
        new CustomEvent("favoritesUpdated", {
          detail: { itemType: "cardset", itemId: setId, isFavorite: false },
        })
      );

      return true;
    } catch (error) {
      // Откатываем при ошибке
      setFavoriteSets((prev) => new Set([...prev, setId]));

      console.error(
        `❌ [FavoritesContext] Ошибка удаления набора ${setId}:`,
        error
      );
      throw error;
    }
  }, []);

  // Переключение избранного для наборов
  const toggleFavoriteSet = useCallback(
    async (setId) => {
      if (isSetFavorite(setId)) {
        await removeFavoriteSet(setId);
      } else {
        await addFavoriteSet(setId);
      }
    },
    [isSetFavorite, addFavoriteSet, removeFavoriteSet]
  );

  // Добавление карточки в избранное
  const addFavoriteCard = useCallback(async (cardId) => {
    try {
      console.log(
        `⭐ [FavoritesContext] Добавляем карточку ${cardId} в избранное`
      );

      // Оптимистичное обновление
      setFavoriteCards((prev) => new Set([...prev, cardId]));

      await apiClient.post(`/api/favorites/card/${cardId}`);

      console.log(
        `✅ [FavoritesContext] Карточка ${cardId} добавлена в избранное`
      );

      // Обновляем localStorage для fallback
      const savedFavorites = JSON.parse(
        localStorage.getItem("favorite-cards") || "[]"
      );
      localStorage.setItem(
        "favorite-cards",
        JSON.stringify([...savedFavorites, cardId])
      );

      window.dispatchEvent(
        new CustomEvent("favoritesUpdated", {
          detail: { itemType: "card", itemId: cardId, isFavorite: true },
        })
      );

      return true;
    } catch (error) {
      setFavoriteCards((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cardId);
        return newSet;
      });

      console.error(
        `❌ [FavoritesContext] Ошибка добавления карточки ${cardId}:`,
        error
      );
      throw error;
    }
  }, []);

  // Удаление карточки из избранного
  const removeFavoriteCard = useCallback(async (cardId) => {
    try {
      console.log(
        `🗑️ [FavoritesContext] Удаляем карточку ${cardId} из избранного`
      );

      // Оптимистичное обновление
      setFavoriteCards((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cardId);
        return newSet;
      });

      await apiClient.delete(`/api/favorites/card/${cardId}`);

      console.log(
        `✅ [FavoritesContext] Карточка ${cardId} удалена из избранного`
      );

      // Обновляем localStorage для fallback
      const savedFavorites = JSON.parse(
        localStorage.getItem("favorite-cards") || "[]"
      );
      localStorage.setItem(
        "favorite-cards",
        JSON.stringify(savedFavorites.filter((id) => id !== cardId))
      );

      window.dispatchEvent(
        new CustomEvent("favoritesUpdated", {
          detail: { itemType: "card", itemId: cardId, isFavorite: false },
        })
      );

      return true;
    } catch (error) {
      setFavoriteCards((prev) => new Set([...prev, cardId]));

      console.error(
        `❌ [FavoritesContext] Ошибка удаления карточки ${cardId}:`,
        error
      );
      throw error;
    }
  }, []);

  // Переключение избранного для карточек
  const toggleFavoriteCard = useCallback(
    async (cardId) => {
      if (isCardFavorite(cardId)) {
        await removeFavoriteCard(cardId);
      } else {
        await addFavoriteCard(cardId);
      }
    },
    [isCardFavorite, addFavoriteCard, removeFavoriteCard]
  );

  // Загружаем избранное при монтировании
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Синхронизация с localStorage для карточек (fallback)
  useEffect(() => {
    const savedFavorites = JSON.parse(
      localStorage.getItem("favorite-cards") || "[]"
    );
    if (savedFavorites.length > 0) {
      setFavoriteCards((prev) => new Set([...prev, ...savedFavorites]));
    }
  }, []);

  const value = {
    // Состояние
    favoriteSets: Array.from(favoriteSets),
    favoriteCards: Array.from(favoriteCards),
    isLoading,

    // Проверки
    isSetFavorite,
    isCardFavorite,

    // Действия с наборами
    addFavoriteSet,
    removeFavoriteSet,
    toggleFavoriteSet,

    // Действия с карточками
    addFavoriteCard,
    removeFavoriteCard,
    toggleFavoriteCard,

    // Утилиты
    loadFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
