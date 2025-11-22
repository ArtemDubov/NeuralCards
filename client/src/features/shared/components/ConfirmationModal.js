import React from "react";

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Подтверждение удаления",
  message = "Вы уверены, что хотите удалить этот элемент?",
  confirmText = "Удалить",
  cancelText = "Отмена",
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="confirmation-modal container-tp1">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn-tp7" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p>{message}</p>
        </div>

        <div className="modal-actions">
          <button className="btn-tp3" onClick={onClose}>
            {cancelText}
          </button>
          <button className="btn-tp4" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
