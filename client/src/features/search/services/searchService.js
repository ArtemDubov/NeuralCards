// features/search/services/searchService.js
import apiClient from "../../../api-client";

class SearchService {
  async searchCardsets(query) {
    try {
      const response = await apiClient.get(
        `/search/cardsets?query=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      console.error("Search cardsets error:", error);
      return [];
    }
  }

  async searchCards(query) {
    try {
      const response = await apiClient.get(
        `/search/cards?query=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      console.error("Search cards error:", error);
      return [];
    }
  }

  async searchByTags(tags) {
    try {
      const response = await apiClient.get(
        `/search/tags?tags=${encodeURIComponent(tags.join(","))}`
      );
      return response.data;
    } catch (error) {
      console.error("Tags search error:", error);
      return [];
    }
  }

  async universalSearch(query) {
    try {
      const [cardsetsResults, cardsResults] = await Promise.all([
        this.searchCardsets(query),
        this.searchCards(query),
      ]);

      return {
        cardsets: cardsetsResults,
        cards: cardsResults,
        query: query,
      };
    } catch (error) {
      console.error("Universal search error:", error);
      return { cardsets: [], cards: [], query: query };
    }
  }
}

export const searchService = new SearchService();
