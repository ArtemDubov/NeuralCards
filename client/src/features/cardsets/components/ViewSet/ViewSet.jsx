import React, { useState } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useIsCardFavorite } from "../../../../api/favorites";
import FavoriteButton from "../../../favorites/components/FavoriteButton/FavoriteButton";
import { useUIStore } from "../../../../shared/stores/uiStore";
import { useCardset } from "../../../../api/cardsets";
import { useDataStore } from "../../../../shared/stores/dataStore";

const ViewSet = ({ setActiveTab, onStartTraining }) => {
  const { t } = useAppStore();
  const ui = useUIStore();
  const { selectedSet } = useDataStore();
  const [showFavorites, setShowFavorites] = useState(false);

  const { data: displaySet, isLoading, isError } = useCardset(selectedSet?.id);
  const currentSet = displaySet || selectedSet;

  if (!currentSet) {
    return (
      <div className="nt-content__card">
        <p>{t("sets.not.selected") || "Набор не выбран"}</p>
        <button
          className="nt-btn nt-btn--secondary nt-util__mt-md"
          onClick={() => setActiveTab("sets")}
        >
          {t("sets.back")}
        </button>
      </div>
    );
  }

  const handleAddCard = () => {
    ui.openModal("addCard", { setId: currentSet.id });
  };

  const handleEditSet = () => {
    ui.openModal("editSet", currentSet);
  };

  const handleViewCard = (card) => {
    ui.openModal("viewCard", {
      ...card,
      cardsetId: currentSet.id,
    });
  };

  const handleEditCard = (card) => {
    ui.openModal("editCard", {
      ...card,
      setId: currentSet.id,
    });
  };

  const handleDeleteCard = (cardId) => {
    ui.openModal("deleteConfirmation", {
      type: "card",
      id: cardId,
      setId: currentSet.id,
      title: t("modal.delete.card.title"),
      message: t("modal.delete.card"),
    });
  };

  const getTagsArray = () => {
    if (!currentSet.tags) return [];
    if (Array.isArray(currentSet.tags)) {
      return currentSet.tags.map((tag) =>
        typeof tag === "string" ? tag : tag.name || tag
      );
    }
    if (typeof currentSet.tags === "string") {
      return currentSet.tags.split(",").map((tag) => tag.trim());
    }
    return [];
  };

  const tagsArray = getTagsArray();
  const cardsArray = Array.isArray(currentSet.cards) ? currentSet.cards : [];

  return (
    <div>
      <div className="nt-page__header">
        <h2 className="nt-page__title">{currentSet.title || "Без названия"}</h2>
        <div className="nt-page__header-controls">
          <span className="nt-util__bg-accent nt-util__text-primary nt-util__rounded-full nt-util__px-md nt-util__py-xs">
            {cardsArray.length} {t("sets.cards_count")}
            {showFavorites && " ⭐"}
          </span>

          {/* Кнопка редактирования набора - ДОБАВЛЕНО */}
          <button
            className="nt-btn nt-btn--secondary"
            onClick={handleEditSet}
            title={t("sets.edit")}
          >
            ✏️ {t("sets.edit")}
          </button>

          <button
            className={`nt-btn nt-btn--gold ${
              showFavorites ? "nt-btn--active" : ""
            }`}
            onClick={() => setShowFavorites(!showFavorites)}
            title={
              showFavorites ? t("sets.show.all") : t("sets.show.favorites")
            }
          >
            {showFavorites
              ? t("sets.show.all.cards")
              : t("sets.show.favorites.cards")}
          </button>

          {cardsArray.length > 0 && (
            <button
              className="nt-btn nt-btn--primary"
              onClick={() => onStartTraining(currentSet)}
              title={t("training.start.tooltip")}
            >
              🎯 {t("training.start")}
            </button>
          )}

          <button className="nt-btn nt-btn--success" onClick={handleAddCard}>
            {t("sets.add.card")}
          </button>

          <button
            className="nt-btn nt-btn--secondary"
            onClick={() => setActiveTab("sets")}
          >
            {t("sets.back")}
          </button>
        </div>
      </div>

      {tagsArray.length > 0 && (
        <div className="nt-util__mb-lg">
          <div className="nt-card__tags">
            {tagsArray.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="nt-cards-grid">
        {cardsArray.length > 0 ? (
          cardsArray.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              showFavorites={showFavorites}
              handleViewCard={handleViewCard}
              handleDeleteCard={handleDeleteCard}
              handleEditCard={handleEditCard}
              t={t}
            />
          ))
        ) : (
          <div className="nt-util__empty-state">
            <div className="nt-util__empty-icon">🃏</div>
            <h3 className="nt-util__empty-title">
              {showFavorites
                ? t("sets.no.favorites.cards")
                : t("sets.cards.empty")}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

const CardItem = ({
  card,
  showFavorites,
  handleViewCard,
  handleDeleteCard,
  handleEditCard,
  t,
}) => {
  const isFavorite = useIsCardFavorite(card.id);

  if (showFavorites && !isFavorite) return null;

  return (
    <div
      className={`nt-card nt-card--preview ${
        isFavorite ? "nt-card--favorite" : ""
      }`}
    >
      <div
        className="nt-card__content"
        onClick={() => handleViewCard(card)}
        style={{ cursor: "pointer" }}
      >
        <div className="nt-card__body">
          <div className="nt-card__title" title={card.front || ""}>
            {card.front || ""}
          </div>
          <p className="nt-card__text" title={card.back || ""}>
            {card.back || ""}
          </p>
          <div className="nt-card__tags">
            {card.imageUrl && <span className="tag">🖼️</span>}
            {card.audioUrl && <span className="tag">🎵</span>}
          </div>
        </div>
      </div>

      <div className="nt-card__actions">
        <div className="nt-card__actions--top">
          <FavoriteButton itemId={card.id} itemType="card" />
          <button
            className="nt-btn nt-btn--danger nt-btn--icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCard(card.id);
            }}
            title={t("sets.delete")}
          >
            ✕
          </button>
        </div>
        <button
          className="nt-btn nt-btn--secondary nt-btn--icon"
          onClick={(e) => {
            e.stopPropagation();
            handleEditCard(card);
          }}
          title={t("sets.edit")}
        >
          ✏️
        </button>
      </div>
    </div>
  );
};

export default ViewSet;
