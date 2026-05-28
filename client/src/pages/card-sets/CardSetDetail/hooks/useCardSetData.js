import { useState, useEffect, useCallback } from 'react';
import { cardSetsApi } from '../../../../features/cardSets/api/cardSetsApi';

/**
 * Хук для загрузки данных набора карточек и самих карточек
 * @param {string} setId - ID набора карточек
 * @param {object} toast - объект toast для показа уведомлений
 * @param {function} navigate - функция навигации react-router
 * @returns {object} { set, cards, loading, loadSet }
 */
export function useCardSetData(setId, toast, navigate) {
  const [set, setSet] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSet = useCallback(async () => {
    try {
      const [setResponse, cardsResponse] = await Promise.all([
        cardSetsApi.getCardSet(setId),
        cardSetsApi.getCards(setId),
      ]);
      setSet(setResponse.data);
      setCards(cardsResponse.data);
    } catch (error) {
      console.error("Error loading set:", error);
      toast.error("Ошибка загрузки набора");
      navigate("/card-sets");
    } finally {
      setLoading(false);
    }
  }, [setId, navigate, toast]);

  useEffect(() => {
    loadSet();
  }, [loadSet]);

  return {
    set,
    cards,
    setCards, // нужно для обновления после операций с карточками
    loading,
    loadSet, // можно вызвать вручную при необходимости
  };
}
