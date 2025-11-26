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
      {/* Контейнер для кнопок навигации */}
      <div className="viewset-header-actions">
        <button className="btn-tp3" onClick={() => setActiveTab("sets")}>
          {t("sets.back")}
        </button>
        <button
          className="btn-tp1"
          onClick={() => {
            setIsAddCardModalOpen(true);
          }}
        >
          {t("sets.add.card")}
        </button>
      </div>

      <h2>{selectedSet.title}</h2>

      {/* Добавляем отображение тегов с исправленной логикой */}
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
        <h3>
          {t("sets.cards")} ({selectedSet.cards ? selectedSet.cards.length : 0})
        </h3>
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
                    showDeleteModal(card, "card");
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
