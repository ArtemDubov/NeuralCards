import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { loadTrainingSettings, saveTrainingSettings } from "./TrainingSettings";
import {
  faVolumeHigh,
  faLanguage,
  faRepeat,
  faRotateRight,
  faGear,
  faArrowsLeftRight,
  faXmark,
} from "../../utils/icons";

/**
 * TrainingSettingsModal — модалка настроек тренировки.
 * Конфигурация зависит от режима.
 *
 * @param {React.ReactNode} [trigger] — Кастомная кнопка-триггер. Если не передана,
 *   рендерится стандартная кнопка с шестерёнкой.
 */
export default function TrainingSettingsModal({ mode, currentTheme, trigger }) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(loadTrainingSettings);

  useEffect(() => {
    if (open) {
      setSettings(loadTrainingSettings());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    saveTrainingSettings(settings);
    // Отправляем событие об изменении настроек
    window.dispatchEvent(new Event('trainingSettingsChanged'));
  }, [settings, open]);

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const th = currentTheme;

  // Определяем какие настройки показывать для режима
  const isPractice = mode === "practice";
  const isQuiz = mode === "quiz";
  const isDictation = mode === "dictation";
  const isMatching = mode === "matching";

  const checkboxes = [];

  // Общие для всех
  checkboxes.push({
    key: "autoReadTTS",
    icon: faLanguage,
    iconColor: th.primary,
    label: "Авто-чтение (TTS Google)",
  });

  if (isPractice) {
    checkboxes.push({
      key: "autoPlayAnswer",
      icon: faVolumeHigh,
      iconColor: th.success,
      label: "Автопроигрывание ответа",
    });
  }

  if (isPractice) {
    checkboxes.push(
      {
        key: "flipAnimation",
        icon: faRepeat,
        iconColor: th.secondary,
        label: "Анимация переворота",
      },
      {
        key: "swipeAnimation",
        icon: faRotateRight,
        iconColor: th.primary,
        label: "Анимация пролистывания",
      },
      {
        key: "shuffleCards",
        icon: faArrowsLeftRight,
        iconColor: th.warning || "#f39c12",
        label: "Перемешать карточки",
      },
    );
  }

  if (isQuiz) {
    checkboxes.push(
      {
        key: "flipAnimation",
        icon: faRepeat,
        iconColor: th.secondary,
        label: "Анимация показа ответа",
      },
      {
        key: "shuffleCards",
        icon: faArrowsLeftRight,
        iconColor: th.warning || "#f39c12",
        label: "Перемешать карточки",
      },
    );
  }

  if (isDictation) {
    checkboxes.push({
      key: "shuffleCards",
      icon: faArrowsLeftRight,
      iconColor: th.warning || "#f39c12",
      label: "Перемешать карточки",
    });
  }

  if (isMatching) {
    checkboxes.push({
      key: "flipAnimation",
      icon: faRepeat,
      iconColor: th.secondary,
      label: "Анимация соединений",
    });
    checkboxes.push({
      key: "shuffleCards",
      icon: faArrowsLeftRight,
      iconColor: th.warning || "#f39c12",
      label: "Перемешать карточки",
    });
  }

  checkboxes.push({
    key: "playFront",
    icon: faVolumeHigh,
    iconColor: th.primary,
    label: "Аудио лицевой стороны",
  });

  checkboxes.push({
    key: "playBack",
    icon: faVolumeHigh,
    iconColor: th.success,
    label: "Аудио обратной стороны",
  });

  return (
    <>
      {/* Кнопка открытия настроек */}
      {trigger ? (
        React.cloneElement(trigger, { onClick: () => setOpen(true) })
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{
            ...styles.settingsBtn,
            background: `${th.primary}15`,
            color: th.primary,
          }}
          title="Настройки тренировки"
        >
          <FontAwesomeIcon icon={faGear} />
        </button>
      )}

      {/* Модалка */}
      {open && (
        <div style={styles.overlay} onClick={() => setOpen(false)}>
          <div
            style={{
              ...styles.modal,
              background: th.surface,
              border: `3px solid ${th.border || '#e0e0e0'}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.header}>
              <h3 style={{ margin: 0, color: th.text, fontSize: "24px", fontWeight: "700" }}>
                Настройки тренировки
              </h3>
              <button 
                onClick={() => setOpen(false)} 
                style={{
                  ...styles.closeBtn,
                  background: `${th.danger || 'var(--nt-error)'}15`,
                  color: th.danger || 'var(--nt-error)',
                }}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div style={styles.checkboxes}>
              {checkboxes.map((cb) => (
                <label 
                  key={cb.key} 
                  style={{
                    ...styles.row,
                    background: settings[cb.key] ? `${cb.iconColor}10` : 'transparent',
                    border: `2px solid ${settings[cb.key] ? cb.iconColor : th.border || '#e0e0e0'}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings[cb.key]}
                    onChange={() => toggle(cb.key)}
                    style={{ display: "none" }}
                  />
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      border: `2px solid ${settings[cb.key] ? cb.iconColor : th.border || '#e0e0e0'}`,
                      background: settings[cb.key] ? cb.iconColor : 'transparent',
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.2s",
                    }}
                  >
                    {settings[cb.key] && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <FontAwesomeIcon
                    icon={cb.icon}
                    style={{ ...styles.rowIcon, color: cb.iconColor }}
                  />
                  <span style={{
                    ...styles.rowLabel,
                    color: settings[cb.key] ? th.text : th.textSecondary,
                    fontWeight: settings[cb.key] ? "600" : "500",
                  }}>
                    {cb.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
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
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
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
  checkboxes: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    padding: "14px 16px",
    borderRadius: "12px",
    fontSize: "16px",
    transition: "all 0.2s",
  },
  rowIcon: {
    fontSize: "16px",
    width: "22px",
    textAlign: "center",
    flexShrink: 0,
  },
  rowLabel: {
    userSelect: "none",
    flex: 1,
  },
  settingsBtn: {
    width: "40px",
    height: "40px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "600",
  },
};
