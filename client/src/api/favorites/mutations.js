import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api-client";
import { favoritesKeys } from "./queries";
import { cardSetsKeys } from "../cardSets/queries";
import { useAuthStore } from "../../shared/stores/authStore";

// Переключить избранное для набора
export const useToggleFavoriteSet = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (setId) => {
      console.log(
        "🎯 [FRONTEND] useToggleFavoriteSet вызывается с setId:",
        setId
      );
      console.log("🎯 [FRONTEND] Тип setId:", typeof setId, "Значение:", setId);

      // Проверяем текущие избранные наборы
      const currentFavorites =
        queryClient.getQueryData(favoritesKeys.sets()) || [];
      console.log(
        "🎯 [FRONTEND] Текущие избранные:",
        currentFavorites.map((f) => f.cardSetId || f.id)
      );

      const isFavorite = currentFavorites.some(
        (fav) =>
          fav.cardSetId === setId ||
          fav.id === setId ||
          fav.cardSet?.id === setId
      );

      console.log("🎯 [FRONTEND] isFavorite:", isFavorite);

      if (isFavorite) {
        console.log("➖ [FRONTEND] Удаляем набор из избранного, setId:", setId);
        // Используем endpoint для удаления по setId
        const response = await apiClient.delete(
          `/api/favorites/sets/byset/${setId}`
        );
        return { action: "remove", data: response.data, setId };
      } else {
        console.log("➕ [FRONTEND] Добавляем набор в избранное, setId:", setId);
        const response = await apiClient.post("/api/favorites/sets", { setId });
        return { action: "add", data: response.data, setId };
      }
    },
    onSuccess: (result, setId) => {
      console.log("✅ [FRONTEND] Мутация успешна:", {
        action: result.action,
        setId: result.setId || setId,
      });

      // 1. Инвалидируем запрос избранных наборов
      queryClient.invalidateQueries({ queryKey: favoritesKeys.sets() });

      // 2. ОБНОВЛЯЕМ КЭШ ВСЕХ НАБОРОВ - КЛЮЧЕВОЕ ИЗМЕНЕНИЕ!
      queryClient.setQueryData(cardSetsKeys.all, (oldSets) => {
        if (!oldSets) return oldSets;

        return oldSets.map((set) => {
          if (set.id === (result.setId || setId)) {
            const updatedSet = {
              ...set,
              isFavorite: result.action === "add" ? true : false,
            };
            console.log("🔄 [FRONTEND] Обновлен набор в кэше:", {
              id: updatedSet.id,
              title: updatedSet.title,
              isFavorite: updatedSet.isFavorite,
            });
            return updatedSet;
          }
          return set;
        });
      });

      // 3. Инвалидируем запрос детального набора (если открыт)
      queryClient.invalidateQueries({
        queryKey: cardSetsKeys.detail(result.setId || setId),
      });

      // 4. Обновляем локальный стейт для мгновенной обратной связи
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: cardSetsKeys.all });
      }, 100);
    },
    onError: (error) => {
      console.error("❌ [FRONTEND] Ошибка переключения избранного:", {
        error: error.message,
        response: error.response?.data,
      });
    },
  });
};

// Переключить избранное для карточки
export const useToggleFavoriteCard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (cardId) => {
      console.log(
        "🎯 [FRONTEND] useToggleFavoriteCard вызывается с cardId:",
        cardId
      );

      const currentFavorites =
        queryClient.getQueryData(favoritesKeys.cards()) || [];
      const isFavorite = currentFavorites.some(
        (fav) =>
          fav.cardId === cardId || fav.id === cardId || fav.card?.id === cardId
      );

      if (isFavorite) {
        console.log(
          "➖ [FRONTEND] Удаляем карточку из избранного, cardId:",
          cardId
        );
        const response = await apiClient.delete(
          `/api/favorites/cards/bycard/${cardId}`
        );
        return { action: "remove", data: response.data, cardId };
      } else {
        console.log(
          "➕ [FRONTEND] Добавляем карточку в избранное, cardId:",
          cardId
        );
        const response = await apiClient.post("/api/favorites/cards", {
          cardId,
        });
        return { action: "add", data: response.data, cardId };
      }
    },
    onSuccess: (result) => {
      console.log("✅ [FRONTEND] Карточка обновлена в избранном:", result);

      // 1. Инвалидируем запрос избранных карточек
      queryClient.invalidateQueries({ queryKey: favoritesKeys.cards() });

      // 2. Инвалидируем запросы наборов (где может быть эта карточка)
      queryClient.invalidateQueries({ queryKey: cardSetsKeys.all });

      // 3. Для мгновенной обратной связи
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: favoritesKeys.cards() });
      }, 100);
    },
    onError: (error) => {
      console.error(
        "❌ [FRONTEND] Ошибка переключения избранной карточки:",
        error
      );
    },
  });
};
