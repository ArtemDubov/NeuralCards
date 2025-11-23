import React from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import "./CardsetList.css";

const CardsetList = ({ cardsets, handleViewSet, showDeleteModal }) => {
  const { t } = useLanguage();

  if (cardsets.length === 0) {
    return <p className="empty-state">{t("sets.empty")}</p>;
  }

  return (
    <div className="sets-grid">
      {cardsets.map((set) => {
        // Исправленная обработка тегов из новой версии
        const tagsArray = set.tags
          ? Array.isArray(set.tags)
            ? set.tags.map((tag) => (typeof tag === "string" ? tag : tag.name))
            : typeof set.tags === "string"
            ? set.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag)
            : []
          : [];

        return (
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
                <span className="cards-count">
                  {set.cards ? set.cards.length : 0} {t("sets.cards_count")}
                </span>
              </div>
              <div className="set-actions">
                <button
                  className="btn-tp4"
                  onClick={(e) => {
                    e.stopPropagation();
                    showDeleteModal(set, "set");
                  }}
                  title={t("sets.delete")}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Теги в правом нижнем углу */}
            {tagsArray.length > 0 && (
              <div className="set-tags">
                {tagsArray.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CardsetList;
