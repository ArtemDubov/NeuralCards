import React, { useState, useEffect } from "react";
import apiClient from "../../../../api-client";
import StarIcon from "../../../shared/components/StarIcon";

const FavoriteButton = ({ itemId, itemType = "cardset", onUpdate }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // Проверяем при загрузке, в избранном ли элемент
  useEffect(() => {
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

    checkFavoriteStatus();
  }, [itemId]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await apiClient.delete(`/favorites/${itemId}`);
      } else {
        await apiClient.post(`/favorites/${itemId}`);
      }
      setIsFavorite(!isFavorite);
      onUpdate?.();
    } catch (error) {
      console.error("Ошибка обновления избранного:", error);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`favorite-btn ${isFavorite ? "favorite" : ""}`}
      title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
      style={{
        background: "none",
        border: "none",
        padding: "5px",
        cursor: "pointer",
      }}
    >
      <StarIcon filled={isFavorite} />
    </button>
  );
};

export default FavoriteButton;
