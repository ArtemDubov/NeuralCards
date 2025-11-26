import React from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import "./ViewSet.css";

const ViewSet = ({
  selectedSet,
  setActiveTab,
  handleViewCard,
  showDeleteModal,
  setIsAddCardModalOpen,
}) => {
  const { t } = useLanguage();

  if (!selectedSet) return null;

  return (
    <div className="tab-content container-tp5">
      {/* НОВАЯ СТРУКТУРА: название набора и кнопка назад в одной строке */}
      <div className="viewset-header-main">
        <div className="viewset-title-section">
          <h2>{selectedSet.title}</h2>
          <button className="btn-tp3" onClick={() => setActiveTab("sets")}>
            {t("sets.back")}
          </button>
        </div>

        <div className="viewset-actions">
          {/* Количество карточек теперь здесь - слева от кнопки добавления */}
          <span className="cards-count-badge">
            {selectedSet.cards ? selectedSet.cards.length : 0}{" "}
            {t("sets.cards_count")}
          </span>
          <button
            className="btn-tp1"
            onClick={() => {
              setIsAddCardModalOpen(true);
            }}
          >
            {t("sets.add.card")}
          </button>
        </div>
      </div>

      {/* Только теги остаются здесь */}
      {selectedSet.tags && selectedSet.tags.length > 0 && (
        <div className="tags-section">
          <div className="tags-list">
            {(Array.isArray(selectedSet.tags)
              ? selectedSet.tags.map((tag) =>
                  typeof tag === "string" ? tag : tag.name
                )
              : selectedSet.tags.split(",").map((tag) => tag.trim())
            ).map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="cards-section">
        {selectedSet.cards && selectedSet.cards.length > 0 ? (
          <div className="cards-grid">
            {selectedSet.cards.map((card) => (
              <div
                key={card.id}
                className="card-preview container-tp4"
                onClick={() => handleViewCard(card)}
              >
                <div className="card-preview-content">
                  <div className="card-preview-front">
                    <div className="card-text" title={card.front}>
                      {card.front}
                    </div>
                    <div className="card-media-indicators">
                      {card.imageUrl && (
                        <span className="media-indicator">🖼️</span>
                      )}
                      {card.audioUrl && (
                        <span className="media-indicator">🎵</span>
                      )}
                    </div>
                  </div>
                  <div className="card-preview-back">
                    <div className="card-text" title={card.back}>
                      {card.back}
                    </div>
                    <div className="card-media-indicators">
                      {card.backImageUrl && (
                        <span className="media-indicator">🖼️</span>
                      )}
                      {card.backAudioUrl && (
                        <span className="media-indicator">🎵</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className="card-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    showDeleteModal(
                      "card",
                      card.id,
                      t("modal.delete.title"),
                      t("modal.delete.card")
                    );
                  }}
                  title={t("sets.delete")}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">{t("sets.cards.empty")}</p>
        )}
      </div>
    </div>
  );
};

export default ViewSet;
