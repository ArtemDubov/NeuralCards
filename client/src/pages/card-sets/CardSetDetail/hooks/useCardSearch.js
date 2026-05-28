import { useState, useMemo, useEffect } from 'react';

/**
 * Хук для поиска и фильтрации карточек
 * @param {Array} cards - массив карточек
 * @returns {object} { searchQuery, setSearchQuery, searchFilters, setSearchFilters, showSearchFilters, setShowSearchFilters, filteredCards }
 */
export function useCardSearch(cards) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchFilters, setShowSearchFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    wholeWords: false,
    caseSensitive: false,
    searchBack: true,
    searchFront: true,
  });

  // Закрытие модалки фильтров при клике вне
  useEffect(() => {
    if (!showSearchFilters) return;
    const handleClick = (e) => {
      const modal = e.target.closest("[data-search-filters-modal]");
      const filterBtn = e.target.closest("[data-search-filter-btn]");
      if (!modal && !filterBtn) {
        setShowSearchFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showSearchFilters]);

  // Фильтрация карточек по поисковому запросу
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return cards;

    let query = searchQuery.trim();

    // Проверяем, является ли запрос числом (поиск по номеру карточки)
    const isNumberQuery = /^\d+$/.test(query);

    return cards.filter((card, index) => {
      // Поиск по номеру карточки
      if (isNumberQuery) {
        const cardNumber = index + 1;
        if (cardNumber === parseInt(query)) return true;
      }

      const frontText = card.front_text || "";
      const backText = card.back_text || "";

      let searchText = "";
      if (searchFilters.searchFront) searchText += frontText + " ";
      if (searchFilters.searchBack) searchText += backText;

      searchText = searchText.trim();

      if (!searchText) return false;

      let text = searchText;
      let search = query;

      if (!searchFilters.caseSensitive) {
        text = text.toLowerCase();
        search = search.toLowerCase();
      }

      if (searchFilters.wholeWords) {
        const regex = new RegExp(`\\b${search}\\b`);
        return regex.test(text);
      } else {
        return text.includes(search);
      }
    });
  }, [cards, searchQuery, searchFilters]);

  return {
    searchQuery,
    setSearchQuery,
    searchFilters,
    setSearchFilters,
    showSearchFilters,
    setShowSearchFilters,
    filteredCards,
  };
}
