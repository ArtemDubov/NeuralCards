import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faXmark } from "../../utils/icons";

/**
 * Модальное окно удаления аккаунта с подтверждением паролем
 */
export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  password,
  setPassword,
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
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password && !loading) {
      onConfirm();
    }
  };

  // Рендерим через портал чтобы модалка была поверх всего
  return ReactDOM.createPortal(
    <div
      style={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
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
            style={{ fontSize: "32px", color: "var(--nt-error)" }}
          />
        </div>

        {/* Заголовок */}
        <h3 style={{ ...styles.title, color: currentTheme?.text || "var(--nt-text)" }}>
          Удалить аккаунт?
        </h3>

        {/* Сообщение */}
        <p
          style={{
            ...styles.message,
            color: currentTheme?.textSecondary || "var(--nt-text-secondary)",
          }}
        >
          Это действие необратимо! Все ваши данные будут безвозвратно удалены.
        </p>

        {/* Список что будет удалено */}
        <ul style={styles.list}>
          <li>Все наборы карточек</li>
          <li>Прогресс обучения</li>
          <li>Статистика тренировок</li>
          <li>Сообщения в чатах</li>
          <li>Список друзей</li>
        </ul>

        {/* Форма с паролем */}
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Введите ваш пароль для подтверждения:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ваш пароль"
              disabled={loading}
              style={{
                ...styles.input,
                background: currentTheme?.backgroundSecondary || "var(--nt-background-secondary)",
                border: `2px solid ${currentTheme?.border || "var(--nt-border)"}`,
                color: currentTheme?.text || "var(--nt-text)",
              }}
              autoFocus
            />
          </div>

          {/* Кнопки */}
          <div style={styles.actions}>
            <button
              type="button"
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
              type="submit"
              disabled={loading || !password}
              style={{
                ...styles.confirmButton,
                background: "var(--nt-error)",
                opacity: loading || !password ? 0.6 : 1,
              }}
            >
              {loading ? "Удаление..." : "Удалить аккаунт"}
            </button>
          </div>
        </form>

        {/* Кнопка закрытия */}
        <button onClick={onClose} disabled={loading} style={styles.closeButton}>
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
    background: "rgba(0,0,0,0.7)",
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
    maxWidth: "450px",
    textAlign: "center",
  },
  iconContainer: {
    marginBottom: "16px",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "24px",
    fontWeight: "700",
  },
  message: {
    margin: "0 0 16px 0",
    fontSize: "14px",
    lineHeight: "1.6",
  },
  list: {
    margin: "0 0 24px 0",
    paddingLeft: "20px",
    textAlign: "left",
    fontSize: "14px",
    lineHeight: "1.8",
  },
  field: {
    marginBottom: "20px",
    textAlign: "left",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  actions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  cancelButton: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  confirmButton: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  closeButton: {
    position: "absolute",
    top: "12px",
    right: "12px",
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "50%",
    background: "transparent",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  },
};
