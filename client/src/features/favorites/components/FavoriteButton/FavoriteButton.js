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

  const favoriteBtnStyle = {
    width: "24px",
    height: "24px",
    padding: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "4px",
    background: "none",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

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
      style={favoriteBtnStyle}
    >
      <StarIcon filled={isFavorite} />
    </button>
  );
};

export default FavoriteButton;
