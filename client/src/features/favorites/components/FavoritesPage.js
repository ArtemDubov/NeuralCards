import React, { useState } from "react";
import { useAllFavorites } from "../../../api/favorites";
import FavoriteButton from "./FavoriteButton/FavoriteButton";
import { useAppStore } from "../../../shared/stores/appStore";

const FavoritesPage = ({ handleViewCard, handleViewSet }) => {
  const { t } = useAppStore();
  const [activeTab, setActiveTab] = useState("sets");
  const { sets, cards, isLoading } = useAllFavorites();

  if (isLoading) {
    return (
      <div className="nt-page__container">
        <div className="nt-loader">{t("loading.progress")}</div>
      </div>
    );
  }

  // Функция для обработки клика на набор (если handleViewSet не передан)
  const handleSetClick = (setInfo) => {
    if (handleViewSet) {
      handleViewSet(setInfo);
    } else {
      // Вариант по умолчанию: открываем модальное окно или перенаправляем
      console.log("Открыть набор:", setInfo.title);
      // Можно открыть в модальном окне:
      // openSetModal(setInfo);

      // Или перейти на страницу набора:
      // window.location.href = `/#cardSets/${setInfo.id}`;
    }
  };

  return (
    <div className="nt-favorites__page">
      <div className="nt-page__header">
        <h2 className="nt-page__title">⭐ {t("favorites.title")}</h2>
        <div className="nt-favorites__header-tabs">
          <button
            className={`nt-btn ${
              activeTab === "sets"
                ? "nt-btn--active nt-btn--gold"
                : "nt-btn--secondary"
            }`}
            onClick={() => setActiveTab("sets")}
          >
            {t("favorites.sets.tab")} ({sets.length})
          </button>
          <button
            className={`nt-btn ${
              activeTab === "cards"
                ? "nt-btn--active nt-btn--gold"
                : "nt-btn--secondary"
            }`}
            onClick={() => setActiveTab("cards")}
          >
            {t("favorites.cards.tab")} ({cards.length})
          </button>
        </div>
      </div>

      <div className="nt-content__grid">
        {activeTab === "sets" ? (
          sets.length === 0 ? (
            <div className="nt-empty-state">
              <div className="nt-empty-state-icon">📚</div>
              <h3 className="nt-empty-state-title">
                {t("favorites.sets.empty.title")}
              </h3>
              <p className="nt-empty-state-text">
                {t("favorites.sets.empty.message")}
              </p>
            </div>
          ) : (
            <div className="nt-favorites__grid">
              {sets.map((fav) => {
                const setInfo = {
                  id: fav.cardSet?.id || fav.cardSetId,
                  title: fav.cardSet?.title || fav.title || t("sets.unknown"),
                  description:
                    fav.cardSet?.description || fav.description || "",
                  cards: fav.cardSet?.cards || fav.cards || [],
                  author: fav.cardSet?.author || fav.author || null,
                  tags: fav.cardSet?.tags || fav.tags || [],
                  createdAt: fav.cardSet?.createdAt || fav.createdAt,
                };

                return (
                  <div
                    key={setInfo.id}
                    className="nt-card nt-card--set nt-card--favorite"
                    onClick={() => handleSetClick(setInfo)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="nt-card__header">
                      <div className="nt-card__content" style={{ flex: 1 }}>
                        <h3 className="nt-card__title">{setInfo.title}</h3>
                        <p className="nt-card__subtitle">
                          {setInfo.cards.length} {t("sets.cards_count")}
                        </p>
                        {setInfo.description && (
                          <p className="nt-card__text nt-util__line-clamp-2">
                            {setInfo.description}
                          </p>
                        )}
                        {setInfo.author && (
                          <p className="nt-card__text nt-card__text--small">
                            {t("favorites.author")}:{" "}
                            {setInfo.author.name ||
                              setInfo.author.email ||
                              t("favorites.author.unknown")}
                          </p>
                        )}
                      </div>
                      <div
                        className="nt-card__actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FavoriteButton
                          itemId={setInfo.id}
                          itemType="cardSet"
                        />
                      </div>
                    </div>

                    {setInfo.tags && setInfo.tags.length > 0 && (
                      <div className="nt-card__footer">
                        <div className="nt-card__tags">
                          {Array.isArray(setInfo.tags)
                            ? setInfo.tags
                                .slice(0, 3)
                                .map((tag, index) => {
                                  const tagName =
                                    typeof tag === "string" ? tag : tag.name;
                                  return tagName ? (
                                    <span key={index} className="tag">
                                      {tagName}
                                    </span>
                                  ) : null;
                                })
                                .filter(Boolean)
                            : null}
                          {setInfo.tags.length > 3 && (
                            <span className="tag">
                              +{setInfo.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : cards.length === 0 ? (
          <div className="nt-empty-state">
            <div className="nt-empty-state-icon">🃏</div>
            <h3 className="nt-empty-state-title">
              {t("favorites.cards.empty.title")}
            </h3>
            <p className="nt-empty-state-text">
              {t("favorites.cards.empty.message")}
            </p>
          </div>
        ) : (
          <div className="nt-cards-grid">
            {cards.map((fav) => {
              const cardInfo = {
                id: fav.card?.id || fav.cardId,
                front: fav.card?.front || fav.front || "",
                back: fav.card?.back || fav.back || "",
                imageUrl: fav.card?.imageUrl || fav.imageUrl,
                audioUrl: fav.card?.audioUrl || fav.audioUrl,
                cardSet: fav.card?.cardSet || fav.cardSet,
              };

              return (
                <div
                  key={cardInfo.id}
                  className="nt-card nt-card--preview nt-card--favorite"
                >
                  <div
                    className="nt-card__content"
                    onClick={() => handleViewCard(cardInfo)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="nt-card__body">
                      <div className="nt-card__title" title={cardInfo.front}>
                        {cardInfo.front}
                      </div>
                      <p className="nt-card__text" title={cardInfo.back}>
                        {cardInfo.back}
                      </p>
                      <div className="nt-card__tags">
                        {cardInfo.imageUrl && <span className="tag">🖼️</span>}
                        {cardInfo.audioUrl && <span className="tag">🎵</span>}
                      </div>
                    </div>
                  </div>

                  <div className="nt-card__actions">
                    <FavoriteButton itemId={cardInfo.id} itemType="card" />
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
