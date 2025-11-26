import { useState, useCallback } from "react";
import apiClient from "../../../api-client";

const useSearch = () => {
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 🎯 ОДИН УМНЫЙ ПОИСК ВМЕСТО ДВУХ ЗАПРОСОВ
  const handleSearch = async (query, searchType = "all") => {
    const trimmedQuery = query?.trim() || "";

    console.log(
      "🔍 Unified search called with:",
      trimmedQuery,
      "type:",
      searchType
    );

    // Если запрос пустой - очищаем результаты
    if (!trimmedQuery) {
      setSearchResults(null);
      setSearchQuery("");
      setIsSearching(false);
      return;
    }

    setSearchQuery(trimmedQuery);
    setIsSearching(true);

    try {
      // 🔍 ЕДИНЫЙ ЗАПРОС К НОВОМУ ENDPOINT
      const response = await apiClient.get(
        `/search/unified-search?query=${encodeURIComponent(trimmedQuery)}`
      );

      const { flashcards, cardsets } = response.data;

      console.log("📊 Unified search results:", {
        cardsets: cardsets,
        cards: flashcards,
        query: trimmedQuery,
      });

      // 📦 ВОЗВРАЩАЕМ РЕЗУЛЬТАТЫ В СТАРОМ ФОРМАТЕ ДЛЯ СОВМЕСТИМОСТИ
      setSearchResults({
        cardsets: cardsets || [],
        cards: flashcards || [],
        query: trimmedQuery,
      });
    } catch (error) {
      console.error("Unified search error:", error);
      setSearchResults({
        cardsets: [],
        cards: [],
        query: trimmedQuery,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults(null);
    setSearchQuery("");
    setIsSearching(false);
  };

  return {
    searchResults,
    isSearching,
    searchQuery,
    handleSearch,
    clearSearch,
  };
};

export default useSearch;
