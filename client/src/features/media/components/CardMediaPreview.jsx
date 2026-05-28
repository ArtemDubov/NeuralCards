import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { mediaApi } from "../api/mediaApi";
import {
  faMicrophone,
  faPlay,
  faVolumeHigh,
  faXmark,
  faImage,
} from "../../../utils/icons";

/**
 * Компонент превью медиа для карточек в списке/плитке.
 * Горизонтальный layout: слева — медиа лицевой стороны, справа — обратной.
 * Два режима: compact (маленькие превью) и full (крупные превью).
 */
export default function CardMediaPreview({
  frontImage = null,
  frontAudio = null,
  frontVideo = null,
  backImage = null,
  backAudio = null,
  backVideo = null,
  mode = "compact",
  currentTheme,
}) {
  const [playingAudio, setPlayingAudio] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(null);
  const [audioEl, setAudioEl] = useState(null);

  const hasFrontMedia = frontImage || frontAudio || frontVideo;
  const hasBackMedia = backImage || backAudio || backVideo;

  if (!hasFrontMedia && !hasBackMedia) return null;

  const handlePlayAudio = (side, src) => {
    if (playingAudio === side) {
      audioEl?.pause();
      setPlayingAudio(null);
      setAudioEl(null);
    } else {
      audioEl?.pause();
      const audio = new Audio(mediaApi.getMediaUrl(src));
      audio.onended = () => {
        setPlayingAudio(null);
        setAudioEl(null);
      };
      audio.play();
      setPlayingAudio(side);
      setAudioEl(audio);
    }
  };

  const isCompact = mode === "compact";

  return (
    <div style={isCompact ? styles.compactWrapper : styles.fullWrapper}>
      {/* Лицевая сторона */}
      <div
        style={{
          ...(isCompact ? styles.compactSide : styles.fullSide),
          borderRight: isCompact ? `1px solid ${currentTheme.border}` : "none",
        }}
      >
        {frontImage && (
          <ImageWithPlaceholder src={frontImage} isCompact={isCompact} />
        )}
        {frontVideo && (
          <VideoThumb
            src={frontVideo}
            onClick={() => setShowVideoModal("front")}
            isCompact={isCompact}
          />
        )}
        {frontAudio && (
          <AudioButton
            isPlaying={playingAudio === "front"}
            onClick={() => handlePlayAudio("front", frontAudio)}
            currentTheme={currentTheme}
            isCompact={isCompact}
          />
        )}
      </div>

      {/* Обратная сторона */}
      <div style={isCompact ? styles.compactSide : styles.fullSide}>
        {backImage && (
          <ImageWithPlaceholder src={backImage} isCompact={isCompact} />
        )}
        {backVideo && (
          <VideoThumb
            src={backVideo}
            onClick={() => setShowVideoModal("back")}
            isCompact={isCompact}
          />
        )}
        {backAudio && (
          <AudioButton
            isPlaying={playingAudio === "back"}
            onClick={() => handlePlayAudio("back", backAudio)}
            currentTheme={currentTheme}
            isCompact={isCompact}
          />
        )}
      </div>

      {/* Видео модалка */}
      {showVideoModal && (
        <VideoModal
          src={showVideoModal === "front" ? frontVideo : backVideo}
          onClose={() => setShowVideoModal(null)}
          currentTheme={currentTheme}
        />
      )}
    </div>
  );
}

/* --- Изображение с placeholder при ошибке --- */

