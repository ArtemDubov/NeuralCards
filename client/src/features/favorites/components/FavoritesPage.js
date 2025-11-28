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
        "Без вопроса",
      answer:
        fav.card?.back ||
        fav.back ||
        fav.card?.answer ||
        fav.answer ||
        "Без ответа",
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
    return <div className="favorites-container">Загрузка...</div>;
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h2>⭐ {t("favorites.title")}</h2>
        <div className="favorites-tabs">
          <button
            className={`btn-tp5 ${activeTab === "sets" ? "active" : ""}`}
            onClick={() => setActiveTab("sets")}
          >
            Наборы ({favoriteSets.length})
          </button>
          <button
            className={`btn-tp5 ${activeTab === "cards" ? "active" : ""}`}
            onClick={() => setActiveTab("cards")}
          >
            Карточки ({favoriteCards.length})
          </button>
        </div>
      </div>

      {activeTab === "sets" ? (
        favoriteSets.length === 0 ? (
          <div className="empty-favorites">
            <div className="empty-icon">📚</div>
            <h3>Нет избранных наборов</h3>
            <p>Добавьте наборы в избранное, чтобы легко находить их позже</p>
          </div>
        ) : (
          <div className="favorites-grid">
            {favoriteSets.map((fav) => {
              const setInfo = getSetInfo(fav);
              return (
                <div key={setInfo.id} className="cardset-item container-tp2">
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
                          Автор:{" "}
                          {setInfo.author.name ||
                            setInfo.author.email ||
                            "Неизвестен"}
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
        <div className="empty-favorites">
          <div className="empty-icon">🃏</div>
          <h3>Нет избранных карточек</h3>
          <p>Добавьте карточки в избранное для быстрого доступа</p>
        </div>
      ) : (
        <div className="favorites-cards-grid cards-grid">
          {favoriteCards.map((fav) => {
            const cardInfo = getCardInfo(fav);
            return (
              <div key={cardInfo.id} className="card-preview container-tp4">
                <div
                  className="card-preview-content"
                  onClick={() => handleViewCard(cardInfo)} // Оставляем просмотр
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

                {/* ТОЛЬКО кнопка избранного */}
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
  );
};

export default FavoritesPage;
