import React from "react";

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
}) => {
  if (!isOpen) return null;

  return (
    <div className="nt-modal__overlay">
      <div className="nt-modal">
        <div className="nt-modal__header">
          <h3 className="nt-modal__title">{title}</h3>
          <button className="nt-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="nt-modal__content">
          <p className="nt-util__text-primary">{message}</p>
        </div>

        <div className="nt-modal__footer">
          <div className="nt-modal__actions">
            <button className="nt-btn nt-btn--secondary" onClick={onClose}>
              {cancelText || "Отмена"}
            </button>
            <button className="nt-btn nt-btn--danger" onClick={onConfirm}>
              {confirmText || "Подтвердить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
