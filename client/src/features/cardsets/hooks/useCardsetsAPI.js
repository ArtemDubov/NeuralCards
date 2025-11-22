import { useState } from "react";
import apiClient from "../../../api-client";

// Выносим функцию поиска отдельно
export const searchCardsets = async (query) => {
  try {
    const response = await apiClient.get(
      `/search/cardsets?query=${encodeURIComponent(query)}` // новый путь
    );
    return response.data;
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};

export const useCardsetsAPI = () => {
  const [cardsets, setCardsets] = useState([]);
  const [newSetTitle, setNewSetTitle] = useState("");
  const [selectedSet, setSelectedSet] = useState(null);
  const [tags, setTags] = useState([]);

  // Загрузка наборов пользователя
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

  // Создание нового набора с тегами
  const handleCreateSet = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post("/cardsets", {
        title: newSetTitle,
        description: "Мой новый набор",
        isPublic: false,
        tags: tags.map((tag) => ({ name: tag })),
      });

      setNewSetTitle("");
      setTags([]);
      await loadCardsets();
      return true;
    } catch (error) {
      alert("Ошибка создания набора: " + error.message);
      return false;
    }
  };

  return {
    // Состояния
    cardsets,
    setCardsets,
    newSetTitle,
    setNewSetTitle,
    selectedSet,
    setSelectedSet,
    tags,
    setTags,

    // Функции API
    loadCardsets,
    handleCreateSet,
  };
};
