import React from "react";
import "./ViewSet.css";

const ViewSet = ({
  selectedSet,
  setActiveTab,
  handleViewCard,
  showDeleteModal,
  setIsAddCardModalOpen,
}) => {
  return (
    <div className="tab-content">
      <button className="btn-tp3" onClick={() => setActiveTab("sets")}>
        ← Назад к наборам
      </button>
      <h2>{selectedSet.title}</h2>

      {/* Добавляем отображение тегов */}
      {selectedSet.tags && selectedSet.tags.length > 0 && (
        <div className="tags-section">
          <div className="tags-list">
            {selectedSet.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="cards-section">
        <h3>Карточки в наборе:</h3>
        {selectedSet.cards && selectedSet.cards.length > 0 ? (
          <div className="cards-list">
            {selectedSet.cards.map((card) => (
              <div
                key={card.id}
                className="card-item"
                onClick={() => handleViewCard(card)}
              >
                <div className="card-content-wrapper">
                  <div className="card-front">
                    <strong>Вопрос:</strong> {card.front}
                    {card.imageUrl && <span className="media-badge">🖼️</span>}
                    {card.audioUrl && <span className="media-badge">🎵</span>}
                  </div>
                  <div className="card-back">
                    <strong>Ответ:</strong> {card.back}
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
                    showDeleteModal(
                      "card",
                      card.id,
                      "Удалить карточку",
                      `Карточка "${card.front}" будет удалена безвозвратно.`
                    );
                  }}
                  title="Удалить карточку"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">В этом наборе пока нет карточек</p>
        )}
      </div>

      <button
        className="btn-tp1"
        onClick={() => {
          setIsAddCardModalOpen(true);
        }}
      >
        ➕ Добавить карточку
      </button>
    </div>
  );
};

export default ViewSet;
