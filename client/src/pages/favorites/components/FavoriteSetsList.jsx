/**
 * Компонент для отображения избранных наборов
 */

import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TagsOverflow from "../../../components/common/TagsOverflow";
import { faStar } from "../../../utils/icons";

export default function FavoriteSetsList({ sets, currentTheme, onRemove }) {
  if (sets.length === 0) {
    return (
      <div className="favorites-empty">
        <p style={{ color: currentTheme.textSecondary }}>
          В избранном пока пусто
        </p>
        <p style={{ color: currentTheme.textMuted, fontSize: "14px" }}>
          Нажмите на звёздочку у набора, чтобы добавить его сюда
        </p>
      </div>
    );
  }

  return (
    <div className="favorites-grid">
      {sets.map((set) => (
        <Link 
          key={set.id} 
          to={`/card-sets/${set.id}`} 
          className="nt-set-card"
          style={{ background: currentTheme.surface }}
        >
          <button
            className="nt-fav-card-remove"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove("card_set", set.id);
            }}
            title="Убрать из избранного"
          >
            <FontAwesomeIcon icon={faStar} />
          </button>

          <h3 style={{ color: currentTheme.text, margin: "0 0 6px 0" }}>
            {set.title}
          </h3>
          {set.description ? (
            <p
              style={{
                color: currentTheme.textSecondary,
                fontSize: "14px",
                margin: "0 0 6px 0",
                lineHeight: "1.5",
              }}
            >
              {set.description}
            </p>
          ) : (
            <p
              style={{
                color: currentTheme.textSecondary,
                fontSize: "14px",
                margin: "0 0 6px 0",
              }}
            >
              Нет описания
            </p>
          )}
          <p style={{ fontSize: "13px", margin: "4px 0 0 0", color: currentTheme.textMuted }}>
            {set.cards?.length || 0} карточек
          </p>

          {set.tags && set.tags.length > 0 && (
            <TagsOverflow
              tags={set.tags.map((t) => t.name)}
              maxVisible={3}
              currentTheme={currentTheme}
            />
          )}
        </Link>
      ))}
    </div>
  );
}
