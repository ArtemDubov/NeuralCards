import React, { useEffect } from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { useFavorites } from "../../../../contexts/FavoritesContext";
import FavoriteButton from "../../../favorites/components/FavoriteButton/FavoriteButton";

const CardsetList = ({ cardsets, handleViewSet, showDeleteModal }) => {
  const { t } = useLanguage();
  const { isSetFavorite } = useFavorites();

  // Слушаем события обновления избранного для перерисовки
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      // Компонент автоматически перерисуется благодаря контексту
      console.log("🔄 [CardsetList] Получен сигнал обновления избранного");
    };

    window.addEventListener("favoritesUpdated", handleFavoritesUpdate);
    return () => {
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdate);
    };
  }, []);

  if (cardsets.length === 0) {
    return <p className="empty-state">{t("sets.empty")}</p>;
  }

  return (
    <div className="sets-grid">
      {cardsets.map((set) => {
        const tagsArray = set.tags
          ? Array.isArray(set.tags)
            ? set.tags.map((tag) => (typeof tag === "string" ? tag : tag.name))
            : typeof set.tags === "string"
            ? set.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag)
            : []
          : [];

        // Используем контекст вместо set.isFavorite
        const isFavorite = isSetFavorite(set.id);

        console.log("Set:", set.id, "isFavorite:", isFavorite);

        return (
          <div
            key={set.id}
            className={`cardset-item container-tp2 ${
              isFavorite ? "favorite" : ""
            }`}
          >
            <div className="set-header">
              <div
                className="set-content"
                onClick={() => handleViewSet(set)}
                style={{
                  cursor: "pointer",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <h3>
                  {set.title}
                  {isFavorite && <span style={{ marginLeft: "8px" }}>⭐</span>}
                </h3>
                <span className="cards-count">
                  {set.cards ? set.cards.length : 0} {t("sets.cards_count")}
                </span>
              </div>
              <div className="set-actions">
                <FavoriteButton itemId={set.id} itemType="cardset" />
                <button
                  className="btn-tp4"
                  onClick={(e) => {
                    e.stopPropagation();
                    showDeleteModal(set.id, set.title);
                  }}
                  title={t("sets.delete")}
                >
                  ✕
                </button>
              </div>
            </div>

            {tagsArray.length > 0 && (
              <div className="set-tags">
                {tagsArray.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CardsetList;
