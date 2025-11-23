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
      <button className="btn-tp3" onClick={() => setActiveTab("sets")}>
        {t("sets.back")}
      </button>
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
        <h3>{t("sets.cards")}</h3>
        {selectedSet.cards && selectedSet.cards.length > 0 ? (
          <div className="cards-list">
            {selectedSet.cards.map((card) => (
              <div
                key={card.id}
                className="card-item container-tp4"
                onClick={() => handleViewCard(card)}
              >
                <div className="card-content-wrapper">
                  <div className="card-front">
                    <strong>{t("cards.front")}:</strong> {card.front}
                    {card.imageUrl && <span className="media-badge">🖼️</span>}
                    {card.audioUrl && <span className="media-badge">🎵</span>}
                  </div>
                  <div className="card-back">
                    <strong>{t("cards.back")}:</strong> {card.back}
                    {card.backImageUrl && (
                      <span className="media-badge">🖼️</span>
                    )}
                    {card.backAudioUrl && (
                      <span className="media-badge">🎵</span>
                    )}
                  </div>
                </div>
                <button
                  className="btn-tp4"
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

      <button
        className="btn-tp1"
        onClick={() => {
          setIsAddCardModalOpen(true);
        }}
      >
        {t("sets.add.card")}
      </button>
    </div>
  );
};

export default ViewSet;
