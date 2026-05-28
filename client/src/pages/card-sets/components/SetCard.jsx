import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faStar, faPen, faTrash, faCopy, faCheck } from "../../../utils/icons";
import TagsOverflow from "../../../components/common/TagsOverflow";
import DescriptionOverflow from "../../../components/common/DescriptionOverflow";

/**
 * Set Card Component - displays a card set with actions
 */
const SetCard = React.memo(function SetCard({
  set,
  isMySet = false,
  isOfficial = false,
  favoriteIds,
  trainingLoading,
  selectedSetId,
  onStartTraining,
  onToggleFavorite,
  onEdit,
  onDelete,
  onCopy,
  currentTheme,
}) {
  const cardsCount = set.cards_count ?? set.cards?.length ?? 0;
  const isFav = favoriteIds.has(set.id);

  return (
    <div className="nt-set-card" style={{ background: currentTheme.surface }}>
      {/* Actions for my sets */}
      {isMySet && (
        <div className="nt-set-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartTraining(set.id);
            }}
            className="nt-set-action-btn nt-set-action-btn-primary"
            disabled={trainingLoading && selectedSetId === set.id}
          >
            <FontAwesomeIcon icon={faPlay} /> Тренировка
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(set.id);
            }}
            className="nt-set-action-btn nt-set-action-btn-secondary"
            title={isFav ? "Убрать из избранного" : "В избранное"}
            style={{ color: isFav ? "var(--nt-warning)" : undefined }}
          >
            <FontAwesomeIcon icon={faStar} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(set);
            }}
            className="nt-set-action-btn nt-set-action-btn-secondary"
            title="Редактировать"
          >
            <FontAwesomeIcon icon={faPen} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(set.id);
            }}
            className="nt-set-action-btn nt-set-action-btn-secondary"
            style={{ color: currentTheme.error }}
            title="Удалить"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      )}

      {/* Official badge */}
      {isOfficial && (
        <div className="nt-official-badge" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          padding: "3px 10px",
          borderRadius: "6px",
          background: `var(--nt-primary-light)`,
          color: "var(--nt-primary)",
          fontSize: "12px",
          fontWeight: 600,
          marginBottom: "8px",
        }}>
          <FontAwesomeIcon icon={faCheck} style={{ fontSize: "11px" }} />
          От разработчиков
        </div>
      )}

      {/* Clickable area */}
      <Link
        to={`/card-sets/${set.id}`}
        className="card-set-card-link"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="nt-set-title" style={{ color: currentTheme.text, margin: "0 0 6px 0" }}>
          {set.title}
        </h3>
        {set.description ? (
          <DescriptionOverflow
            text={set.description}
            maxLength={80}
            currentTheme={currentTheme}
          />
        ) : (
          <p className="nt-set-no-description" style={{
            color: currentTheme.textSecondary,
            fontSize: "14px",
            margin: "0 0 6px 0",
          }}>
            Нет описания
          </p>
        )}
        <p className="nt-set-meta" style={{ 
          fontSize: "13px", 
          color: currentTheme.textMuted,
          margin: "0 0 6px 0"
        }}>
          {cardsCount} карточек
          {!isMySet && !isOfficial && set.author_name && ` • ${set.author_name}`}
        </p>
      </Link>

      {/* Tags */}
      {set.tags && set.tags.length > 0 && (
        <TagsOverflow
          tags={set.tags.map((t) => t.name)}
          maxVisible={3}
          currentTheme={currentTheme}
        />
      )}

      {/* Actions for public/official sets */}
      {!isMySet && (
        <div className="nt-set-public-actions" style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(set.id);
            }}
            className="nt-set-action-btn nt-set-action-btn-secondary"
            title={isFav ? "Убрать из избранного" : "В избранное"}
            style={{ color: isFav ? "var(--nt-warning)" : undefined }}
          >
            <FontAwesomeIcon icon={faStar} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy(set.id);
            }}
            className="nt-set-action-btn nt-set-action-btn-secondary"
            title="Копировать набор к себе"
          >
            <FontAwesomeIcon icon={faCopy} /> Копировать
          </button>
        </div>
      )}
    </div>
  );
});

export default SetCard;
