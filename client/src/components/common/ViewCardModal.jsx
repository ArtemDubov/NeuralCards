import React, { useState, useRef, useEffect } from "react";
import { useToast } from "../../contexts/ToastContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faPen,
  faStar,
  faVolumeHigh,
  faPause,
  faSpinner,
} from "../../utils/icons";
import { mediaApi } from "../../features/media";
import MiniAudioPlayer from "../../features/media/components/MiniAudioPlayer";
import {
  textToSpeech,
  getTtsAudioUrl,
} from "../../features/speech/api/speechApi";

/**
 * Модалка просмотра карточки (только просмотр, без редактирования)
 */
export default function ViewCardModal({
  card,
  index,
  onClose,
  onEdit,
  isFavorite,
  onToggleFavorite,
  currentTheme,
}) {
  const toast = useToast();
  const [ttsLoading, setTtsLoading] = useState({ front: false, back: false });
  const [ttsPlaying, setTtsPlaying] = useState({ front: false, back: false });
  const audioRef = useRef(null);

  // Блокируем скролл страницы когда модалка открыта
  useEffect(() => {
    if (card) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [card]);

  // Обработчик Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && card) {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [card, onClose]);

  const handleTTS = async (side, text) => {
    if (!text?.trim()) return;
    const key = side;
    setTtsLoading((p) => ({ ...p, [key]: true }));

    // Используем сохранённый язык карточки
    const lang =
      side === "front" ? card.front_lang || "ru" : card.back_lang || "ru";

    try {
      const result = await textToSpeech(text, lang);
      const url = getTtsAudioUrl(result.audio_url);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current
          .play()
          .catch(() => {
            // Ошибка воспроизведения аудио - пользователь уже видит сообщение об ошибке TTS
          });
        setTtsPlaying((p) => ({ ...p, [key]: true }));
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail || err.message || "Неизвестная ошибка";
      toast.error("Ошибка озвучки: " + msg);
    } finally {
      setTtsLoading((p) => ({ ...p, [key]: false }));
    }
  };

  const handleAudioEnd = () => {
    setTtsPlaying({ front: false, back: false });
  };

  const handleEdit = () => {
    onClose();
    setTimeout(() => onEdit(card), 100);
  };

  if (!card) return null;

  return (
    <div style={styles.overlay}>
      <div
        style={{
          ...styles.modal,
          background: currentTheme?.surface || "#fff",
          color: currentTheme?.text || "#333",
        }}
      >
        {/* Шапка */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.cardNumber}>#{index + 1}</span>
            <h3 style={{ margin: 0, color: currentTheme?.text || "#333" }}>
              Просмотр карточки
            </h3>
          </div>
          <div style={styles.headerRight}>
            <button
              onClick={handleEdit}
              style={{
                ...styles.iconBtn,
                background: `${currentTheme?.primary || "var(--nt-primary)"}15`,
                color: currentTheme?.primary || "var(--nt-primary)",
              }}
              title="Редактировать"
            >
              <FontAwesomeIcon icon={faPen} />
            </button>
            <button
              onClick={onToggleFavorite}
              style={{
                ...styles.iconBtn,
                background: isFavorite
                  ? "rgba(241,196,15,0.2)"
                  : `${currentTheme?.textMuted || "#999"}15`,
                color: isFavorite
                  ? "#f1c40f"
                  : currentTheme?.textMuted || "#999",
              }}
              title={
                isFavorite ? "Убрать из избранного" : "Добавить в избранное"
              }
            >
              <FontAwesomeIcon icon={faStar} />
            </button>
            <button onClick={onClose} style={styles.closeBtn}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>

        {/* Две колонки */}
        <div style={styles.twoColumns}>
          {/* Лицевая */}
          <ViewSide
            label="Лицевая"
            text={card.front}
            accentColor={currentTheme?.primary || "#3498db"}
            image={card.front_image}
            audio={card.front_audio}
            video={card.front_video}
            ttsLoading={ttsLoading.front}
            ttsPlaying={ttsPlaying.front}
            onTTS={() => handleTTS("front", card.front)}
            currentTheme={currentTheme}
          />

          {/* Обратная */}
          <ViewSide
            label="Обратная"
            text={card.back}
            accentColor={currentTheme?.success || "#27ae60"}
            image={card.back_image}
            audio={card.back_audio}
            video={card.back_video}
            ttsLoading={ttsLoading.back}
            ttsPlaying={ttsPlaying.back}
            onTTS={() => handleTTS("back", card.back)}
            currentTheme={currentTheme}
          />
        </div>

        <audio
          ref={audioRef}
          onEnded={handleAudioEnd}
          onPause={handleAudioEnd}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   Компонент одной стороны (просмотр)
   ============================================================ */

function ViewSide({
  label,
  text,
  accentColor,
  image,
  audio,
  video,
  ttsLoading,
  ttsPlaying,
  onTTS,
  currentTheme,
}) {
  return (
    <div style={viewStyles.container}>
      {/* Заголовок */}
      <div style={viewStyles.header}>
        <span style={{ ...viewStyles.dot, background: accentColor }} />
        <span style={{ ...viewStyles.label, color: accentColor }}>{label}</span>
      </div>

      {/* Текст */}
      <div style={viewStyles.text}>{text}</div>

      {/* Озвучка */}
      {text?.trim() && (
        <button
          onClick={onTTS}
          disabled={ttsLoading}
          style={{
            ...viewStyles.ttsBtn,
            background: ttsPlaying ? accentColor : `${accentColor}15`,
            color: ttsPlaying ? "#fff" : accentColor,
            cursor: ttsLoading ? "not-allowed" : "pointer",
          }}
        >
          <FontAwesomeIcon
            icon={ttsLoading ? faSpinner : ttsPlaying ? faPause : faVolumeHigh}
            spin={ttsLoading}
          />
          <span style={{ marginLeft: "6px", fontSize: "12px" }}>
            {ttsLoading ? "Синтез..." : ttsPlaying ? "Играет..." : "Озвучить"}
          </span>
        </button>
      )}

      {/* Медиа */}
      {(image || audio || video) && (
        <div style={viewStyles.mediaSection}>
          {image && (
            <img
              src={mediaApi.getMediaUrl(image)}
              alt=""
              style={viewStyles.image}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}
          {audio && (
            <MiniAudioPlayer audioUrl={audio} currentTheme={currentTheme} />
          )}
          {video && (
            <video
              controls
              src={mediaApi.getMediaUrl(video)}
              style={viewStyles.video}
            />
          )}
        </div>
      )}
    </div>
  );
}

const viewStyles = {
  container: {
    padding: "14px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,249,250,0.9))",
    borderRadius: "10px",
    border: "1px solid var(--nt-border, #e0e0e0)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
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
  text: {
    fontSize: "15px",
    lineHeight: "1.6",
    marginBottom: "10px",
    wordBreak: "break-word",
  },
  ttsBtn: {
    display: "flex",
    alignItems: "center",
    padding: "6px 12px",
    border: "none",
    borderRadius: "8px",
    fontSize: "12px",
    transition: "all 0.2s",
    marginBottom: "10px",
  },
  mediaSection: {
    marginTop: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  image: {
    width: "100%",
    maxHeight: "150px",
    objectFit: "contain",
    borderRadius: "6px",
  },
  video: {
    width: "100%",
    maxHeight: "150px",
    borderRadius: "6px",
    background: "#000",
  },
};

/* ============================================================
   Стили модалки
   ============================================================ */

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
    zIndex: 1000,
  },
  modal: {
    padding: "24px",
    borderRadius: "16px",
    width: "95%",
    maxWidth: "900px",
    maxHeight: "85vh",
    overflowY: "auto",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  cardNumber: {
    fontSize: "14px",
    fontWeight: "700",
    color: "white",
    background: "var(--nt-primary, #3498db)",
    padding: "4px 12px",
    borderRadius: "12px",
  },
  headerRight: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  iconBtn: {
    width: "36px",
    height: "36px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  closeBtn: {
    width: "36px",
    height: "36px",
    border: "none",
    borderRadius: "50%",
    background: "rgba(0,0,0,0.08)",
    color: "#666",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  },
  twoColumns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
};
