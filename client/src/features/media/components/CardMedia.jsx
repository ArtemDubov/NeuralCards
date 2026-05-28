import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { mediaApi } from "../api/mediaApi";
import {
  faPlay,
  faPause,
  faMicrophone,
  faVideo,
  faVolumeHigh,
  faVolumeXmark,
} from "../../../utils/icons";

/**
 * Компонент для отображения медиа на карточке
 * Используется в режимах тренировки
 */
export default function CardMedia({
  // Медиа для отображения
  image = null,
  audio = null,
  video = null,
  // Настройки воспроизведения
  autoPlay = false,
  playEnabled = true,
  // Событие завершения воспроизведения
  onMediaComplete,
  currentTheme,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  // Автовоспроизведение при монтировании
  useEffect(() => {
    if (autoPlay && playEnabled) {
      if (audio && audioRef.current) {
        audioRef.current.play().catch(() => {
          // Автовоспроизведение заблокировано браузером
          console.log("Autoplay blocked");
        });
      }
      if (video && videoRef.current) {
        videoRef.current.play().catch(() => {
          console.log("Autoplay blocked");
        });
      }
    }
  }, [autoPlay, playEnabled, audio, video]);

  // Обработка завершения воспроизведения
  const handleAudioEnd = () => {
    setIsPlaying(false);
    if (onMediaComplete) onMediaComplete();
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (onMediaComplete) onMediaComplete();
  };

  // Управление воспроизведением
  const togglePlay = () => {
    if (audio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
    if (video && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audio && audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    if (video && videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  if (!image && !audio && !video) {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Изображение */}
      {image && (
        <div style={styles.imageContainer}>
          <img
            src={mediaApi.getMediaUrl(image)}
            alt="Card media"
            style={styles.image}
          />
        </div>
      )}

      {/* Аудио/Видео контролы */}
      {(audio || video) && (
        <div style={styles.controlsContainer}>
          {/* Скрытые плееры для управления */}
          {audio && (
            <audio
              ref={audioRef}
              src={mediaApi.getMediaUrl(audio)}
              onEnded={handleAudioEnd}
              style={{ display: "none" }}
            />
          )}
          {video && (
            <video
              ref={videoRef}
              src={mediaApi.getMediaUrl(video)}
              onEnded={handleVideoEnd}
              style={{ display: "none" }}
            />
          )}

          {/* Кнопки управления */}
          <div style={styles.controls}>
            {playEnabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                style={{
                  ...styles.controlButton,
                  background: isPlaying
                    ? currentTheme?.primary || "var(--nt-primary)"
                    : currentTheme?.backgroundSecondary || "var(--nt-background-secondary)",
                  color: isPlaying ? "#fff" : currentTheme?.text || "var(--nt-text)",
                }}
                title={isPlaying ? "Пауза" : "Воспроизвести"}
              >
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              style={{
                ...styles.controlButton,
                background: currentTheme?.backgroundSecondary || "var(--nt-background-secondary)",
                color: currentTheme?.text || "var(--nt-text)",
              }}
              title={isMuted ? "Включить звук" : "Выключить звук"}
            >
              <FontAwesomeIcon icon={isMuted ? faVolumeXmark : faVolumeHigh} />
            </button>

            {/* Индикатор типа медиа */}
            {audio && !video && (
              <span style={styles.mediaIndicator}>
                <FontAwesomeIcon icon={faMicrophone} /> Аудио
              </span>
            )}
            {video && (
              <span style={styles.mediaIndicator}>
                <FontAwesomeIcon icon={faVideo} /> Видео
              </span>
            )}
          </div>

          {/* Видео превью */}
          {video && (
            <div style={styles.videoContainer}>
              <video
                src={mediaApi.getMediaUrl(video)}
                onEnded={handleVideoEnd}
                style={styles.video}
                controls={!playEnabled}
                autoPlay={autoPlay && playEnabled}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    margin: "12px 0",
  },
  imageContainer: {
    textAlign: "center",
    marginBottom: "12px",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "300px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    objectFit: "contain",
  },
  controlsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  controlButton: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    transition: "all 0.2s",
  },
  mediaIndicator: {
    fontSize: "12px",
    padding: "4px 12px",
    background: "var(--nt-background-secondary, #e0e0e0)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  videoContainer: {
    width: "100%",
    maxWidth: "500px",
  },
  video: {
    width: "100%",
    maxHeight: "300px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  },
};
