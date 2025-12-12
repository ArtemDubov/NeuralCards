import React from "react";
import { useAppStore } from "../../../../shared/stores/appStore"; // Добавляем импорт
import AnimatedModal from "../AnimatedModal/AnimatedModal";

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
}) => {
  const { t } = useAppStore(); // Добавляем t

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} size="medium">
      <div className="nt-modal__header">
        <h2 className="nt-modal__title">{title}</h2>
        <button className="nt-modal__close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="nt-modal__content">
        <div className="nt-modal__text-content">
          <p className="nt-modal__message">{message}</p>
        </div>
      </div>

      <div className="nt-modal__footer">
        <div className="nt-modal__actions">
          <button className="nt-btn nt-btn--secondary" onClick={onClose}>
            {cancelText || t("modal.cancel")} {/* Исправлено */}
          </button>
          <button className="nt-btn nt-btn--danger" onClick={handleConfirm}>
            {confirmText || t("modal.confirm")} {/* Исправлено */}
          </button>
        </div>
      </div>
    </AnimatedModal>
  );
};
