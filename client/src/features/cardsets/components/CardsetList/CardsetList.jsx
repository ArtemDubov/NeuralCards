import React from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useIsSetFavorite } from "../../../../api/favorites";
import FavoriteButton from "../../../favorites/components/FavoriteButton/FavoriteButton";
import { useUIStore } from "../../../../shared/stores/uiStore";

const CardsetList = ({ cardsets, handleViewSet, showDeleteModal }) => {
  const { t } = useAppStore();

  return (
    <>
      {cardsets.map((set) => (
        <CardsetItem
          key={set.id}
          set={set}
          handleViewSet={handleViewSet}
          showDeleteModal={showDeleteModal}
          t={t}
        />
      ))}
    </>
  );
};

const CardsetItem = ({ set: cardSet, handleViewSet, showDeleteModal, t }) => {
  const isFavorite = useIsSetFavorite(cardSet.id);
  const ui = useUIStore();

  // Получаем теги (аналогично ViewSet.jsx)
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
      className={`nt-card nt-card--set ${
        isFavorite ? "nt-card--favorite" : ""
      }`}
      onClick={() => handleViewSet(cardSet)}
      style={{
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        minHeight: "180px",
      }}
    >
      <div
        className="nt-card__content"
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        {/* Заголовок */}
        <h3 className="nt-card__title" style={{ marginBottom: "4px" }}>
          {cardSet.title}
        </h3>

        {/* === ТЕГИ С ОТСТУПОМ === */}
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
                  alert(`Все теги: ${tagsArray.join(", ")}`);
                }}
              >
                +{remainingTags}
              </span>
            )}
          </div>
        )}

        {/* Футер прижимаем вниз */}
        <div className="nt-card__footer" style={{ marginTop: "auto" }}>
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

      {/* Кнопки справа */}
      <div className="nt-card__actions" onClick={(e) => e.stopPropagation()}>
        <div className="nt-card__actions--top">
          <FavoriteButton itemId={cardSet.id} itemType="cardset" />

          <button
            className="nt-btn nt-btn--danger nt-btn--icon"
            onClick={(e) => {
              e.stopPropagation();
              showDeleteModal(cardSet.id, cardSet.title);
            }}
            title={t("sets.delete")}
          >
            ✕
          </button>
        </div>

        {/* Кнопка редактирования - ОБНОВЛЕНО */}
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

export default CardsetList;
