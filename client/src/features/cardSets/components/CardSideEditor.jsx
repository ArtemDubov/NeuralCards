import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faMicrophone,
  faVideo,
  faMusic,
  faXmark,
  faLanguage,
  faSpinner,
} from "../../../utils/icons";
import { mediaApi } from "../../media/api/mediaApi";
import MiniAudioPlayer from "../../media/components/MiniAudioPlayer";
import VoiceInput from "../../speech/components/VoiceInput";
import TextToSpeechButton from "../../speech/components/TextToSpeechButton";
import AudioRecorder from "../../media/components/AudioRecorder";
import { translateText } from "../../speech/api/speechApi";

/**
 * Компактный селектор языков с флагами (2 ряда по 4)
 */
export function LanguageSelector({ value, onChange, currentTheme, className = "" }) {
  const languages = [
    { code: "ru", label: "RU", flag: "https://flagcdn.com/w40/ru.png" },
    { code: "en", label: "EN", flag: "https://flagcdn.com/w40/gb.png" },
    { code: "de", label: "DE", flag: "https://flagcdn.com/w40/de.png" },
    { code: "fr", label: "FR", flag: "https://flagcdn.com/w40/fr.png" },
    { code: "es", label: "ES", flag: "https://flagcdn.com/w40/es.png" },
    { code: "it", label: "IT", flag: "https://flagcdn.com/w40/it.png" },
    { code: "zh-CN", label: "ZH", flag: "https://flagcdn.com/w40/cn.png" },
    { code: "ja", label: "JA", flag: "https://flagcdn.com/w40/jp.png" },
  ];

  return (
    <div className={`lang-selector-container ${className}`} style={styles.langSelectorContainer}>
      {languages.map((lang) => {
        const isSelected = lang.code === value;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => onChange(lang.code)}
            title={lang.label}
            className={`lang-button ${isSelected ? 'selected' : ''}`}
            style={styles.langButton}
          >
            <img
              src={lang.flag}
              alt={lang.label}
              className="flag-image"
              style={styles.flagImage}
            />
          </button>
        );
      })}
    </div>
  );
}

/**
 * Полный блок редактирования одной стороны карточки
 * - Поле ввода текста с голосовым вводом (микрофон)
 * - Кнопка озвучки текста (TTS)
 * - Переводчик
 * - Загрузка медиа (фото, аудио, видео)
 */
