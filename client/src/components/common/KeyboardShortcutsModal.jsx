import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faKeyboard } from "../../utils/icons";

/**
 * KeyboardShortcutsModal — модалка с подсказками по горячим клавишам.
 * 
 * @param {boolean} isOpen - Состояние открытия модалки
 * @param {function} onClose - Функция закрытия модалки
 * @param {object} currentTheme - Текущая тема
 */
export default function KeyboardShortcutsModal({ isOpen, onClose, currentTheme }) {
  if (!isOpen) return null;

  const th = currentTheme;

  const shortcuts = [
    { keys: ["Space", "Enter"], description: "Перевернуть карточку", icon: faKeyboard },
    { keys: ["→"], description: "Помню (свайп вправо)", color: th.success },
    { keys: ["←"], description: "Не помню (свайп влево)", color: th.danger || "var(--nt-error)" },
    { keys: ["Esc"], description: "Назад" },
    { keys: ["?"], description: "Скрыть/показать подсказку" },
  ];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={{
          ...styles.modal,
          background: th.surface,
          border: `3px solid ${th.border || 'var(--nt-border)'}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <h3 style={{ margin: 0, color: th.text, fontSize: "24px", fontWeight: "700" }}>
            Горячие клавиши
          </h3>
          <button 
            onClick={onClose} 
            style={{
              ...styles.closeBtn,
              background: `${th.danger || 'var(--nt-error)'}15`,
              color: th.danger || 'var(--nt-error)',
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div style={styles.shortcutsList}>
          {shortcuts.map((shortcut, index) => (
            <div key={index} style={styles.shortcutRow}>
              <div style={styles.keysContainer}>
                {shortcut.keys.map((key, keyIndex) => (
                  <React.Fragment key={keyIndex}>
                    <kbd style={{
                      ...styles.kbd,
                      background: `${th.primary}15`,
                      color: th.primary,
                      borderColor: th.primary,
                    }}>
                      {key}
                    </kbd>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span style={styles.orText}>или</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <span style={{
                ...styles.description,
                color: shortcut.color || th.textSecondary,
                fontWeight: shortcut.color ? "600" : "500",
              }}>
                {shortcut.description}
              </span>
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <p style={{ margin: 0, fontSize: "14px", color: th.textSecondary }}>
            Нажмите любую клавишу для действия
          </p>
        </div>
      </div>
    </div>
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
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    padding: "20px",
  },
  modal: {
    borderRadius: "16px",
    padding: "32px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "var(--nt-card-shadow, 0 8px 32px rgba(0,0,0,0.2))",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "2px solid rgba(0,0,0,0.08)",
  },
  closeBtn: {
    width: "36px",
    height: "36px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },
  shortcutsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "24px",
  },
  shortcutRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "2px solid rgba(0,0,0,0.08)",
    background: "rgba(0,0,0,0.02)",
  },
  keysContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  kbd: {
    padding: "6px 12px",
    borderRadius: "8px",
    fontFamily: "monospace",
    fontSize: "14px",
    fontWeight: "700",
    border: "2px solid",
    minWidth: "40px",
    textAlign: "center",
  },
  orText: {
    fontSize: "13px",
    color: "#999",
    fontWeight: "500",
  },
  description: {
    fontSize: "15px",
    flex: 1,
    textAlign: "right",
  },
  footer: {
    paddingTop: "16px",
    borderTop: "2px solid rgba(0,0,0,0.08)",
    textAlign: "center",
  },
};
