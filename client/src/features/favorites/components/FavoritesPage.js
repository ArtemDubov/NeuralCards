import React, { useState, useEffect } from "react";
import apiClient from "../../../api-client";
import FavoriteButton from "./FavoriteButton/FavoriteButton";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await apiClient.get("/favorites");
      setFavorites(response.data);
    } catch (error) {
      console.error("Ошибка загрузки избранного:", error);
    }
  };

  const handleRemoveFavorite = async (cardsetId) => {
    try {
      await apiClient.delete(`/favorites/${cardsetId}`);
      loadFavorites(); // Перезагружаем список
    } catch (error) {
      console.error("Ошибка удаления из избранного:", error);
    }
  };

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h2>⭐ Избранное</h2>
        <div className="favorites-count">Наборов: {favorites.length}</div>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <div className="empty-icon">⭐</div>
          <h3>Пока пусто</h3>
          <p>Добавляйте наборы в избранное, чтобы быстро к ним возвращаться</p>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((fav) => (
            <div key={fav.id} className="favorite-card">
              <div className="favorite-card-header">
                <h3>{fav.cardSet?.title || "Неизвестный набор"}</h3>
                <div className="favorite-actions">
                  <FavoriteButton itemId={fav.cardsetId} itemType="cardset" />
                  <button
                    className="remove-favorite-btn"
                    onClick={() => handleRemoveFavorite(fav.cardsetId)}
                    title="Удалить из избранного"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p className="favorite-description">
                {fav.cardSet?.description || "Описание отсутствует"}
              </p>
              <div className="favorite-meta">
                <span className="cards-count">
                  📊 Карточек: {fav.cardSet?.cards?.length || 0}
                </span>
                <span className="favorite-date">
                  📅 Добавлено: {new Date(fav.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
