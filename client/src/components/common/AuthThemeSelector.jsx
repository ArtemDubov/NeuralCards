import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "../../contexts/ThemeContext";
import {
  faPalette,
  faSun,
  faMoon,
  faTimes,
  faCheck,
} from "../../utils/icons";

/**
 * Компонент выбора темы для страниц авторизации (Login/Register).
 * Отображает кнопку-иконку палитры, которая открывает мини-модалку
 * с выбором цветового пресета и переключением тёмной/светлой темы.
 */
export default function AuthThemeSelector() {
  const {
    selectedPreset,
    darkMode,
    updatePreset,
    toggleDarkMode,
    presets,
  } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const presetKeys = Object.keys(presets).filter(
    (key) => !presets[key].mode || presets[key].mode === "light",
  );

  const colorMap = {
    red: "#c0392b",
    orange: "#d35400",
    yellow: "#f39c12",
    green: "#27ae60",
    blue: "#2980b9",
    purple: "#8e44ad",
    black: "#2c3e50",
    gray: "#7f8c8d",
    brown: "#8d6e63",
  };

  const nameMap = {
    red: "Красный",
    orange: "Оранжевый",
    yellow: "Жёлтый",
    green: "Зелёный",
    blue: "Синий",
    purple: "Фиолетовый",
    black: "Чёрный",
    gray: "Серый",
    brown: "Коричневый",
  };

  if (isOpen) {
    return (
      <div style={styles.modalOverlay} onClick={() => setIsOpen(false)}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Заголовок */}
          <div style={styles.modalHeader}>
            <h3 style={styles.modalTitle}>
              <FontAwesomeIcon icon={faPalette} style={{ marginRight: "8px" }} />
              Тема оформления
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={styles.closeButton}
              aria-label="Закрыть"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Переключатель тёмной/светлой темы */}
          <div style={styles.darkModeSection}>
            <span style={styles.darkModeLabel}>
              <FontAwesomeIcon icon={darkMode ? faMoon : faSun} style={{ marginRight: "6px" }} />
              {darkMode ? "Тёмная тема" : "Светлая тема"}
            </span>
            <div
              style={{
                ...styles.darkModeToggle,
                ...(darkMode ? styles.darkModeToggleActive : {}),
              }}
              onClick={() => toggleDarkMode()}
            >
              <div
                style={{
                  ...styles.darkModeThumb,
                  ...(darkMode ? styles.darkModeThumbActive : {}),
                }}
              />
            </div>
          </div>

          {/* Сетка цветовых пресетов */}
          <div style={styles.presetsGrid}>
            {presetKeys.map((key) => (
              <button
                key={key}
                onClick={() => updatePreset(key)}
                style={{
                  ...styles.presetButton,
                  borderColor: selectedPreset === key ? colorMap[key] : "transparent",
                  borderWidth: selectedPreset === key ? "3px" : "2px",
                }}
                title={nameMap[key] || key}
              >
                <div
                  style={{
                    ...styles.presetColor,
                    background: `linear-gradient(135deg, ${colorMap[key]} 0%, ${colorMap[key]}cc 100%)`,
                  }}
                />
                <span style={styles.presetName}>{nameMap[key] || key}</span>
                {selectedPreset === key && (
                  <div style={styles.checkBadge}>
                    <FontAwesomeIcon icon={faCheck} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      style={styles.openButton}
      title="Выбрать тему оформления"
      aria-label="Выбрать тему оформления"
    >
      <FontAwesomeIcon icon={faPalette} size="lg" />
    </button>
  );
}

const styles = {
  openButton: {
    position: "fixed",
    top: "20px",
    right: "20px",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(10px)",
    color: "var(--nt-text-inverse, #ffffff)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    zIndex: 999,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },

  modal: {
    background: "var(--nt-surface, #ffffff)",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    maxWidth: "480px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    padding: "24px",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
    color: "var(--nt-text, #333)",
  },

  closeButton: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "none",
    background: "var(--nt-background-secondary, #e8e8e8)",
    color: "var(--nt-text-secondary, #666)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },

  darkModeSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: "var(--nt-background-secondary, #f5f5f5)",
    borderRadius: "12px",
    marginBottom: "20px",
  },

  darkModeLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--nt-text, #333)",
  },

  darkModeToggle: {
    position: "relative",
    width: "52px",
    height: "28px",
    background: "var(--nt-border, #e0e0e0)",
    borderRadius: "14px",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },

  darkModeToggleActive: {
    background: "var(--nt-primary, #667eea)",
  },

  darkModeThumb: {
    position: "absolute",
    width: "22px",
    height: "22px",
    background: "var(--nt-surface, #ffffff)",
    borderRadius: "50%",
    left: "3px",
    top: "3px",
    transition: "transform 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    transform: "translateX(0)",
  },

  darkModeThumbActive: {
    transform: "translateX(24px)",
  },

  presetsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },

  presetButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "12px 8px",
    background: "var(--nt-background-secondary, #f5f5f5)",
    borderRadius: "12px",
    border: "2px solid transparent",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
  },

  presetColor: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },

  presetName: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--nt-text-secondary, #666)",
  },

  checkBadge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "var(--nt-success, #2ecc71)",
    color: "var(--nt-text-inverse, #ffffff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
};
