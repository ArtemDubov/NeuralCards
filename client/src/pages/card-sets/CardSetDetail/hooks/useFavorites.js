import { useState, useEffect, useCallback } from 'react';
import { favoritesApi } from '../../../../features/favorites';

/**
 * Хук для управления избранными карточками
 * @param {string} setId - ID набора карточек
 * @param {object} toast - объект toast для показа уведомлений
 * @returns {object} { favoriteCardIds, toggleCardFavorite, isFavorite, refreshFavorites }
 */
export function useFavorites(setId, toast) {
  const [favoriteCardIds, setFavoriteCardIds] = useState(new Set());

  // Функция загрузки избранных карточек
  const loadFavorites = useCallback(async () => {
    if (!setId) return;

    try {
      // getList возвращает массив ID карточек
      const cardIds = await favoritesApi.getList("card");
      setFavoriteCardIds(new Set(cardIds));
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  }, [setId]);

  // Загрузка при монтировании и изменении setId
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Обновляем при возврате на вкладку ИЛИ при фокусе окна
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadFavorites();
      }
    };

    const handleFocus = () => {
      loadFavorites();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadFavorites]);

  const toggleCardFavorite = async (cardId) => {
    try {
      const isFav = favoriteCardIds.has(cardId);

      if (isFav) {
        await favoritesApi.remove("card", cardId);
        setFavoriteCardIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(cardId);
          return newSet;
        });
        toast.success("Удалено из избранного");
      } else {
        await favoritesApi.add("card", cardId);
        setFavoriteCardIds((prev) => {
          const newSet = new Set(prev);
          newSet.add(cardId);
          return newSet;
        });
        toast.success("Добавлено в избранное");
      }
    } catch (error) {
      toast.error("Ошибка при изменении избранного");
      console.error("Error toggling favorite:", error);
    }
  };

  const isFavorite = (cardId) => favoriteCardIds.has(cardId);

  return {
    favoriteCardIds,
    toggleCardFavorite,
    isFavorite,
    refreshFavorites: loadFavorites,
  };
}