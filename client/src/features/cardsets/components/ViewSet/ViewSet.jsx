import React from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import "./ViewSet.css";

const ViewSet = ({
  selectedSet,
  setActiveTab,
  handleViewCard,
  showDeleteModal,
  setIsAddCardModalOpen,
  onStartTraining,
  onEditCard, // Добавляем этот пропс
}) => {
  const { t } = useLanguage();

  if (!selectedSet) return null;

  return (
    <div className="tab-content container-tp5">
      <div className="viewset-header-main">
        <div className="viewset-title-section">
          <h2>{selectedSet.title}</h2>
          <button className="btn-tp3" onClick={() => setActiveTab("sets")}>
            {t("sets.back")}
          </button>
        </div>

        <div className="viewset-actions">
          <span className="cards-count-badge">
            {selectedSet.cards ? selectedSet.cards.length : 0}{" "}
            {t("sets.cards_count")}
          </span>

          {selectedSet.cards && selectedSet.cards.length > 0 && (
            <button
              className="btn-tp1 training-btn"
              onClick={onStartTraining}
              title={t("training.start.tooltip")}
            >
              🎯 {t("training.start")}
            </button>
          )}

          <button className="btn-tp1" onClick={setIsAddCardModalOpen}>
            {t("sets.add.card")}
          </button>
        </div>
      </div>

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
              <div key={card.id} className="card-preview container-tp4">
                <div
                  className="card-preview-content"
                  onClick={() => handleViewCard(card)}
                >
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

                {/* Кнопки действий с карточкой */}
                <div className="card-actions">
                  <button
                    className="card-edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCard(card); // Вызываем переданную функцию
                    }}
                    title="Редактировать карточку"
                  >
                    ✏️
                  </button>
                  <button
                    className="card-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      showDeleteModal(card.id);
                    }}
                    title={t("sets.delete")}
                  >
                    ✕
                  </button>
                </div>
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