export default function CardSideEditor({
  side, // 'front' | 'back'
  text,
  onTextChange,
  // Медиа
  image,
  audio,
  video,
  onImageChange,
  onAudioChange,
  onVideoChange,
  // Настройки
  currentTheme,
  lang = "ru",
  onLangChange,
  // Для перевода (front → back)
  onTranslateToBack, // callback: (translatedText) => void
  isFrontSide = true, // true для лицевой, false для обратной
  translateToLang, // язык перевода (берётся из обратной стороны)
  isInvalid = false, // подсветка пустой стороны
}) {
  const [uploading, setUploading] = useState(null);

  // Язык по умолчанию из localStorage
  const storageKey = `card-lang-${side}`;
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem(storageKey) || "ru";
  });

  useEffect(() => {
    if (lang && lang !== currentLang) {
      setCurrentLang(lang);
    }
  }, [lang]);

  const handleLangChange = (val) => {
    setCurrentLang(val);
    localStorage.setItem(storageKey, val);
    if (onLangChange) onLangChange(val);
  };

  const isFront = side === "front";
  const accentColor = isFront
    ? currentTheme?.primary || "#3498db"
    : currentTheme?.success || "#27ae60";
  const sideLabel = isFront ? "Лицевая" : "Обратная";

  // Загрузка медиа
  const handleUpload = async (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(type);
    try {
      let response;
      if (type === "image") response = await mediaApi.uploadImage(file, side);
      else if (type === "audio")
        response = await mediaApi.uploadAudio(file, side);
      else if (type === "video")
        response = await mediaApi.uploadVideo(file, side);

      if (type === "image") onImageChange(response.file_url);
      else if (type === "audio") onAudioChange(response.file_url);
      else if (type === "video") onVideoChange(response.file_url);
    } catch (err) {
      // Ошибка загрузки медиа обрабатывается через toast в API слое
    } finally {
      setUploading(null);
    }
  };

  const handleRemove = (type) => {
    if (type === "image") onImageChange(null);
    else if (type === "audio") onAudioChange(null);
    else if (type === "video") onVideoChange(null);
  };

  return (
    <div
      style={{
        ...styles.container,
        ...(isInvalid
          ? {
              borderColor: currentTheme?.error || "#e74c3c",
              boxShadow: `0 0 0 3px ${currentTheme?.errorLight || "rgba(231,76,60,0.15)"}`,
            }
          : {}),
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Заголовок стороны */}
      <div style={styles.header}>
        <span style={{ ...styles.dot, background: accentColor }} />
        <span style={{ ...styles.label, color: accentColor }}>{sideLabel}</span>
      </div>

      {/* Поле ввода с голосовым вводом */}
      <div style={styles.inputSection}>
        <VoiceInput
          value={text}
          onChange={(val) => onTextChange(val.slice(0, 256))}
          lang={
            currentLang === "ru"
              ? "ru-RU"
              : `${currentLang}-${currentLang.toUpperCase()}`
          }
          currentTheme={currentTheme}
          placeholder={`Текст ${sideLabel.toLowerCase()}...`}
          rows={3}
          onLangDetected={(detectedLang) => handleLangChange(detectedLang)}
          className="voice-input-textarea"
        />
        <div
          style={{
            ...styles.charCounter,
            color:
              text.length >= 256
                ? currentTheme?.error || "#e74c3c"
                : currentTheme?.textMuted || "#999",
          }}
        >
          {text.length}/256
        </div>

        {/* Язык + Озвучка + Перевод */}
        <div style={styles.toolsRow}>
          <LanguageSelector
            value={currentLang}
            onChange={handleLangChange}
            currentTheme={currentTheme}
            className="lang-selector-container"
          />
          <TextToSpeechButton
            text={text}
            lang={currentLang}
            currentTheme={currentTheme}
            className="tts-button"
          />
        </div>
      </div>

      {/* Медиа */}
      <div style={styles.mediaSection}>
        <div style={styles.mediaLabel}>
          <FontAwesomeIcon icon={faImage} style={{ marginRight: "4px" }} />
          Медиа:
        </div>

        <div style={styles.mediaButtons}>
          {/* Изображение */}
          {image ? (
            <div 
              style={styles.mediaPreview}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = currentTheme?.primary || "#3498db";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--nt-border, #e0e0e0)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <img
                src={mediaApi.getMediaUrl(image)}
                alt=""
                className="thumb-image"
                style={styles.thumbImage}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove("image");
                }}
                style={styles.removeBtn}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          ) : (
            <label
              className="media-upload-btn"
              style={{
                ...styles.mediaUploadBtn,
                background: `${currentTheme?.primary || "var(--nt-primary)"}15`,
                color: currentTheme?.primary || "var(--nt-primary)",
              }}
            >
              <FontAwesomeIcon icon={faImage} />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload("image", e)}
                disabled={uploading === "image"}
                style={{ display: "none" }}
              />
            </label>
          )}

          {/* Аудио — запись или загрузка */}
          {audio ? (
            <div 
              style={styles.audioPreviewContainer}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = currentTheme?.success || "#27ae60";
                e.currentTarget.style.boxShadow = `0 2px 8px ${currentTheme?.cardShadow || "rgba(0,0,0,0.1)"}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--nt-border, #e0e0e0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <MiniAudioPlayer audioUrl={audio} currentTheme={currentTheme} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove("audio");
                }}
                style={styles.removeBtnInline}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          ) : (
            <>
              {/* Запись через микрофон */}
              <AudioRecorder
                side={side}
                onAudioUrl={onAudioChange}
                currentTheme={currentTheme}
              />
              {/* Загрузка из файла */}
              <label
                style={{
                  ...styles.mediaUploadBtn,
                  background: `${currentTheme?.success || "var(--nt-success)"}15`,
                  color: currentTheme?.success || "var(--nt-success)",
                }}
                title="Загрузить аудио"
              >
                <FontAwesomeIcon icon={faMusic} />
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleUpload("audio", e)}
                  disabled={uploading === "audio"}
                  style={{ display: "none" }}
                />
              </label>
            </>
          )}

          {/* Видео */}
          {video ? (
            <div 
              style={styles.mediaPreview}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = currentTheme?.error || "#e74c3c";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--nt-border, #e0e0e0)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <video
                src={mediaApi.getMediaUrl(video)}
                controls
                className="thumb-video"
                style={styles.thumbVideo}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove("video");
                }}
                style={styles.removeBtn}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          ) : (
            <label
              style={{
                ...styles.mediaUploadBtn,
                background: `${currentTheme?.error || "var(--nt-error)"}15`,
                color: currentTheme?.error || "var(--nt-error)",
              }}
            >
              <FontAwesomeIcon icon={faVideo} />
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleUpload("video", e)}
                disabled={uploading === "video"}
                style={{ display: "none" }}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "14px",
    background: "var(--nt-background-secondary, #f8f9fa)",
    borderRadius: "10px",
    border: "1px solid var(--nt-border, #e0e0e0)",
    transition: "border-color 0.3s, box-shadow 0.3s",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  inputSection: {
    marginBottom: "12px",
  },
  charCounter: {
    fontSize: "11px",
    textAlign: "right",
    marginTop: "2px",
    fontWeight: "500",
  },
  langSelectorContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "6px",
    padding: "2px",
  },
  langButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "32px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
  },
  flagImage: {
    width: "20px",
    height: "15px",
    borderRadius: "2px",
    objectFit: "cover",
  },
  toolsRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "6px",
    flexWrap: "wrap",
  },
  mediaSection: {
    marginTop: "10px",
  },
  mediaLabel: {
    fontSize: "12px",
    color: "var(--nt-text-secondary, #666)",
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
  },
  mediaButtons: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  mediaUploadBtn: {
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    transition: "all 0.2s",
  },
  mediaPreview: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "8px",
    overflow: "hidden",
    border: "2px solid var(--nt-border, #e0e0e0)",
    background: "var(--nt-background-secondary, #f8f9fa)",
    transition: "all 0.2s ease",
  },
  thumbImage: {
    width: "70px",
    height: "70px",
    objectFit: "cover",
    borderRadius: "6px",
    display: "block",
  },
  audioPreviewContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
    minWidth: "200px",
    padding: "4px 8px",
    background: "var(--nt-background, #ffffff)",
    borderRadius: "8px",
    border: "1px solid var(--nt-border, #e0e0e0)",
  },
  removeBtnInline: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "var(--nt-error, #e74c3c)",
    color: "var(--nt-text-inverse, #fff)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    flexShrink: 0,
    transition: "transform 0.2s",
  },
  thumbVideo: {
    width: "120px",
    maxHeight: "70px",
    borderRadius: "6px",
    background: "#000",
    display: "block",
  },
  removeBtn: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "var(--nt-error, #e74c3c)",
    color: "var(--nt-text-inverse, #fff)",
    border: "2px solid var(--nt-surface, #ffffff)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    transition: "transform 0.2s",
    zIndex: 10,
  },
};
