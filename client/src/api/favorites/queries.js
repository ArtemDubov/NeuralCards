import { useQuery } from "@tanstack/react-query";
import apiClient from "../../api-client";

export const favoritesKeys = {
  all: ["favorites"],
  sets: () => [...favoritesKeys.all, "sets"],
  cards: () => [...favoritesKeys.all, "cards"],
};

// Все избранные наборы
export const useFavoriteSets = () => {
  return useQuery({
    queryKey: favoritesKeys.sets(),
    queryFn: async () => {
      const response = await apiClient.get("/api/favorites");
      return response.data || [];
    },
  });
};

// Все избранные карточки
export const useFavoriteCards = () => {
  return useQuery({
    queryKey: favoritesKeys.cards(),
    queryFn: async () => {
      const response = await apiClient.get("/api/favorites/cards");
      return response.data || [];
    },
  });
};

// Проверить, избран ли набор
export const useIsSetFavorite = (setId) => {
  const { data: favoriteSets = [] } = useFavoriteSets();

  const isFavorite = favoriteSets.some(
    (fav) =>
      fav.cardSetId === setId || fav.id === setId || fav.cardSet?.id === setId
  );

  return isFavorite;
};

// Проверить, избран ли карточка
export const useIsCardFavorite = (cardId) => {
  const { data: favoriteCards = [] } = useFavoriteCards();

  const isFavorite = favoriteCards.some(
    (fav) =>
      fav.cardId === cardId || fav.id === cardId || fav.card?.id === cardId
  );

  return isFavorite;
};

// Все избранное
export const useAllFavorites = () => {
  const { data: sets = [], isLoading: setsLoading } = useFavoriteSets();
  const { data: cards = [], isLoading: cardsLoading } = useFavoriteCards();

  return {
    sets,
    cards,
    isLoading: setsLoading || cardsLoading,
  };
};
