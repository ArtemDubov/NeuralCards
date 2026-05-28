/**
 * Компонент для отображения избранной карточки в режиме списка
 */

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "../../../utils/icons";

export default function FavoriteCardListItem({
  card,
  index,
  currentTheme,
  onToggleFavorite,
}) {
  return (
    <div
      className="sortable-card-container"
      style={{
        padding: "12px 16px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        position: "relative",
        border: `2px solid ${currentTheme.border}`,
        background: currentTheme.surface,
        boxShadow: `0 2px 8px ${currentTheme.cardShadow}`,
      }}
    >
      {/* Номер карточки */}
      <div
        style={{
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
          background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
        }}
      >
        {index + 1}
      </div>

      {/* Контент: две колонки */}
      <div className="card-set-card-two-columns">
        {/* Лицевая сторона — ЛЕВАЯ колонка */}
        <div className="card-set-card-column">
          <div className="card-set-column-header">
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: currentTheme.primary,
                flexShrink: 0,
              }}
            />
            <span className="card-set-column-title">Лицевая</span>
          </div>
          <div className="card-set-card-text-with-badges">
            <div
              style={{
                fontSize: "14px",
                lineHeight: "1.5",
                wordBreak: "break-word",
                color: currentTheme.text,
              }}
            >
              {card.front}
            </div>
          </div>
        </div>

        {/* Разделитель */}
        <div className="card-set-card-column-divider" />

        {/* Обратная сторона — ПРАВАЯ колонка */}
        <div className="card-set-card-column">
          <div className="card-set-column-header">
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: currentTheme.success,
                flexShrink: 0,
              }}
            />
            <span
              className="card-set-column-title"
              style={{ color: currentTheme.success }}
            >
              Обратная
            </span>
          </div>
          <div className="card-set-card-text-with-badges">
            <div
              style={{
                fontSize: "14px",
                lineHeight: "1.5",
                wordBreak: "break-word",
                color: currentTheme.success,
              }}
            >
              {card.back}
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка избранного */}
      <div className="card-set-card-actions">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(card.id);
          }}
          style={{
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
            background: "rgba(241,196,15,0.2)",
            color: "var(--nt-warning)",
          }}
          title="Убрать из избранного"
        >
          <FontAwesomeIcon icon={faStar} />
        </button>
      </div>
    </div>
  );
}
