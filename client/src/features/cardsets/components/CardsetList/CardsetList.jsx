import React from "react";
import FavoriteButton from "../../../favorites/components/FavoriteButton/FavoriteButton";
import "./CardsetList.css";

const CardsetList = ({ cardsets, handleViewSet, showDeleteModal }) => {
  if (cardsets.length === 0) {
    return <p className="empty-state">У вас пока нет наборов</p>;
  }

  return (
    <div className="sets-grid">
      {cardsets.map((set) => (
        <div key={set.id} className="cardset-item container-tp2">
          <div className="set-header">
            <div
              className="set-content"
              onClick={() => handleViewSet(set)}
              style={{
                cursor: "pointer",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h3>{set.title}</h3>
              <p className="set-description">{set.description}</p>

              <small className="cards-count">
                Карточек: {set.cards?.length || 0}
              </small>
            </div>
            <div className="set-actions">
              <FavoriteButton itemId={set.id} itemType="cardset" />
              <button
                className="btn-tp4"
                onClick={(e) => {
                  e.stopPropagation();
                  showDeleteModal(
                    "set",
                    set.id,
                    "Удалить набор",
                    `Набор "${set.title}" будет удален безвозвратно со всеми карточками. Это действие нельзя отменить.`
                  );
                }}
                title="Удалить набор"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Теги в правом нижнем углу */}
          {set.tags && set.tags.length > 0 && (
            <div className="set-tags">
              {set.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CardsetList;
