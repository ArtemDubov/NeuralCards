import React from "react";
import "./CardModal.css";

const CardModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  cardFrontText,
  setCardFrontText,
  cardBackText,
  setCardBackText,
  frontImage,
  setFrontImage,
  backImage,
  setBackImage,
  frontAudio,
  setFrontAudio,
  backAudio,
  setBackAudio,
  isUploading,
  submitText = "Создать карточку",
}) => {
  if (!isOpen) return null;

  const resetForm = () => {
    setCardFrontText("");
    setCardBackText("");
    setFrontImage(null);
    setBackImage(null);
    setFrontAudio(null);
    setBackAudio(null);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="card-modal container-tp1">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={resetForm}>
            ✕
          </button>
        </div>

        <div className="card-sides-container">
          {/* Левая сторона - Лицевая сторона карточки */}
          <div className="card-side front-side">
            <h3>🟦 Лицевая сторона (Вопрос)</h3>

            <div className="side-content">
              <textarea
                placeholder="Текст вопроса..."
                value={cardFrontText}
                onChange={(e) => setCardFrontText(e.target.value)}
                className="side-textarea"
                rows="3"
              />

              <div className="file-input-group">
                <label className="file-input-label">🖼️ Изображение:</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFrontImage(e.target.files[0])}
                    className="file-input"
                  />
                  {frontImage && (
                    <div className="file-preview">
                      <span>✓ {frontImage.name}</span>
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => setFrontImage(null)}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="file-input-group">
                <label className="file-input-label">🎵 Аудио:</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setFrontAudio(e.target.files[0])}
                    className="file-input"
                  />
                  {frontAudio && (
                    <div className="file-preview">
                      <span>✓ {frontAudio.name}</span>
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => setFrontAudio(null)}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Правая сторона - Обратная сторона карточки */}
          <div className="card-side back-side">
            <h3>🟩 Обратная сторона (Ответ)</h3>

            <div className="side-content">
              <textarea
                placeholder="Текст ответа..."
                value={cardBackText}
                onChange={(e) => setCardBackText(e.target.value)}
                className="side-textarea"
                rows="3"
              />

              <div className="file-input-group">
                <label className="file-input-label">🖼️ Изображение:</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBackImage(e.target.files[0])}
                    className="file-input"
                  />
                  {backImage && (
                    <div className="file-preview">
                      <span>✓ {backImage.name}</span>
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => setBackImage(null)}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="file-input-group">
                <label className="file-input-label">🎵 Аудио:</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setBackAudio(e.target.files[0])}
                    className="file-input"
                  />
                  {backAudio && (
                    <div className="file-preview">
                      <span>✓ {backAudio.name}</span>
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => setBackAudio(null)}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="requirements-hint">
            💡 Добавьте хотя бы один элемент на каждую сторону карточки
          </div>
          <div className="modal-actions">
            <button className="btn-tp3" onClick={resetForm}>
              Отмена
            </button>
            <button
              className="btn-tp1"
              onClick={onSubmit}
              disabled={isUploading}
            >
              {isUploading ? "📤 Загрузка..." : submitText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
