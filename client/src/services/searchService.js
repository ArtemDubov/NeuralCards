import apiClient from "../api-client";

export const searchCardsets = async (query) => {
  try {
    const response = await apiClient.get(
      `/api/search/cardsets?query=${encodeURIComponent(query)}`
    );
    return response.data;
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};

export const searchCards = async (query) => {
  try {
    const response = await apiClient.get(
      `/api/search/cards?query=${encodeURIComponent(query)}`
    );
    return response.data;
  } catch (error) {
    console.error("Cards search error:", error);
    throw error;
  }
};

export const searchByTags = async (tags) => {
  try {
    const response = await apiClient.get(
      `/api/search/tags?tags=${encodeURIComponent(tags.join(","))}`
    );
    return response.data;
  } catch (error) {
    console.error("Tags search error:", error);
    throw error;
  }
};
