import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faPen,
  faTrash,
  faImage,
  faVolumeHigh,
  faVideo,
  faGripVertical,
} from "../../utils/icons";

/**
 * SortableCard — обёртка карточки с dnd-kit useSortable.
 *
 * Hover-анимации: при наведении карточка приподнимается и тень усиливается.
 * При активном drag — hover отключён, чтобы не было конфликта.
 * Кнопки действий — горизонтальная строка.
 */
export default function SortableCard({
  card,
  displayIndex,
  currentTheme,
  showContent,
  favoriteCardIds,
  onClick,
  onToggleFavorite,
  onEdit,
  onDelete,
  FrontMediaPreview,
  BackMediaPreview,
}) {
  const [hovered, setHovered] = useState(false);
  const isDraggingRef = React.useRef(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
  } = useSortable({
    id: card.id,
    transition: {
      duration: 200,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  // Отслеживаем состояние drag через ref для синхронного доступа
  React.useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  // Hover НЕ активен во время drag
  const isHoverActive = hovered && !isDragging && !isSorting;

  const style = {
    transform: CSS.Transform.toString(transform),
    // Drag: transition от dnd-kit
    // Drop (transform == null): мгновенно, без transition
    transition:
      transform != null
        ? transition || "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)"
        : "none",
    // Ghost при drag: полупрозрачный
    opacity: isDragging ? 0.3 : isSorting ? 0.7 : 1,
    zIndex: isDragging ? 100 : 1,
    cursor: "grab",
    // Hover подъём — только когда НЕ drag и НЕ сдвинута
    ...(isHoverActive && transform == null
      ? {
          transform: "translateY(-2px)",
          boxShadow: `0 6px 20px ${currentTheme.cardShadow || "rgba(0,0,0,0.15)"}`,
          borderColor: `${currentTheme.primary}40`,
          transition:
            "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        }
      : {}),
  };

  return (
    <div
      ref={setNodeRef}
      className="sortable-card-container"
      style={{
        ...styles.card,
        ...style,
        background: currentTheme.surface,
        boxShadow: isDragging
          ? `0 2px 8px ${currentTheme.cardShadow}`
          : isHoverActive
            ? `0 6px 20px ${currentTheme.cardShadow || "rgba(0,0,0,0.15)"}`
            : `0 2px 8px ${currentTheme.cardShadow}`,
        border: `2px solid ${isDragging ? currentTheme.border || "#e0e0e0" : isHoverActive ? `${currentTheme.primary}40` : currentTheme.border || "#e0e0e0"}`,
      }}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        // Блокируем клик только если реально идёт drag или sorting
        if (isDraggingRef.current || isDragging || isSorting) {
          e.stopPropagation();
          return;
        }
        // Проверяем, что клик не по кнопкам действий и не по drag handle
        if (e.target.tagName === "BUTTON" || e.target.closest("button") || e.target.closest(".drag-handle")) {
          return;
        }
        onClick();
      }}
    >
      {/* Drag Handle - иконка перетаскивания */}
      {!isDragging && !isSorting && (
        <div 
          className="drag-handle"
          style={{
            position: "absolute",
            left: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            opacity: 0.4,
            transition: "opacity 0.2s",
            zIndex: 10,
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "0.4"}
        >
          <FontAwesomeIcon 
            icon={faGripVertical} 
            style={{ 
              color: currentTheme.textSecondary,
              fontSize: "16px"
            }} 
          />
        </div>
      )}

      {/* Номер карточки */}
      <div
        style={{
          ...styles.cardNumber,
          background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
          marginLeft: "28px", // Сдвигаем номер правее чтобы освободить место для drag handle
        }}
      >
        {displayIndex}
      </div>

      {/* Контент: две колонки */}
      <div className="card-set-card-two-columns">
        {/* Лицевая сторона — ЛЕВАЯ колонка */}
        <div className="card-set-card-column">
          <div className="card-set-column-header">
            <span
              style={{
                ...styles.sideDot,
                background: currentTheme.primary,
              }}
            />
            <span className="card-set-column-title">Лицевая</span>
          </div>
          <div className="card-set-card-text-with-badges">
            <div
              style={{
                ...styles.cardSideText,
                color: currentTheme.text,
              }}
            >
              {card.front}
            </div>
            {!showContent && (
              <div className="card-set-media-badges">
                {card.front_image && (
                  <span className="card-set-compact-media-item">
                    <FontAwesomeIcon
                      icon={faImage}
                      className="card-set-compact-media-icon"
                    />
                  </span>
                )}
                {card.front_audio && (
                  <span className="card-set-compact-media-item">
                    <FontAwesomeIcon
                      icon={faVolumeHigh}
                      className="card-set-compact-media-icon"
                    />
                  </span>
                )}
                {card.front_video && (
                  <span className="card-set-compact-media-item">
                    <FontAwesomeIcon
                      icon={faVideo}
                      className="card-set-compact-media-icon"
                    />
                  </span>
                )}
              </div>
            )}
          </div>
          {showContent && FrontMediaPreview && (
            <FrontMediaPreview
              image={card.front_image}
              audio={card.front_audio}
              video={card.front_video}
              currentTheme={currentTheme}
            />
          )}
        </div>

        {/* Разделитель */}
        <div className="card-set-card-column-divider" />

        {/* Обратная сторона — ПРАВАЯ колонка */}
        <div className="card-set-card-column">
          <div className="card-set-column-header">
            <span
              style={{
                ...styles.sideDot,
                background: currentTheme.success,
              }}
            />
            <span className="card-set-column-title">Обратная</span>
          </div>
          <div className="card-set-card-text-with-badges">
            <div
              style={{
                ...styles.cardSideText,
                color: currentTheme.success,
              }}
            >
              {card.back}
            </div>
            {!showContent && (
              <div className="card-set-media-badges">
                {card.back_image && (
                  <span className="card-set-compact-media-item">
                    <FontAwesomeIcon
                      icon={faImage}
                      className="card-set-compact-media-icon"
                    />
                  </span>
                )}
                {card.back_audio && (
                  <span className="card-set-compact-media-item">
                    <FontAwesomeIcon
                      icon={faVolumeHigh}
                      className="card-set-compact-media-icon"
                    />
                  </span>
                )}
                {card.back_video && (
                  <span className="card-set-compact-media-item">
                    <FontAwesomeIcon
                      icon={faVideo}
                      className="card-set-compact-media-icon"
                    />
                  </span>
                )}
              </div>
            )}
          </div>
          {showContent && BackMediaPreview && (
            <BackMediaPreview
              image={card.back_image}
              audio={card.back_audio}
              video={card.back_video}
              currentTheme={currentTheme}
            />
          )}
        </div>
      </div>

      {/* Кнопки действий — горизонтальная строка */}
      <div className="card-set-card-actions">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(card.id);
          }}
          style={{
            ...styles.actionBtn,
            background: favoriteCardIds.has(card.id)
              ? "rgba(241,196,15,0.2)"
              : `${currentTheme.textMuted}15`,
            color: favoriteCardIds.has(card.id)
              ? "#f1c40f"
              : currentTheme.textMuted,
          }}
          title={
            favoriteCardIds.has(card.id)
              ? "Убрать из избранного"
              : "Добавить в избранное"
          }
        >
          <FontAwesomeIcon icon={faStar} />
        </button>
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
            style={{
              ...styles.actionBtn,
              background: `${currentTheme.primary}15`,
              color: currentTheme.primary,
            }}
            title="Редактировать"
          >
            <FontAwesomeIcon icon={faPen} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
            style={{
              ...styles.actionBtn,
              background: `${currentTheme.error}15`,
              color: currentTheme.error,
            }}
            title="Удалить"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: "12px 16px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    position: "relative",
    border: "2px solid var(--nt-border, #e0e0e0)",
    touchAction: "none",
    userSelect: "none",
    WebkitUserSelect: "none",
  },
  cardNumber: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "12px",
    flexShrink: 0,
    marginTop: "1px",
  },
  cardTwoColumns: {
    flex: 1,
    display: "flex",
    gap: "0",
    minWidth: 0,
  },
  cardColumn: {
    flex: 1,
    padding: "0 10px",
    minWidth: 0,
  },
  columnHeader: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "4px",
  },
  columnTitle: {
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "var(--nt-text-secondary, #666)",
  },
  sideDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  cardSideText: {
    fontSize: "14px",
    lineHeight: "1.5",
    wordBreak: "break-word",
  },
  cardTextWithBadges: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  mediaBadges: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
    flexShrink: 0,
  },
  cardColumnDivider: {
    width: "1px",
    background: "var(--nt-border, #e0e0e0)",
    flexShrink: 0,
  },
  compactMediaItem: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2px 6px",
    borderRadius: "6px",
    background: "var(--nt-bg-secondary, #f5f5f5)",
  },
  compactMediaIcon: {
    fontSize: "12px",
    color: "var(--nt-text-secondary, #666)",
  },
  cardActions: {
    display: "flex",
    flexDirection: "row",
    gap: "6px",
    flexShrink: 0,
    alignItems: "center",
  },
  actionBtn: {
    width: "30px",
    height: "30px",
    borderRadius: "7px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    transition: "transform 0.15s, opacity 0.15s",
    flexShrink: 0,
  },
};
