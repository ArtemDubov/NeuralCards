import React, { useState, useEffect } from "react";
import apiClient from "../../../api-client";

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

  return (
    <div>
      <h2>⭐ Избранное</h2>
      {favorites.length === 0 ? (
        <p>У вас пока нет избранных наборов</p>
      ) : (
        <div className="sets-list">
          {favorites.map((fav) => (
            <div key={fav.id} className="set-card">
              <h3>{fav.cardSet?.title || "Неизвестный набор"}</h3>
              <p>{fav.cardSet?.description || "Описание отсутствует"}</p>
              <small>Карточек: {fav.cardSet?.cards?.length || 0}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
