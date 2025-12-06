import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api-client";
import { favoritesKeys } from "./queries";

// Добавить/удалить набор из избранного
export const useToggleFavoriteSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (setId) => {
      const currentFavorites =
        queryClient.getQueryData(favoritesKeys.sets()) || [];
      const isFavorite = currentFavorites.some(
        (fav) => fav.cardsetId === setId || fav.id === setId
      );

      if (isFavorite) {
        await apiClient.delete(`/api/favorites/${setId}`);
        return { setId, action: "removed" };
      } else {
        await apiClient.post(`/api/favorites/${setId}`);
        return { setId, action: "added" };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoritesKeys.sets() });
    },
  });
};

// Добавить/удалить карточку из избранного
export const useToggleFavoriteCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cardId) => {
      const currentFavorites =
        queryClient.getQueryData(favoritesKeys.cards()) || [];
      const isFavorite = currentFavorites.some(
        (fav) => fav.cardId === cardId || fav.id === cardId
      );

      if (isFavorite) {
        await apiClient.delete(`/api/favorites/card/${cardId}`);
        return { cardId, action: "removed" };
      } else {
        await apiClient.post(`/api/favorites/card/${cardId}`);
        return { cardId, action: "added" };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoritesKeys.cards() });
    },
  });
};
