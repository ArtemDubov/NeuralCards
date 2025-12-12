import React, { useState, useEffect, useRef } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useIsCardFavorite } from "../../../../api/favorites";
import FavoriteButton from "../../../favorites/components/FavoriteButton/FavoriteButton";
import { useUIStore } from "../../../../shared/stores/uiStore";
import { useCardSet } from "../../../../api/cardSets";
import { useDataStore } from "../../../../shared/stores/dataStore";
import { useCardAnimations } from "../../../../hooks/useCardAnimations";

// Константа для отладки
const DEBUG_ANIMATIONS = true;

const log = (component, level, message, data = {}) => {
  if (!DEBUG_ANIMATIONS) return;

  const timestamp = new Date().toISOString().substr(11, 8);
  const prefix = `[${component} ${timestamp}]`;

  const logData = {
    ...data,
    level,
  };

  switch (level) {
    case "error":
      console.error(prefix, message, logData);
      break;
    case "warn":
      console.warn(prefix, message, logData);
      break;
    case "info":
      console.info(prefix, message, logData);
      break;
    default:
      console.log(prefix, message, logData);
  }
};

const ViewSet = ({ setActiveTab, onStartTraining }) => {
  const { t } = useAppStore();
  const ui = useUIStore();
  const { selectedSet } = useDataStore();
  const [showFavorites, setShowFavorites] = useState(false);

  // УБИРАЕМ локальное состояние newlyCreatedCardId - это источник проблемы 3
  const [newlyCreatedCardId, setNewlyCreatedCardId] = useState(null);

  const { data: displaySet, isLoading, isError } = useCardSet(selectedSet?.id);
  const currentSet = displaySet || selectedSet;

  log("ViewSet", "info", "Component rendered", {
    selectedSetId: selectedSet?.id,
    displaySetExists: !!displaySet,
    currentSetExists: !!currentSet,
  });

  // УБИРАЕМ useEffect для сброса ID - это вызывает лишние рендеры

  if (!currentSet) {
    log("ViewSet", "warn", "No current set available");
    return (
      <div className="nt-content__card">
        <p>{t("sets.not.selected")}</p>
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
    log("ViewSet", "info", "Opening add card modal", { setId: currentSet.id });
    ui.openModal("addCard", {
      setId: currentSet.id,
      onSuccess: (newCard) => {
        // Устанавливаем ID новой карточки для анимации
        if (newCard?.id) {
          log("ViewSet", "info", "New card added, setting ID for animation", {
            newCardId: newCard.id,
          });
          setNewlyCreatedCardId(newCard.id);

          // Автоматически сбрасываем через 2 секунды
          setTimeout(() => {
            setNewlyCreatedCardId(null);
          }, 2000);
        }
      },
    });
  };

  const handleEditSet = () => {
    log("ViewSet", "info", "Opening edit set modal", { setId: currentSet.id });
    ui.openModal("editSet", currentSet);
  };

  const handleViewCard = (card) => {
    log("ViewSet", "info", "Opening view card modal", { cardId: card.id });
    ui.openModal("viewCard", {
      ...card,
      cardSetId: currentSet.id,
    });
  };

  const handleEditCard = (card) => {
    log("ViewSet", "info", "Opening edit card modal", { cardId: card.id });
    ui.openModal("editCard", {
      ...card,
      setId: currentSet.id,
    });
  };

  const handleDeleteCard = (cardId) => {
    log("ViewSet", "info", "Opening delete confirmation modal", { cardId });
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

  log("ViewSet", "debug", "Rendering set view", {
    cardsCount: cardsArray.length,
    tagsCount: tagsArray.length,
    showFavorites,
  });

  return (
    <div>
      <div className="nt-page__header">
        <h2 className="nt-page__title">
          {currentSet.title || t("sets.no.title")}
        </h2>
        <div className="nt-page__header-controls">
          <span className="nt-set-view__card-count">
            {cardsArray.length} {t("sets.cards_count")}
            {showFavorites && " ⭐"}
          </span>

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
              // Передаем только один источник триггера - пропс из ViewSet
              isNew={newlyCreatedCardId === card.id}
            />
          ))
        ) : (
          <div className="nt-empty-state">
            <div className="nt-empty-state__icon">🃏</div>
            <h3 className="nt-empty-state__title">
              {showFavorites
                ? t("sets.no.favorites.cards")
                : t("sets.cards.empty")}
            </h3>
            {!showFavorites && (
              <p className="nt-empty-state__text">
                {t("sets.cards.empty.message") ||
                  "Добавьте карточки для изучения"}
              </p>
            )}
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
  isNew = false,
}) => {
  const isFavorite = useIsCardFavorite(card.id);
  const ui = useUIStore();
  const cardRef = useRef(null);

  // ИСПОЛЬЗУЕМ useCardAnimations вместо локальной логики
  const { animateCardCreation, isAnimationEnabled } = useCardAnimations();

  // Отслеживаем, была ли уже запущена анимация для этой карточки
  const hasAnimatedRef = useRef(false);

  log("CardItem", "debug", "Card item rendered", {
    cardId: card.id,
    isFavorite,
    showFavorites,
    isNew,
    isAnimationEnabled: isAnimationEnabled(),
    hasAnimated: hasAnimatedRef.current,
  });

  // Анимация создания новой карточки - ТОЛЬКО ЧЕРЕЗ animateCardCreation
  useEffect(() => {
    log("CardItem", "info", "useEffect for card animation check", {
      cardId: card.id,
      isNew,
      isAnimationEnabled: isAnimationEnabled(),
      hasAnimated: hasAnimatedRef.current,
    });

    // Запускаем анимацию только если:
    // 1. Карточка новая (isNew === true)
    // 2. Анимации включены
    // 3. Еще не анимировали эту карточку
    if (isNew && isAnimationEnabled() && !hasAnimatedRef.current) {
      log("CardItem", "info", "Starting card creation animation", {
        cardId: card.id,
      });

      hasAnimatedRef.current = true;

      // Используем централизованную функцию анимации
      animateCardCreation(card.id);
    }
  }, [isNew, animateCardCreation, isAnimationEnabled, card.id]);

  if (showFavorites && !isFavorite) {
    log("CardItem", "debug", "Card filtered out (not favorite)", {
      cardId: card.id,
    });
    return null;
  }

  // Измененный обработчик удаления карточки
  const handleDeleteClick = (e) => {
    e.stopPropagation();

    // Открываем модалку подтверждения
    ui.openModal("deleteConfirmation", {
      type: "card",
      id: card.id,
      title: t("modal.delete.card.title") || "Удаление карточки",
      message:
        t("modal.delete.card") ||
        "Вы уверены, что хотите удалить эту карточку?",
      // Дополнительные данные для анимации
      animationData: {
        elementId: `card-${card.id}`,
        action: "delete",
        elementType: "card",
      },
      // Передаем setId для карточки (нужен для API)
      setId: card.cardSetId || card.setId,
    });
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    log("CardItem", "info", "Card edit button clicked", { cardId: card.id });
    handleEditCard(card);
  };

  log("CardItem", "debug", "Rendering card item", { cardId: card.id });

  return (
    <div
      ref={cardRef}
      data-animation-id={`card-${card.id}`}
      className={`nt-card nt-card--preview ${
        isFavorite ? "nt-card--favorite" : ""
      } ${isAnimationEnabled() ? "premium-animation-wrapper" : ""}`}
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
            onClick={handleDeleteClick}
            title={t("sets.delete")}
          >
            ✕
          </button>
        </div>
        <button
          className="nt-btn nt-btn--secondary nt-btn--icon"
          onClick={handleEditClick}
          title={t("sets.edit")}
        >
          ✏️
        </button>
      </div>
    </div>
  );
};

export default ViewSet;
