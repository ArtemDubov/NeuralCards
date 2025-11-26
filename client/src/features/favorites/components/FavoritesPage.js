import React, { useState, useEffect } from "react";
import apiClient from "../../../api-client";
import FavoriteButton from "./FavoriteButton/FavoriteButton";
import { useLanguage } from "../../../contexts/LanguageContext";

const FavoritesPage = () => {
  const { t } = useLanguage();
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
    <div className="favorites-container">
      <div className="favorites-header">
        <h2>⭐ {t("favorites.title")}</h2>
        <div className="favorites-count">
          {t("favorites.count").replace("{count}", favorites.length)}
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <div className="empty-icon">⭐</div>
          <h3>{t("favorites.empty.title")}</h3>
          <p>{t("favorites.empty.message")}</p>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((fav) => (
            <div key={fav.id} className="cardset-item container-tp2">
              <div className="set-header">
                <div
                  className="set-content"
                  style={{ cursor: "default", flex: 1 }}
                >
                  <h3>{fav.cardSet?.title || t("sets.unknown")}</h3>
                  <span className="cards-count">
                    {fav.cardSet?.cards?.length || 0} {t("sets.cards_count")}
                  </span>
                </div>
                <div className="set-actions">
                  <FavoriteButton
                    itemId={fav.cardsetId}
                    itemType="cardset"
                    onUpdate={async () => {
                      try {
                        await apiClient.delete(`/favorites/${fav.cardsetId}`);
                        setFavorites((prev) =>
                          prev.filter((f) => f.cardsetId !== fav.cardsetId)
                        );
                      } catch (error) {
                        console.error("Ошибка удаления из избранного:", error);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
