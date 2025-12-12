import React, { useEffect, useRef } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useIsSetFavorite } from "../../../../api/favorites";
import FavoriteButton from "../../../favorites/components/FavoriteButton/FavoriteButton";
import { useUIStore } from "../../../../shared/stores/uiStore";
import { useCardSetAnimations } from "../../../../hooks/useCardSetAnimations";

const CardSetList = ({
  cardSets,
  handleViewSet,
  newlyCreatedSetId = null,
  recentlyDeletedSetId = null,
}) => {
  const { t } = useAppStore();
  const { getCardSetCreateClasses } = useCardSetAnimations();

  return (
    <>
      {cardSets.map((set) => (
        <CardSetItem
          key={set.id}
          set={set}
          handleViewSet={handleViewSet}
          t={t}
          isNew={newlyCreatedSetId === set.id}
          isRecentlyDeleted={recentlyDeletedSetId === set.id}
        />
      ))}
    </>
  );
};

const CardSetItem = ({
  set: cardSet,
  handleViewSet,
  t,
  isNew = false,
  isRecentlyDeleted = false,
}) => {
  const isFavorite = useIsSetFavorite(cardSet.id);
  const ui = useUIStore();
  const cardRef = useRef(null);
  const { animateCardSetCreation, isAnimationEnabled } = useCardSetAnimations();
  const hasAnimatedRef = useRef(false);

  // Анимация создания
  useEffect(() => {
    if (isNew && isAnimationEnabled() && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
      animateCardSetCreation(cardSet.id);
    }
  }, [isNew, animateCardSetCreation, isAnimationEnabled, cardSet.id]);

  const handleDeleteClick = (e, setId, title) => {
    e.stopPropagation();

    ui.openModal("deleteConfirmation", {
      type: "set",
      id: setId,
      title: t("modal.delete.set.title") || "Удаление набора",
      message: `Вы уверены, что хотите удалить набор "${title}"?`,
      animationData: {
        elementId: `cardSet-${setId}`,
        action: "delete",
        elementType: "cardSet",
      },
    });
  };

  const getTagsArray = () => {
    if (!cardSet.tags) return [];
    if (Array.isArray(cardSet.tags)) {
      return cardSet.tags.map((tag) =>
        typeof tag === "string" ? tag : tag.name || tag
      );
    }
    if (typeof cardSet.tags === "string") {
      return cardSet.tags.split(",").map((tag) => tag.trim());
    }
    return [];
  };

  const tagsArray = getTagsArray();
  const MAX_VISIBLE_TAGS = 2;
  const visibleTags = tagsArray.slice(0, MAX_VISIBLE_TAGS);
  const remainingTags = tagsArray.length - MAX_VISIBLE_TAGS;

  return (
    <div
      ref={cardRef}
      data-animation-id={`cardSet-${cardSet.id}`}
      className={`nt-card nt-card--set ${
        isFavorite ? "nt-card--favorite" : ""
      } ${isAnimationEnabled() ? "premium-animation-wrapper" : ""} ${
        isNew ? "premium-animation--creating" : ""
      }`}
      onClick={() => handleViewSet(cardSet)}
      style={{
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        minHeight: "180px",
        position: "relative",
      }}
    >
      <div
        className="nt-card__content"
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        <h3 className="nt-card__title" style={{ marginBottom: "4px" }}>
          {cardSet.title}
          {isNew && (
            <span
              style={{ marginLeft: "8px", fontSize: "0.8em", color: "#4CAF50" }}
            >
              🆕
            </span>
          )}
        </h3>

        <div className="nt-card__footer" style={{ marginTop: "auto" }}>
          {tagsArray.length > 0 && (
            <div
              className="nt-card__tags"
              style={{
                marginBottom: "12px",
                maxHeight: "28px",
                overflow: "hidden",
              }}
            >
              {visibleTags.map((tag, index) => (
                <span
                  key={index}
                  className="tag"
                  style={{
                    fontSize: "0.75rem",
                    padding: "3px 8px",
                    marginRight: "4px",
                    maxWidth: "80px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                  }}
                  title={tag}
                >
                  {tag.length > 12 ? tag.substring(0, 10) + "..." : tag}
                </span>
              ))}

              {remainingTags > 0 && (
                <span
                  className="tag"
                  style={{
                    fontSize: "0.75rem",
                    padding: "3px 8px",
                    backgroundColor: "rgba(128, 128, 128, 0.1)",
                    cursor: "pointer",
                  }}
                  title={tagsArray.slice(MAX_VISIBLE_TAGS).join(", ")}
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(t("tags.all", { tags: tagsArray.join(", ") }));
                  }}
                >
                  +{remainingTags}
                </span>
              )}
            </div>
          )}

          <div className="nt-card__footer-info">
            <span className="nt-card__subtitle">
              {(cardSet.cards && cardSet.cards.length) || 0}{" "}
              {t("sets.cards_count")}
            </span>
            {cardSet.createdAt && (
              <span className="nt-card__text">
                {new Date(cardSet.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="nt-card__actions" onClick={(e) => e.stopPropagation()}>
        <div className="nt-card__actions--top">
          <FavoriteButton itemId={cardSet.id} itemType="cardSet" />

          <button
            className="nt-btn nt-btn--danger nt-btn--icon"
            onClick={(e) => handleDeleteClick(e, cardSet.id, cardSet.title)}
            title={t("sets.delete")}
          >
            ✕
          </button>
        </div>

        <button
          className="nt-btn nt-btn--secondary nt-btn--icon"
          onClick={(e) => {
            e.stopPropagation();
            ui.openModal("editSet", cardSet);
          }}
          title={t("sets.edit")}
        >
          ✏️
        </button>
      </div>
    </div>
  );
};

export default CardSetList;
