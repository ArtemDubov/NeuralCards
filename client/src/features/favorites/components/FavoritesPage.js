import React, { useState, useEffect, useCallback } from "react";
import apiClient from "../../../api-client";
import FavoriteButton from "./FavoriteButton/FavoriteButton";
import { useLanguage } from "../../../contexts/LanguageContext";

const FavoritesPage = ({ handleViewCard }) => {
  const { t } = useLanguage();
  const [favoriteSets, setFavoriteSets] = useState([]);
  const [favoriteCards, setFavoriteCards] = useState([]);
  const [activeTab, setActiveTab] = useState("sets");
  const [loading, setLoading] = useState(true);

  console.log("=== FAVORITES PAGE RENDER ===");
  console.log("favoriteSets:", favoriteSets);
  console.log("favoriteCards:", favoriteCards);
  console.log("activeTab:", activeTab);
  console.log("loading:", loading);

  // Используем useCallback для мемоизации функции
  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      console.log("📥 [FavoritesPage] Загрузка избранного...");

      // Загружаем избранные наборы и карточки параллельно
      const [setsResponse, cardsResponse] = await Promise.all([
        apiClient.get("/api/favorites"),
        apiClient.get("/api/favorites/cards"),
      ]);

      console.log("📦 [FavoritesPage] Избранные наборы:", setsResponse.data);
      console.log("📦 [FavoritesPage] Избранные карточки:", cardsResponse.data);

      setFavoriteSets(setsResponse.data);
      setFavoriteCards(cardsResponse.data);
    } catch (error) {
      console.error("❌ [FavoritesPage] Ошибка загрузки избранного:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Загружаем данные при монтировании
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Добавляем обработчик событий для обновления при изменениях извне
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      console.log("🔄 [FavoritesPage] Получен сигнал обновления избранного");
      loadFavorites();
    };

    // Слушаем кастомные события от FavoriteButton
    window.addEventListener("favoritesUpdated", handleFavoritesUpdate);

    return () => {
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdate);
    };
  }, [loadFavorites]);

  // Функция для получения информации о карточке
  const getCardInfo = (fav) => {
    return {
      id: fav.cardId || fav.id,
      question:
        fav.card?.front ||
        fav.front ||
        fav.card?.question ||
        fav.question ||
        t("cards.front.empty"),
      answer:
        fav.card?.back ||
        fav.back ||
        fav.card?.answer ||
        fav.answer ||
        t("cards.back.empty"),
      cardset: fav.card?.cardset || fav.cardset || null,
      imageUrl: fav.card?.imageUrl || fav.imageUrl || null,
      audioUrl: fav.card?.audioUrl || fav.audioUrl || null,
      backImageUrl: fav.card?.backImageUrl || fav.backImageUrl || null,
      backAudioUrl: fav.card?.backAudioUrl || fav.backAudioUrl || null,
    };
  };

  // Функция для получения информации о наборе
  const getSetInfo = (fav) => {
    return {
      id: fav.cardsetId || fav.id,
      title: fav.cardSet?.title || fav.title || t("sets.unknown"),
      cards: fav.cardSet?.cards || fav.cards || [],
      author: fav.cardSet?.author || fav.author || null,
    };
  };

  if (loading) {
    return (
      <div className="page-container favorites-page">
        <div className="loading">{t("loading.progress")}</div>
      </div>
    );
  }

  return (
    <div className="page-container favorites-page">
      <div className="page-header">
        <h2>⭐ {t("favorites.title")}</h2>
        <div className="favorites-count">
          {activeTab === "sets" ? favoriteSets.length : favoriteCards.length}{" "}
          {activeTab === "sets"
            ? t("favorites.sets.count")
            : t("favorites.cards.count")}
        </div>
      </div>

      <div className="content-card">
        <div className="favorites-tabs">
          <button
            className={`btn-tp5 ${activeTab === "sets" ? "active" : ""}`}
            onClick={() => setActiveTab("sets")}
          >
            {t("favorites.sets.tab")} ({favoriteSets.length})
          </button>
          <button
            className={`btn-tp5 ${activeTab === "cards" ? "active" : ""}`}
            onClick={() => setActiveTab("cards")}
          >
            {t("favorites.cards.tab")} ({favoriteCards.length})
          </button>
        </div>

        {activeTab === "sets" ? (
          favoriteSets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>{t("favorites.sets.empty.title")}</h3>
              <p>{t("favorites.sets.empty.message")}</p>
            </div>
          ) : (
            <div className="sets-grid">
              {favoriteSets.map((fav) => {
                const setInfo = getSetInfo(fav);
                return (
                  <div key={setInfo.id} className="cardset-item favorite">
                    <div className="set-header">
                      <div
                        className="set-content"
                        style={{ cursor: "default", flex: 1 }}
                      >
                        <h3>{setInfo.title}</h3>
                        <span className="cards-count">
                          {setInfo.cards.length} {t("sets.cards_count")}
                        </span>
                        {setInfo.author && (
                          <span className="set-author">
                            {t("favorites.author")}:{" "}
                            {setInfo.author.name ||
                              setInfo.author.email ||
                              t("favorites.author.unknown")}
                          </span>
                        )}
                      </div>
                      <div className="set-actions">
                        <FavoriteButton
                          itemId={setInfo.id}
                          itemType="cardset"
                          onUpdate={loadFavorites}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : favoriteCards.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🃏</div>
            <h3>{t("favorites.cards.empty.title")}</h3>
            <p>{t("favorites.cards.empty.message")}</p>
          </div>
        ) : (
          <div className="cards-grid">
            {favoriteCards.map((fav) => {
              const cardInfo = getCardInfo(fav);
              return (
                <div key={cardInfo.id} className="card-preview">
                  <div
                    className="card-preview-content"
                    onClick={() => handleViewCard(cardInfo)}
                  >
                    <div className="card-preview-front">
                      <div className="card-text" title={cardInfo.question}>
                        {cardInfo.question}
                      </div>
                      <div className="card-media-indicators">
                        {cardInfo.imageUrl && (
                          <span className="media-indicator">🖼️</span>
                        )}
                        {cardInfo.audioUrl && (
                          <span className="media-indicator">🎵</span>
                        )}
                      </div>
                    </div>
                    <div className="card-preview-back">
                      <div className="card-text" title={cardInfo.answer}>
                        {cardInfo.answer}
                      </div>
                      <div className="card-media-indicators">
                        {cardInfo.backImageUrl && (
                          <span className="media-indicator">🖼️</span>
                        )}
                        {cardInfo.backAudioUrl && (
                          <span className="media-indicator">🎵</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <FavoriteButton
                      itemId={cardInfo.id}
                      itemType="card"
                      onUpdate={loadFavorites}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
