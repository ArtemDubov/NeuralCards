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
} from "../../utils/icons";
import { mediaApi } from "../../features/media";
import MiniAudioPlayer from "../../features/media/components/MiniAudioPlayer";

/**
 * SortableGridCard — карточка для grid-режима с dnd-kit sortable.
 *
 * Layout:
 *  - Правый верхний угол: кнопки действий (absolute)
 *  - Лицевая сторона сверху: точка + текст + медиа (если showContent)
 *  - Обратная сторона снизу: точка + текст + медиа (если showContent)
 *
 * showContent (глазик) скрывает/показывает только медиа. Текст ВСЕГДА виден.
 */
export default function SortableGridCard({
  card,
  displayIndex,
  currentTheme,
  showContent,
  favoriteCardIds,
  onClick,
  onToggleFavorite,
  onEdit,
  onDelete,
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
    transition:
      transform != null
        ? transition || "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)"
        : "none",
    opacity: isDragging ? 0.3 : isSorting ? 0.7 : 1,
    zIndex: isDragging ? 100 : 1,
    ...(isHoverActive && transform == null
      ? {
          transform: "translateY(-3px)",
          boxShadow: `0 8px 24px ${currentTheme.cardShadow || "rgba(0,0,0,0.15)"}`,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }
      : {}),
  };

  return (
    <div
      ref={setNodeRef}
      className="sortable-grid-card"
      style={{
        ...styles.card,
        ...style,
        background: currentTheme.surface,
        boxShadow: isDragging
          ? `0 2px 8px ${currentTheme.cardShadow}`
          : isHoverActive
            ? `0 8px 24px ${currentTheme.cardShadow || "rgba(0,0,0,0.15)"}`
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
        // Проверяем, что клик не по кнопкам действий
        if (e.target.tagName === "BUTTON" || e.target.closest("button")) {
          return;
        }
        onClick();
      }}
    >
      {/* ===== Номер - левый верхний угол ===== */}
      <div
        className="card-number-badge"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
        }}
      >
        {displayIndex}
      </div>

      {/* ===== Кнопки действий — правый верхний угол (absolute) ===== */}
      <div className="card-set-action-buttons">
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

      {/* ===== Тело карточки ===== */}
      <div className="card-set-card-body">
        {/* === Лицевая сторона === */}
        <div className="card-set-side-section">
          <div className="card-set-side-label">
            <span
              style={{ ...styles.sideDot, background: currentTheme.primary }}
            />
            <span style={{ ...styles.sideLabelText, color: currentTheme.text }}>
              Лицевая
            </span>
          </div>
          <div style={{ ...styles.sideText, color: currentTheme.text }}>
            {card.front}
          </div>
          {/* Медиа лицевой — полно при showContent, иконки при скрытом */}
          <SideMedia
            image={card.front_image}
            audio={card.front_audio}
            video={card.front_video}
            showContent={showContent}
            currentTheme={currentTheme}
          />
        </div>

        {/* Разделитель */}
        <div className="card-set-divider" />

        {/* === Обратная сторона === */}
        <div className="card-set-side-section">
          <div className="card-set-side-label">
            <span
              style={{ ...styles.sideDot, background: currentTheme.success }}
            />
            <span
              style={{ ...styles.sideLabelText, color: currentTheme.success }}
            >
              Обратная
            </span>
          </div>
          <div style={{ ...styles.sideText, color: currentTheme.success }}>
            {card.back}
          </div>
          {/* Медиа обратной — полно при showContent, иконки при скрытом */}
          <SideMedia
            image={card.back_image}
            audio={card.back_audio}
            video={card.back_video}
            showContent={showContent}
            currentTheme={currentTheme}
            accentColor={currentTheme.success}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * SideMedia — медиа для одной стороны.
 * showContent=true → фото, аудио-плеер, видео
 * showContent=false → маленькие иконки-бейджи
 */
function SideMedia({
  image,
  audio,
  video,
  showContent,
  currentTheme,
  accentColor,
}) {
  const hasAny = image || audio || video;
  if (!hasAny) return null;

  if (showContent) {
    return (
      <div className="card-set-media-row">
        {image && (
          <img
            src={mediaApi.getMediaUrl(image)}
            alt=""
            className="card-set-thumb"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
        {audio && (
          <MiniAudioPlayer
            audioUrl={audio}
            currentTheme={currentTheme}
            compact
          />
        )}
        {video && (
          <video
            controls
            preload="metadata"
            src={mediaApi.getMediaUrl(video)}
            className="card-set-video-thumb"
          />
        )}
      </div>
    );
  }

  // Компактный режим — иконки
  return (
    <div className="card-set-icon-row">
      {image && (
        <span className="card-set-icon-badge">
          <FontAwesomeIcon
            icon={faImage}
            style={{
              ...styles.iconBadgeInner,
              color: accentColor || currentTheme.primary,
            }}
          />
        </span>
      )}
      {audio && (
        <span className="card-set-icon-badge">
          <FontAwesomeIcon
            icon={faVolumeHigh}
            style={{
              ...styles.iconBadgeInner,
              color: accentColor || currentTheme.primary,
            }}
          />
        </span>
      )}
      {video && (
        <span className="card-set-icon-badge">
          <FontAwesomeIcon
            icon={faVideo}
            style={{
              ...styles.iconBadgeInner,
              color: accentColor || currentTheme.primary,
            }}
          />
        </span>
      )}
    </div>
  );
}

const styles = {
  card: {
    position: "relative",
    borderRadius: "10px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    border: "2px solid var(--nt-border, #e0e0e0)",
    touchAction: "none",
    userSelect: "none",
    WebkitUserSelect: "none",
  },
  actionButtons: {
    position: "absolute",
    top: "8px",
    right: "8px",
    display: "flex",
    gap: "4px",
    zIndex: 10,
  },
  actionBtn: {
    width: "28px",
    height: "28px",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    transition: "transform 0.15s, opacity 0.15s",
    flexShrink: 0,
  },
  cardBody: {
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  cardNumber: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "11px",
    flexShrink: 0,
  },
  sideSection: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  sideLabel: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  sideDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  sideLabelText: {
    fontSize: "10px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  sideText: {
    fontSize: "13px",
    lineHeight: "1.45",
    wordBreak: "break-word",
    paddingLeft: "12px",
  },
  divider: {
    height: "1px",
    background: "var(--nt-border, #e0e0e0)",
    margin: "2px 0",
  },
  // Медиа — полный режим
  mediaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    alignItems: "center",
    paddingTop: "3px",
  },
  thumb: {
    width: "52px",
    height: "52px",
    borderRadius: "6px",
    objectFit: "cover",
    background: "var(--nt-bg-secondary, #f5f5f5)",
    flexShrink: 0,
  },
  videoThumb: {
    width: "52px",
    height: "52px",
    borderRadius: "6px",
    objectFit: "cover",
    background: "#000",
    flexShrink: 0,
  },
  // Медиа — компактный режим
  iconRow: {
    display: "flex",
    gap: "4px",
    paddingTop: "2px",
  },
  iconBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "22px",
    height: "22px",
    borderRadius: "5px",
    background: "var(--nt-bg-secondary, #f0f0f0)",
    flexShrink: 0,
  },
  iconBadgeInner: {
    fontSize: "11px",
  },
};
