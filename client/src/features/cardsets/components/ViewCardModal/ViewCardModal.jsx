import React from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import AnimatedModal from "../../../shared/components/AnimatedModal/AnimatedModal";

const ViewCardModal = ({ isOpen, onClose, card, onEdit }) => {
  const { t } = useAppStore(); // Добавлено

  const handleEdit = () => {
    if (onEdit && card) {
      onEdit(card);
    }
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} size="large">
      <div className="nt-modal__header">
        <h2 className="nt-modal__title">{t("card.view.title")}</h2>{" "}
        {/* Исправлено */}
        <button className="nt-modal__close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="nt-modal__view-container">
        {/* Front Side */}
        <div className="nt-modal__view-side nt-modal__view-side--front">
          <h3 className="nt-modal__card-side-title">{t("cards.front")}</h3>{" "}
          {/* Исправлено */}
          <div className="nt-modal__view-content">
            <p className="nt-modal__view-text">
              {card?.front || t("card.no_text")} {/* Исправлено */}
            </p>
            {card?.imageUrl && (
              <div className="nt-modal__media">
                <img
                  src={card.imageUrl}
                  alt="Front"
                  className="nt-modal__image"
                />
              </div>
            )}
            {card?.audioUrl && (
              <div className="nt-modal__media">
                <audio controls className="nt-modal__audio">
                  <source src={card.audioUrl} />
                </audio>
              </div>
            )}
          </div>
        </div>

        {/* Back Side */}
        <div className="nt-modal__view-side nt-modal__view-side--back">
          <h3 className="nt-modal__card-side-title">{t("cards.back")}</h3>{" "}
          {/* Исправлено */}
          <div className="nt-modal__view-content">
            <p className="nt-modal__view-text">
              {card?.back || t("card.no_text")} {/* Исправлено */}
            </p>
            {card?.backImageUrl && (
              <div className="nt-modal__media">
                <img
                  src={card.backImageUrl}
                  alt="Back"
                  className="nt-modal__image"
                />
              </div>
            )}
            {card?.backAudioUrl && (
              <div className="nt-modal__media">
                <audio controls className="nt-modal__audio">
                  <source src={card.backAudioUrl} />
                </audio>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="nt-modal__footer">
        <div className="nt-modal__actions">
          <button className="nt-btn nt-btn--secondary" onClick={onClose}>
            {t("modal.close")} {/* Исправлено */}
          </button>
          {onEdit && (
            <button className="nt-btn nt-btn--primary" onClick={handleEdit}>
              {t("cards.edit")} {/* Исправлено */}
            </button>
          )}
        </div>
      </div>
    </AnimatedModal>
  );
};

export default ViewCardModal;
