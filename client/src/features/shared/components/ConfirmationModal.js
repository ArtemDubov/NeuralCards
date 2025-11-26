import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="container-tp1 modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn-tp3" onClick={onClose}>
            {cancelText || t("modal.delete.cancel")}
          </button>
          <button className="btn-tp4" onClick={onConfirm}>
            {confirmText || t("modal.delete.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};

export { ConfirmationModal };
