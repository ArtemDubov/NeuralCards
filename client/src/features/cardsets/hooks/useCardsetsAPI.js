import { useState } from "react";
import apiClient from "../../../api-client";

export const searchCardsets = async (query) => {
  try {
    const response = await apiClient.get(
      `/search/cardsets?query=${encodeURIComponent(query)}`
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
      `/search/cards?query=${encodeURIComponent(query)}`
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
      `/search/tags?tags=${encodeURIComponent(tags.join(","))}`
    );
    return response.data;
  } catch (error) {
    console.error("Tags search error:", error);
    throw error;
  }
};

export const useCardsetsAPI = () => {
  const [cardsets, setCardsets] = useState([]);
  const [newSetTitle, setNewSetTitle] = useState("");
  const [selectedSet, setSelectedSet] = useState(null);
  const [tags, setTags] = useState([]);

  const loadCardsets = async () => {
    try {
      const response = await apiClient.get("/cardsets");
      setCardsets(response.data);
      return response.data;
    } catch (error) {
      console.error("Ошибка загрузки наборов:", error);
      return [];
    }
  };

  const handleCreateSet = async (e, setActiveTab) => {
    e.preventDefault();
    try {
      await apiClient.post("/cardsets", {
        title: newSetTitle,
        description: "Мой новый набор",
        isPublic: false,
        tags: Array.isArray(tags) ? tags.map((tag) => ({ name: tag })) : [], // Добавьте проверку
      });

      setNewSetTitle("");
      setTags([]);
      const updatedCardsets = await loadCardsets();

      const newSet = updatedCardsets[updatedCardsets.length - 1];

      if (newSet && setActiveTab) {
        setSelectedSet(newSet);
        setActiveTab("view-set");
      }

      return true;
    } catch (error) {
      alert("Ошибка создания набора: " + error.message);
      return false;
    }
  };

  return {
    cardsets,
    setCardsets,
    newSetTitle,
    setNewSetTitle,
    selectedSet,
    setSelectedSet,
    tags,
    setTags,
    loadCardsets,
    handleCreateSet,
  };
};
