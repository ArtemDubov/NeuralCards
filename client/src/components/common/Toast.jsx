import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faInfo,
  faTriangleExclamation,
  faCircleXmark,
} from "../../utils/icons";

/**
 * Компонент красивых уведомлений (Toast)
 * Поддерживает 4 типа: success, info, warning, error
 */
export default function Toast({
  message,
  type = "info",
  onClose,
  duration = 3000,
}) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Показываем с небольшой задержкой для анимации
    const showTimer = setTimeout(() => setVisible(true), 50);

    // Автоматическое закрытие
    const hideTimer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 400); // Ждём завершения анимации
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  const icons = {
    success: { icon: faCheck, color: "var(--nt-success)", bg: "rgba(46,204,113,0.1)" },
    info: { icon: faInfo, color: "var(--nt-info)", bg: "rgba(52,152,219,0.1)" },
    warning: { icon: faTriangleExclamation, color: "var(--nt-warning)", bg: "rgba(243,156,18,0.1)" },
    error: { icon: faCircleXmark, color: "var(--nt-error)", bg: "rgba(231,76,60,0.1)" },
  };

  const config = icons[type] || icons.info;

  return (
    <div
      style={{
        ...styles.container,
        ...styles[type],
        opacity: visible && !exiting ? 1 : 0,
        transform: visible && !exiting ? "translateY(0)" : "translateY(-20px)",
      }}
    >
      <div
        style={{
          ...styles.iconContainer,
          background: config.bg,
        }}
      >
        <FontAwesomeIcon
          icon={config.icon}
          style={{ color: config.color, fontSize: "18px" }}
        />
      </div>
      <span style={styles.message}>{message}</span>
      <button onClick={onClose} style={styles.closeButton}>
        ✕
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 18px",
    background: "var(--nt-surface, white)",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    minWidth: "300px",
    maxWidth: "500px",
    transition: "opacity 0.4s ease, transform 0.4s ease",
    position: "relative",
    overflow: "hidden",
    pointerEvents: "auto",
    color: "var(--nt-text, #333)",
  },
  success: {
    borderLeft: "4px solid #2ecc71",
  },
  info: {
    borderLeft: "4px solid #3498db",
  },
  warning: {
    borderLeft: "4px solid #f39c12",
  },
  error: {
    borderLeft: "4px solid #e74c3c",
  },
  iconContainer: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontSize: "14px",
    color: "#333",
    lineHeight: "1.4",
  },
  closeButton: {
    background: "transparent",
    border: "none",
    color: "#999",
    cursor: "pointer",
    fontSize: "16px",
    padding: "4px 8px",
    borderRadius: "6px",
    transition: "all 0.2s",
  },
};
