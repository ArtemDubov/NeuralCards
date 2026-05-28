import React, { useState } from "react";
import { useToast } from "../../../contexts/ToastContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { mediaApi } from "../api/mediaApi";
import {
  faImage,
  faMicrophone,
  faVideo,
  faUpload,
  faXmark,
  faVolumeHigh,
} from "../../../utils/icons";

/**
 * Компонент для загрузки и отображения медиа (изображения, аудио, видео)
 * Используется в модальных окнах добавления/редактирования карточек
 */
export default function MediaUploader({
  side, // 'front' или 'back'
  currentTheme,
  // Текущие медиа
  currentImage = null,
  currentAudio = null,
  currentVideo = null,
  // Callbacks
  onImageChange,
  onAudioChange,
  onVideoChange,
}) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(currentImage);
  const [previewAudio, setPreviewAudio] = useState(currentAudio);
  const [previewVideo, setPreviewVideo] = useState(currentVideo);

  // Обработка загрузки изображения
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await mediaApi.uploadImage(file, side);
      setPreviewImage(response.file_url);
      onImageChange(response.file_url);
    } catch (error) {
      toast.error(
        "Ошибка загрузки изображения: " +
          (error.response?.data?.detail || error.message),
      );
    } finally {
      setUploading(false);
    }
  };

  // Обработка загрузки аудио
  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await mediaApi.uploadAudio(file, side);
      setPreviewAudio(response.file_url);
      onAudioChange(response.file_url);
    } catch (error) {
      toast.error(
        "Ошибка загрузки аудио: " +
          (error.response?.data?.detail || error.message),
      );
    } finally {
      setUploading(false);
    }
  };

  // Обработка загрузки видео
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await mediaApi.uploadVideo(file, side);
      setPreviewVideo(response.file_url);
      onVideoChange(response.file_url);
    } catch (error) {
      toast.error(
        "Ошибка загрузки видео: " +
          (error.response?.data?.detail || error.message),
      );
    } finally {
      setUploading(false);
    }
  };

  // Удаление медиа
  const handleRemoveImage = () => {
    setPreviewImage(null);
    onImageChange(null);
  };

  const handleRemoveAudio = () => {
    setPreviewAudio(null);
    onAudioChange(null);
  };

  const handleRemoveVideo = () => {
    setPreviewVideo(null);
    onVideoChange(null);
  };

  const sideLabel = side === "front" ? "Лицевая" : "Обратная";

  return (
    <div style={styles.container}>
      <h4
        style={{ ...styles.sectionTitle, color: currentTheme?.text || "#333" }}
      >
        📎 Медиа ({sideLabel})
      </h4>

      {/* Изображение */}
      <div style={styles.mediaSection}>
        <label
          style={{
            ...styles.mediaLabel,
            color: currentTheme?.textSecondary || "#666",
          }}
        >
          <FontAwesomeIcon icon={faImage} style={{ marginRight: "6px" }} />
          Изображение:
        </label>

        {previewImage ? (
          <div style={styles.imagePreview}>
            <img
              src={mediaApi.getMediaUrl(previewImage)}
              alt={`${side} side`}
              style={styles.previewImage}
            />
            <button
              onClick={handleRemoveImage}
              style={styles.removeButton}
              disabled={uploading}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        ) : (
          <div style={styles.uploadButton}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              style={{ display: "none" }}
              id={`image-upload-${side}`}
            />
            <label htmlFor={`image-upload-${side}`} style={styles.uploadLabel}>
              <FontAwesomeIcon icon={faUpload} style={{ marginRight: "6px" }} />
              {uploading ? "Загрузка..." : "Загрузить изображение"}
            </label>
          </div>
        )}
      </div>

      {/* Аудио - две кнопки: микрофон и загрузка файла */}
      <div style={styles.mediaSection}>
        <label
          style={{
            ...styles.mediaLabel,
            color: currentTheme?.textSecondary || "#666",
          }}
        >
          <FontAwesomeIcon icon={faMicrophone} style={{ marginRight: "6px" }} />
          Аудио:
        </label>

        {previewAudio ? (
          <div style={styles.audioPreview}>
            <audio
              controls
              src={mediaApi.getMediaUrl(previewAudio)}
              style={styles.audioPlayer}
            />
            <button
              onClick={handleRemoveAudio}
              style={styles.removeButton}
              disabled={uploading}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            {/* Кнопка 1: Запись с микрофона */}
            <div style={styles.uploadButton}>
              <input
                type="file"
                accept="audio/*"
                capture="microphone"
                onChange={handleAudioUpload}
                disabled={uploading}
                style={{ display: "none" }}
                id={`audio-record-${side}`}
              />
              <label
                htmlFor={`audio-record-${side}`}
                style={{
                  ...styles.uploadLabel,
                  background: currentTheme?.primary || "var(--nt-primary)",
                  color: "white",
                }}
              >
                <FontAwesomeIcon
                  icon={faMicrophone}
                  style={{ marginRight: "6px" }}
                />
                {uploading ? "Запись..." : "Записать"}
              </label>
            </div>

            {/* Кнопка 2: Загрузка файла */}
            <div style={styles.uploadButton}>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                disabled={uploading}
                style={{ display: "none" }}
                id={`audio-upload-${side}`}
              />
              <label
                htmlFor={`audio-upload-${side}`}
                style={{
                  ...styles.uploadLabel,
                  background: currentTheme?.secondary || "var(--nt-background-secondary)",
                  color: currentTheme?.text || "var(--nt-text)",
                }}
              >
                <FontAwesomeIcon
                  icon={faVolumeHigh}
                  style={{ marginRight: "6px" }}
                />
                {uploading ? "Загрузка..." : "Загрузить"}
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Видео */}
      <div style={styles.mediaSection}>
        <label
          style={{
            ...styles.mediaLabel,
            color: currentTheme?.textSecondary || "#666",
          }}
        >
          <FontAwesomeIcon icon={faVideo} style={{ marginRight: "6px" }} />
          Видео:
        </label>

        {previewVideo ? (
          <div style={styles.videoPreview}>
            <video
              controls
              src={mediaApi.getMediaUrl(previewVideo)}
              style={styles.videoPlayer}
            />
            <button
              onClick={handleRemoveVideo}
              style={styles.removeButton}
              disabled={uploading}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        ) : (
          <div style={styles.uploadButton}>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              disabled={uploading}
              style={{ display: "none" }}
              id={`video-upload-${side}`}
            />
            <label htmlFor={`video-upload-${side}`} style={styles.uploadLabel}>
              <FontAwesomeIcon icon={faUpload} style={{ marginRight: "6px" }} />
              {uploading ? "Загрузка..." : "Загрузить видео"}
            </label>
          </div>
        )}
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
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: "600",
  },
  mediaSection: {
    marginBottom: "12px",
  },
  mediaLabel: {
    display: "block",
    fontSize: "13px",
    marginBottom: "6px",
  },
  imagePreview: {
    position: "relative",
    display: "inline-block",
    maxWidth: "100%",
  },
  previewImage: {
    maxWidth: "100%",
    maxHeight: "200px",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
  },
  audioPreview: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  audioPlayer: {
    flex: 1,
    maxWidth: "400px",
  },
  videoPreview: {
    position: "relative",
    display: "inline-block",
    maxWidth: "100%",
  },
  videoPlayer: {
    maxWidth: "100%",
    maxHeight: "200px",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
  },
  uploadButton: {
    display: "inline-block",
  },
  uploadLabel: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 16px",
    background: "var(--nt-background-secondary, #e0e0e0)",
    color: "var(--nt-text, #333)",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    transition: "background 0.2s",
  },
  removeButton: {
    position: "absolute",
    top: "4px",
    right: "4px",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "rgba(231, 76, 60, 0.9)",
    color: "white",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    transition: "background 0.2s",
  },
};
