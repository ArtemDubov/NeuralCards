import React, { useState } from "react";
import { useToast } from "../../../contexts/ToastContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh, faUpload, faXmark } from "../../../utils/icons";
import { mediaApi } from "../../media/api/mediaApi";

/**
 * Компонент для загрузки готовых аудиофайлов
 * Отличается от MediaUploader тем, что использует иконку динамика
 */
export default function AudioUploader({
  currentTheme,
  side = "front",
  currentAudio = null,
  onAudioChange,
}) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewAudio, setPreviewAudio] = useState(currentAudio);

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

  // Удаление аудио
  const handleRemoveAudio = () => {
    setPreviewAudio(null);
    onAudioChange(null);
  };

  const sideLabel = side === "front" ? "Лицевая" : "Обратная";

  return (
    <div
      style={{
        padding: "12px",
        background: currentTheme?.background || "var(--nt-background)",
        borderRadius: "8px",
        border: `1px solid ${currentTheme?.border || "var(--nt-border)"}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: currentTheme?.text || "#333",
          }}
        >
          <FontAwesomeIcon icon={faVolumeHigh} style={{ marginRight: "6px" }} />
          Загрузка аудио ({sideLabel})
        </span>
      </div>

      {previewAudio ? (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <audio
            controls
            src={mediaApi.getMediaUrl(previewAudio)}
            style={{ flex: 1 }}
          />
          <button
            onClick={handleRemoveAudio}
            disabled={uploading}
            style={{
              width: "32px",
              height: "32px",
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
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      ) : (
        <div>
          <input
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            disabled={uploading}
            style={{ display: "none" }}
            id={`audio-upload-file-${side}`}
          />
          <label
            htmlFor={`audio-upload-file-${side}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 16px",
              background: currentTheme?.secondary || "var(--nt-background-secondary)",
              color: currentTheme?.text || "var(--nt-text)",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              transition: "background 0.2s",
              gap: "6px",
            }}
          >
            <FontAwesomeIcon icon={faUpload} />
            {uploading ? "Загрузка..." : "Загрузить аудиофайл"}
          </label>
        </div>
      )}
    </div>
  );
}
