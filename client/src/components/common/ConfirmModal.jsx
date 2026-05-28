import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faXmark } from "../../utils/icons";

/**
 * Модальное окно подтверждения действия
 * Заменяет window.confirm в стиле сайта
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Подтверждение",
  message = "Вы уверены?",
  confirmText = "Подтвердить",
  confirmColor = "#e74c3c",
  loading = false,
  currentTheme,
}) {
  // Блокируем скролл страницы когда модалка открыта
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Обработчик Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Рендерим через портал чтобы модалка была поверх всего
  return ReactDOM.createPortal(
    <div
      style={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          ...styles.modal,
          background: currentTheme?.surface || "var(--nt-surface)",
          color: currentTheme?.text || "var(--nt-text)",
          boxShadow: `0 8px 32px ${currentTheme?.cardShadow || "rgba(0,0,0,0.3)"}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Иконка предупреждения */}
        <div style={styles.iconContainer}>
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            style={{ fontSize: "32px", color: confirmColor }}
          />
        </div>

        {/* Заголовок */}
        <h3 style={{ ...styles.title, color: currentTheme?.text || "var(--nt-text)" }}>
          {title}
        </h3>

        {/* Сообщение */}
        <p
          style={{
            ...styles.message,
            color: currentTheme?.textSecondary || "var(--nt-text-secondary)",
          }}
        >
          {message}
        </p>

        {/* Кнопки */}
        <div style={styles.actions}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              ...styles.cancelButton,
              background: currentTheme?.backgroundSecondary || "var(--nt-background-secondary)",
              color: currentTheme?.text || "var(--nt-text)",
            }}
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              ...styles.confirmButton,
              background: confirmColor,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Удаление..." : confirmText}
          </button>
        </div>

        {/* Кнопка закрытия */}
        <button onClick={onClose} style={styles.closeButton}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>
    </div>,
    document.body
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
  },
  modal: {
    position: "relative",
    padding: "32px 28px 24px",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "420px",
    textAlign: "center",
  },
  iconContainer: {
    marginBottom: "16px",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "18px",
    fontWeight: "600",
  },
  message: {
    margin: "0 0 24px 0",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  actions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },
  cancelButton: {
    flex: 1,
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  confirmButton: {
    flex: 1,
    padding: "12px 20px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  closeButton: {
    position: "absolute",
    top: "12px",
    right: "12px",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(0,0,0,0.08)",
    color: "#666",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    transition: "background 0.2s",
  },
};
