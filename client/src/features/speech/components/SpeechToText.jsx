import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faSpinner, faCheck } from "../../../utils/icons";
import { transcribeAudio } from "../api/speechApi";

/**
 * Компонент для распознавания речи из аудиофайла (STT)
 */
export default function SpeechToText({
  currentTheme,
  audioFile = null,
  onTextRecognized,
}) {
  const [recognizing, setRecognizing] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [error, setError] = useState("");

  // Распознавание речи
  const handleRecognize = async () => {
    if (!audioFile) {
      setError("Сначала запишите или загрузите аудио");
      return;
    }

    setRecognizing(true);
    setError("");

    try {
      // Если audioFile это Blob (запись с микрофона)
      let fileToSend = audioFile;

      // Если audioFile это строка (URL загруженного файла), нужно скачать
      if (typeof audioFile === "string") {
        const response = await fetch(audioFile);
        fileToSend = await response.blob();
      }

      const result = await transcribeAudio(fileToSend);
      setRecognizedText(result.text);

      if (onTextRecognized) {
        onTextRecognized(result.text);
      }
    } catch (error) {
      console.error("Ошибка распознавания:", error);
      setError(
        "Ошибка распознавания: " +
          (error.response?.data?.detail || error.message),
      );
    } finally {
      setRecognizing(false);
    }
  };

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
          <FontAwesomeIcon icon={faMicrophone} style={{ marginRight: "6px" }} />
          Распознавание речи
        </span>

        {recognizedText && (
          <span
            style={{
              color: currentTheme?.success || "var(--nt-success)",
              fontSize: "12px",
            }}
          >
            <FontAwesomeIcon icon={faCheck} style={{ marginRight: "4px" }} />
            Распознано
          </span>
        )}
      </div>

      {error && (
        <div
          style={{
            padding: "8px",
            background: "rgba(231,76,60,0.1)",
            color: "var(--nt-error)",
            borderRadius: "4px",
            fontSize: "12px",
            marginBottom: "8px",
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleRecognize}
        disabled={recognizing || !audioFile}
        style={{
          width: "100%",
          padding: "10px 16px",
          background: recognizing
            ? "#95a5a6"
            : currentTheme?.primary || "#3498db",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: recognizing ? "not-allowed" : "pointer",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          transition: "background 0.2s",
          opacity: recognizing || !audioFile ? 0.6 : 1,
        }}
      >
        {recognizing ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin />
            Распознавание...
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faMicrophone} />
            Распознать речь
          </>
        )}
      </button>

      {recognizedText && (
        <div
          style={{
            marginTop: "12px",
            padding: "10px",
            background: "white",
            borderRadius: "6px",
            border: `1px solid ${currentTheme?.border || "#e0e0e0"}`,
          }}
        >
          <textarea
            value={recognizedText}
            onChange={(e) => {
              setRecognizedText(e.target.value);
              if (onTextRecognized) {
                onTextRecognized(e.target.value);
              }
            }}
            style={{
              width: "100%",
              minHeight: "80px",
              border: "none",
              resize: "vertical",
              fontSize: "13px",
              fontFamily: "inherit",
              color: currentTheme?.text || "#333",
            }}
            placeholder="Распознанный текст..."
          />
        </div>
      )}
    </div>
  );
}
