import React, { useState, useEffect } from "react";
import apiClient from "../../../api-client";

const FavoriteButton = ({ itemId, itemType = "cardset" }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // Проверяем при загрузке, в избранном ли элемент
  useEffect(() => {
    checkFavoriteStatus();
  }, [itemId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await apiClient.get("/favorites");
      const favorites = response.data;
      const isFav = favorites.some((fav) => fav.cardsetId === itemId);
      setIsFavorite(isFav);
    } catch (error) {
      console.error("Ошибка проверки избранного:", error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await apiClient.delete(`/favorites/${itemId}`);
      } else {
        await apiClient.post(`/favorites/${itemId}`);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Ошибка обновления избранного:", error);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`favorite-btn ${isFavorite ? "favorite" : ""}`}
      title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
    >
      {isFavorite ? "★" : "☆"}
    </button>
  );
};

export default FavoriteButton;
