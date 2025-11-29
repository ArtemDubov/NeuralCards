import React, { useState, useEffect } from "react";
import { useFavorites } from "../../../../contexts/FavoritesContext";
import StarIcon from "../../../shared/components/StarIcon";
import { useLanguage } from "../../../../contexts/LanguageContext";

const FavoriteButton = ({ itemId, itemType = "cardset", onUpdate }) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const {
    isSetFavorite,
    isCardFavorite,
    toggleFavoriteSet,
    toggleFavoriteCard,
    loadFavorites,
  } = useFavorites();

  // Определяем текущий статус избранного из контекста
  const isFavorite =
    itemType === "cardset" ? isSetFavorite(itemId) : isCardFavorite(itemId);

  const toggleFavorite = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      console.log(`🔄 [FavoriteButton] Переключение ${itemType} ${itemId}`);

      if (itemType === "cardset") {
        await toggleFavoriteSet(itemId);
      } else if (itemType === "card") {
        await toggleFavoriteCard(itemId);
      }

      // Вызываем колбэк после успешного обновления
      onUpdate?.();

      console.log("✅ [FavoriteButton] Обновление завершено");
    } catch (error) {
      console.error("❌ [FavoriteButton] Ошибка обновления избранного:", error);

      // Перезагружаем состояние в случае ошибки
      await loadFavorites();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`favorite-btn ${isFavorite ? "favorite" : ""}`}
      title={isFavorite ? t("favorites.remove") : t("favorites.add")}
      disabled={isLoading}
      style={{
        background: "none",
        border: "none",
        padding: "5px",
        cursor: isLoading ? "not-allowed" : "pointer",
        borderRadius: "4px",
        transition: "all 0.2s ease",
        opacity: isLoading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.target.style.background = "rgba(255, 215, 0, 0.1)";
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.background = "none";
      }}
    >
      <StarIcon filled={isFavorite} />
    </button>
  );
};

export default FavoriteButton;
