import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faForward,
  faBackward,
  faVolumeHigh,
} from "../../../utils/icons";

/**
 * Компонент настроек воспроизведения для карточек
 * Позволяет выбрать:
 * - Автоматическое воспроизведение или по клику
 * - Какую сторону проигрывать (front, back, обе, ни одну)
 */
export default function PlaybackSettings({
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
      <h4 style={{ ...styles.sectionTitle, color: currentTheme?.text || "#333" }}>
        <FontAwesomeIcon icon={faVolumeHigh} style={{ marginRight: "8px" }} />
        Настройки воспроизведения
      </h4>

      {/* Автоматическое воспроизведение */}
      <div style={styles.settingRow}>
        <label style={styles.settingLabel}>
          <input
            type="checkbox"
            checked={autoPlayEnabled}
            onChange={(e) => onAutoPlayChange(e.target.checked)}
            style={styles.checkbox}
          />
          <span style={{ ...styles.settingText, color: currentTheme?.text || "#333" }}>
            <FontAwesomeIcon
              icon={autoPlayEnabled ? faPlay : faPause}
              style={{ marginRight: "6px" }}
            />
            Автоматическое воспроизведение
          </span>
        </label>
        <p style={{ ...styles.settingHint, color: currentTheme?.textSecondary || "#666" }}>
          {autoPlayEnabled
            ? "Аудио/видео будут проигрываться автоматически при показе карточки"
            : "Нажмите кнопку для воспроизведения"}
        </p>
      </div>

      {/* Выбор сторон для воспроизведения */}
      <div style={styles.settingRow}>
        <span style={{ ...styles.settingText, color: currentTheme?.text || "#333", marginBottom: "8px" }}>
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
                ? currentTheme?.primary || "var(--nt-primary)"
                : currentTheme?.backgroundSecondary || "var(--nt-background-secondary)",
              color: playFront && !playBack
                ? "#fff"
                : currentTheme?.text || "var(--nt-text)",
            }}
            title="Только лицевая сторона"
          >
            <FontAwesomeIcon icon={faBackward} />
            <span style={styles.optionLabel}>Только вопрос</span>
          </button>

          <button
            onClick={() => {
              onPlayFrontChange(false);
              onPlayBackChange(true);
            }}
            style={{
              ...styles.optionButton,
              background: !playFront && playBack
                ? currentTheme?.primary || "var(--nt-primary)"
                : currentTheme?.backgroundSecondary || "var(--nt-background-secondary)",
              color: !playFront && playBack
                ? "#fff"
                : currentTheme?.text || "var(--nt-text)",
            }}
            title="Только обратная сторона"
          >
            <FontAwesomeIcon icon={faForward} />
            <span style={styles.optionLabel}>Только ответ</span>
          </button>

          <button
            onClick={() => {
              onPlayFrontChange(true);
              onPlayBackChange(true);
            }}
            style={{
              ...styles.optionButton,
              background: playFront && playBack
                ? currentTheme?.primary || "var(--nt-primary)"
                : currentTheme?.backgroundSecondary || "var(--nt-background-secondary)",
              color: playFront && playBack
                ? "#fff"
                : currentTheme?.text || "var(--nt-text)",
            }}
            title="Обе стороны"
          >
            <FontAwesomeIcon icon={faPlay} />
            <span style={styles.optionLabel}>Обе</span>
          </button>

          <button
            onClick={() => {
              onPlayFrontChange(false);
              onPlayBackChange(false);
            }}
            style={{
              ...styles.optionButton,
              background: !playFront && !playBack
                ? currentTheme?.primary || "var(--nt-primary)"
                : currentTheme?.backgroundSecondary || "var(--nt-background-secondary)",
              color: !playFront && !playBack
                ? "#fff"
                : currentTheme?.text || "var(--nt-text)",
            }}
            title="Не проигрывать ничего"
          >
            <FontAwesomeIcon icon={faPause} />
            <span style={styles.optionLabel}>Нет</span>
          </button>
        </div>
        <p style={{ ...styles.settingHint, color: currentTheme?.textSecondary || "#666" }}>
          {playFront && playBack && "Будут проигрываться обе стороны карточки"}
          {playFront && !playBack && "Будет проигрываться только лицевая сторона"}
          {!playFront && playBack && "Будет проигрываться только обратная сторона"}
          {!playFront && !playBack && "Воспроизведение отключено"}
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "16px",
    background: "var(--nt-background-secondary, #f8f9fa)",
    borderRadius: "8px",
    marginTop: "16px",
  },
  sectionTitle: {
    margin: "0 0 16px 0",
    fontSize: "14px",
    fontWeight: "600",
  },
  settingRow: {
    marginBottom: "16px",
  },
  settingLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  settingText: {
    fontSize: "14px",
    fontWeight: "500",
  },
  settingHint: {
    fontSize: "12px",
    marginTop: "4px",
    marginLeft: "26px",
    lineHeight: "1.4",
  },
  buttonGroup: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "8px",
  },
  optionButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  optionLabel: {
    fontSize: "12px",
  },
};
