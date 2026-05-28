import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateRight,
  faBullseye,
  faHourglassHalf,
  faBookOpen,
  faXmark,
  faRoute,
  faHeadphones,
  faPuzzlePiece,
} from "../../utils/icons";

/**
 * Модалка выбора режима тренировки.
 * Используется на странице наборов для выбора режима перед началом тренировки.
 * Визуально повторяет стиль страницы «Тренировки».
 */
export default function ModeSelectModal({
  onClose,
  onSelectMode,
  currentTheme,
  loading = false,
}) {
  // Блокируем скролл страницы когда модалка открыта
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Обработчик Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const modes = [
    {
      id: "practice",
      name: "Practice",
      icon: faBookOpen,
      description: "Простое запоминание: смотрите карточку и открывайте ответ",
      color: "#3498db",
    },
    {
      id: "quiz",
      name: "Quiz",
      icon: faBullseye,
      description: "Выберите правильный ответ из 4 вариантов",
      color: "#9b59b6",
    },
    {
      id: "marathon",
      name: "Marathon",
      icon: faRoute,
      description: "Длинная тренировка: пройдите весь набор карточек подряд",
      color: "#2ecc71",
    },
    {
      id: "dictation",
      name: "Dictation",
      icon: faHeadphones,
      description: "Слушайте аудио и вводите ответ — тренировка на слух",
      color: "#e67e22",
    },
    {
      id: "matching",
      name: "Matching",
      icon: faPuzzlePiece,
      description: "Соединяйте пары: лицевую сторону с обратной на скорость",
      color: "#1abc9c",
    },
  ];

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
          background: currentTheme.surface,
          color: currentTheme.text,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка модалки */}
        <div style={styles.header}>
          <h2 style={{ color: currentTheme.text, margin: 0 }}>
            <FontAwesomeIcon icon={faBullseye} style={{ marginRight: "8px" }} />
            Выберите режим тренировки
          </h2>
          <button
            onClick={onClose}
            style={{
              ...styles.closeButton,
              background: `${currentTheme.textMuted}20`,
              color: currentTheme.textMuted,
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <p
          style={{
            ...styles.subtitle,
            color: currentTheme.textSecondary,
          }}
        >
          Каждый режим помогает развивать разные навыки запоминания
        </p>

        {/* Сетка режимов */}
        <div style={styles.grid}>
          {modes.map((mode) => (
            <div
              key={mode.id}
              style={{
                ...styles.card,
                background: currentTheme.background,
                borderLeftColor: mode.color,
              }}
            >
              <div style={styles.icon}>
                <FontAwesomeIcon icon={mode.icon} />
              </div>
              <h3 style={{ color: mode.color }}>{mode.name}</h3>
              <p style={{ color: currentTheme.textSecondary }}>
                {mode.description}
              </p>
              {loading ? (
                <button
                  disabled
                  style={{
                    ...styles.button,
                    background: "var(--nt-border, #cccccc)",
                    cursor: "not-allowed",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faHourglassHalf}
                    style={{ marginRight: "6px" }}
                  />
                  Запуск...
                </button>
              ) : (
                <button
                  onClick={() => onSelectMode(mode.id)}
                  style={{ ...styles.button, background: "var(--nt-primary)" }}
                >
                  Начать
                </button>
              )}
            </div>
          ))}
        </div>
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
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modal: {
    width: "90%",
    maxWidth: "900px",
    maxHeight: "85vh",
    borderRadius: "16px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "var(--nt-card-shadow, 0 8px 32px rgba(0,0,0,0.3))",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid var(--nt-border, #ddd)",
  },
  closeButton: {
    width: "36px",
    height: "36px",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    transition: "background 0.2s",
  },
  subtitle: {
    textAlign: "center",
    padding: "0 24px 24px",
    margin: 0,
    fontSize: "15px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    padding: "0 24px 24px",
  },
  card: {
    padding: "24px",
    borderRadius: "12px",
    border: "2px solid var(--nt-border, #ddd)",
    borderLeft: "4px solid transparent",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  icon: {
    fontSize: "40px",
    marginBottom: "12px",
  },
  button: {
    padding: "10px 20px",
    color: "var(--nt-text-inverse, #ffffff)",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "12px",
    width: "100%",
  },
};
