import React from "react";
import { useAppStore } from "../../../../shared/stores/appStore";

const ViewCardModal = ({ isOpen, onClose, card, onEdit }) => {
  const { t } = useAppStore();

  if (!isOpen || !card) return null;

  return (
    <div className="nt-modal__overlay">
      <div className="nt-modal">
        <div className="nt-modal__header">
          <h2 className="nt-modal__title">{t("card.view.title")}</h2>
          <div className="nt-card-modal__actions">
            <button
              className="nt-card-modal__edit-btn"
              onClick={() => onEdit(card)}
              title={t("card.edit.title")}
            >
              ✏️
            </button>
            <button className="nt-modal__close" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="nt-modal__content">
          <div className="nt-modal__view-container">
            <div className="nt-modal__view-side nt-modal__view-side--front">
              <h3 className="nt-modal__card-side-title">
                {t("card.front.side")}
              </h3>
              <div className="nt-modal__view-content">
                <p className="nt-modal__view-text">{card.front}</p>

                {card.imageUrl && (
                  <div className="nt-modal__media">
                    <img
                      src={`http://localhost:5001${card.imageUrl}`}
                      alt=""
                      className="nt-modal__image"
                    />
                  </div>
                )}

                {card.audioUrl && (
                  <div className="nt-modal__media">
                    <audio controls className="nt-modal__audio">
                      <source
                        src={`http://localhost:5001${card.audioUrl}`}
                        type="audio/mpeg"
                      />
                      <source
                        src={`http://localhost:5001${card.audioUrl}`}
                        type="audio/wav"
                      />
                      <source
                        src={`http://localhost:5001${card.audioUrl}`}
                        type="audio/ogg"
                      />
                      {t("audio.not.supported")}
                    </audio>
                  </div>
                )}
              </div>
            </div>

            <div className="nt-modal__view-side nt-modal__view-side--back">
              <h3 className="nt-modal__card-side-title">
                {t("card.back.side")}
              </h3>
              <div className="nt-modal__view-content">
                <p className="nt-modal__view-text">{card.back}</p>

                {card.backImageUrl && (
                  <div className="nt-modal__media">
                    <img
                      src={`http://localhost:5001${card.backImageUrl}`}
                      alt=""
                      className="nt-modal__image"
                    />
                  </div>
                )}

                {card.backAudioUrl && (
                  <div className="nt-modal__media">
                    <audio controls className="nt-modal__audio">
                      <source
                        src={`http://localhost:5001${card.backAudioUrl}`}
                        type="audio/mpeg"
                      />
                      <source
                        src={`http://localhost:5001${card.backAudioUrl}`}
                        type="audio/wav"
                      />
                      <source
                        src={`http://localhost:5001${card.backAudioUrl}`}
                        type="audio/ogg"
                      />
                      {t("audio.not.supported")}
                    </audio>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCardModal;
