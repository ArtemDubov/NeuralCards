import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faVolumeHigh,
} from "../../../utils/icons";

/**
 * Компонент настроек воспроизведения для режимов тренировки
 * Позволяет выбрать:
 * - Автоматическое воспроизведение или по клику
 * - Какую сторону проигрывать (front, back, обе, ни одну)
 */
export default function TrainingPlaybackSettings({
  // Текущие настройки
  autoPlayEnabled = false,
  playFront = true,
  playBack = true,
  // Callbacks
  onAutoPlayChange,
  onPlayFrontChange,
  onPlayBackChange,
  currentTheme,
}) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <FontAwesomeIcon
          icon={faVolumeHigh}
          style={{ marginRight: "8px", color: currentTheme?.primary }}
        />
        <span style={{ ...styles.title, color: currentTheme?.text }}>
          Настройки воспроизведения
        </span>
      </div>

      {/* Автоматическое воспроизведение */}
      <div style={styles.settingRow}>
        <label style={styles.settingLabel}>
          <input
            type="checkbox"
            checked={autoPlayEnabled}
            onChange={(e) => onAutoPlayChange(e.target.checked)}
            style={styles.checkbox}
          />
          <span style={{ ...styles.settingText, color: currentTheme?.text }}>
            <FontAwesomeIcon
              icon={autoPlayEnabled ? faPlay : faPause}
              style={{ marginRight: "6px" }}
            />
            Автовоспроизведение
          </span>
        </label>
      </div>

      {/* Выбор сторон для воспроизведения */}
      <div style={styles.settingRow}>
        <span style={{ ...styles.settingText, color: currentTheme?.text }}>
          Проигрывать стороны:
        </span>
        <div style={styles.buttonGroup}>
          <button
            onClick={() => {
              onPlayFrontChange(true);
              onPlayBackChange(false);
            }}
            style={{
              ...styles.optionButton,
              background: playFront && !playBack
                ? currentTheme?.primary
                : currentTheme?.backgroundSecondary,
              color: playFront && !playBack ? "#fff" : currentTheme?.text,
            }}
            title="Только вопрос"
          >
            Вопрос
          </button>

          <button
            onClick={() => {
              onPlayFrontChange(false);
              onPlayBackChange(true);
            }}
            style={{
              ...styles.optionButton,
              background: !playFront && playBack
                ? currentTheme?.primary
                : currentTheme?.backgroundSecondary,
              color: !playFront && playBack ? "#fff" : currentTheme?.text,
            }}
            title="Только ответ"
          >
            Ответ
          </button>

          <button
            onClick={() => {
              onPlayFrontChange(true);
              onPlayBackChange(true);
            }}
            style={{
              ...styles.optionButton,
              background: playFront && playBack
                ? currentTheme?.primary
                : currentTheme?.backgroundSecondary,
              color: playFront && playBack ? "#fff" : currentTheme?.text,
            }}
            title="Обе стороны"
          >
            Обе
          </button>

          <button
            onClick={() => {
              onPlayFrontChange(false);
              onPlayBackChange(false);
            }}
            style={{
              ...styles.optionButton,
              background: !playFront && !playBack
                ? currentTheme?.primary
                : currentTheme?.backgroundSecondary,
              color: !playFront && !playBack ? "#fff" : currentTheme?.text,
            }}
            title="Не проигрывать"
          >
            Нет
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "12px 16px",
    background: "rgba(102, 126, 234, 0.08)",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
  },
  title: {
    fontSize: "14px",
    fontWeight: "600",
  },
  settingRow: {
    marginBottom: "12px",
  },
  settingLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "13px",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
  },
  settingText: {
    fontSize: "13px",
    fontWeight: "500",
  },
  buttonGroup: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginTop: "6px",
  },
  optionButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
};