function ImageWithPlaceholder({ src, isCompact }) {
  const [error, setError] = useState(false);
  const imageUrl = mediaApi.getMediaUrl(src);

  if (error) {
    return (
      <div
        style={{
          ...(isCompact ? styles.compactImage : styles.fullImage),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--nt-background-secondary, #f5f5f5)",
          border: `1px dashed var(--nt-border, #ddd)`,
        }}
      >
        <FontAwesomeIcon
          icon={faImage}
          style={{
            fontSize: isCompact ? "16px" : "24px",
            color: "var(--nt-text-muted, #999)",
          }}
        />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt=""
      style={isCompact ? styles.compactImage : styles.fullImage}
      onError={() => setError(true)}
    />
  );
}

/* --- Миниатюра видео с первым кадром --- */

function VideoThumb({ src, onClick, isCompact }) {
  const videoUrl = mediaApi.getMediaUrl(src);

  if (isCompact) {
    return (
      <div
        style={compactStyles.videoThumb}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        title="Открыть видео"
      >
        <video
          src={videoUrl}
          style={compactStyles.videoThumbVideo}
          preload="metadata"
          muted
        />
        <div style={compactStyles.videoOverlay}>
          <FontAwesomeIcon icon={faPlay} style={compactStyles.playIcon} />
        </div>
      </div>
    );
  }

  return (
    <div
      style={fullStyles.videoContainer}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <video src={videoUrl} style={fullStyles.video} preload="metadata" muted />
      <div style={fullStyles.videoOverlay}>
        <FontAwesomeIcon icon={faPlay} style={fullStyles.playIcon} />
      </div>
    </div>
  );
}

/* --- Кнопка аудио --- */

function AudioButton({ isPlaying, onClick, currentTheme, isCompact }) {
  if (isCompact) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        style={{
          ...compactStyles.audioBtn,
          background: isPlaying
            ? currentTheme.success
            : `${currentTheme.success}20`,
          color: isPlaying ? "#fff" : currentTheme.success,
        }}
        title={isPlaying ? "Остановить" : "Воспроизвести аудио"}
      >
        <FontAwesomeIcon icon={isPlaying ? faVolumeHigh : faMicrophone} />
      </button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        ...fullStyles.audioBtn,
        background: isPlaying
          ? currentTheme.success
          : `${currentTheme.success}15`,
        color: isPlaying ? "#fff" : currentTheme.success,
      }}
      title={isPlaying ? "Остановить" : "Воспроизвести аудио"}
    >
      <FontAwesomeIcon icon={isPlaying ? faVolumeHigh : faMicrophone} />
      <span>{isPlaying ? "Играет..." : "Аудио"}</span>
    </button>
  );
}

/* --- Видео модалка --- */

function VideoModal({ src, onClose, currentTheme }) {
  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div
        style={{ ...modalStyles.modal, background: currentTheme.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={modalStyles.header}>
          <h3 style={{ color: currentTheme.text, margin: 0 }}>
            Просмотр видео
          </h3>
          <button
            onClick={onClose}
            style={{
              ...modalStyles.closeBtn,
              background: `${currentTheme.textMuted}20`,
              color: currentTheme.textMuted,
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <video
          src={mediaApi.getMediaUrl(src)}
          controls
          autoPlay
          style={modalStyles.video}
        />
      </div>
    </div>
  );
}

/* ==================== Стили ==================== */

const modalStyles = {
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
    zIndex: 3000,
  },
  modal: {
    width: "90%",
    maxWidth: "700px",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid var(--nt-border, #ddd)",
  },
  closeBtn: {
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
  },
  video: {
    width: "100%",
    maxHeight: "70vh",
    display: "block",
  },
};

const styles = {
  // Compact wrapper — горизонтальный
  compactWrapper: {
    display: "flex",
    gap: "0",
    marginTop: "8px",
    borderRadius: "8px",
    overflow: "hidden",
    border: `1px solid var(--nt-border, #ddd)`,
    background: "var(--nt-background-secondary, #f5f5f5)",
  },

  // Full wrapper — горизонтальный
  fullWrapper: {
    display: "flex",
    gap: "12px",
    marginTop: "12px",
  },

  // Сторона в compact режиме
  compactSide: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 8px",
    minHeight: "48px",
  },

  // Сторона в full режиме
  fullSide: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    borderRadius: "8px",
    overflow: "hidden",
    border: `1px solid var(--nt-border, #ddd)`,
    background: "var(--nt-surface, #ffffff)",
    padding: "8px",
  },

  // Изображение в compact
  compactImage: {
    width: "40px",
    height: "40px",
    objectFit: "cover",
    borderRadius: "6px",
    border: `1px solid var(--nt-border, #ddd)`,
    flexShrink: 0,
  },

  // Изображение в full
  fullImage: {
    width: "100%",
    maxHeight: "180px",
    objectFit: "contain",
    display: "block",
    borderRadius: "4px",
  },
};

const compactStyles = {
  videoThumb: {
    position: "relative",
    width: "40px",
    height: "40px",
    borderRadius: "6px",
    overflow: "hidden",
    border: "1px solid var(--nt-border, #ddd)",
    cursor: "pointer",
    flexShrink: 0,
    background: "#000",
  },
  videoThumbVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    fontSize: "14px",
    color: "#fff",
  },
  audioBtn: {
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    transition: "all 0.2s",
    flexShrink: 0,
  },
};

const fullStyles = {
  videoContainer: {
    position: "relative",
    cursor: "pointer",
    borderRadius: "4px",
    overflow: "hidden",
  },
  video: {
    width: "100%",
    maxHeight: "180px",
    objectFit: "contain",
    display: "block",
    borderRadius: "4px",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  },
  playIcon: {
    fontSize: "36px",
    color: "#fff",
  },
  audioBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "all 0.2s",
    alignSelf: "flex-start",
    margin: "4px 8px",
  },
};
