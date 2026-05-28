import React, { useState, useRef, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faStop, faSpinner } from "../../../utils/icons";
import axiosClient from "../../../shared/api/axiosClient";

/**
 * Голосовой ввод текста через серверный Whisper (STT)
 * Записывает аудио → отправляет на /api/speech/transcribe → вставляет текст
 */
export default function VoiceInput({
  value,
  onChange,
  lang = "ru-RU",
  currentTheme,
  placeholder,
  rows = 3,
  onLangDetected, // callback: (detectedLangCode) => void — Whisper detected language
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Карта языковых кодов для Whisper
  const whisperLang = lang.startsWith("ru")
    ? "ru"
    : lang.startsWith("en")
      ? "en"
      : lang.startsWith("de")
        ? "de"
        : lang.startsWith("fr")
          ? "fr"
          : lang.startsWith("es")
            ? "es"
            : lang.startsWith("it")
              ? "it"
              : lang.startsWith("zh")
                ? "zh"
                : lang.startsWith("ja")
                  ? "ja"
                  : null;

  const startRecording = useCallback(async () => {
    setError(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/ogg")
          ? "audio/ogg"
          : "";

      if (!mimeType) {
        setError("Браузер не поддерживает запись аудио");
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        // Отправляем на сервер для распознавания
        setIsProcessing(true);
        setError(null);
        try {
          const formData = new FormData();
          formData.append("file", blob, "voice.webm");

          const token = localStorage.getItem("access_token");
          const response = await fetch(
            `${process.env.REACT_APP_API_URL || "http://localhost:8081"}/api/speech/transcribe`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            },
          );

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Ошибка распознавания");
          }

          const data = await response.json();
          const recognizedText = data.text || "";
          const detectedLang = data.language || "";

          // Маппинг Whisper language codes → наши коды
          const langMap = {
            ru: "ru",
            en: "en",
            de: "de",
            fr: "fr",
            es: "es",
            it: "it",
            zh: "zh-CN",
            ja: "ja",
          };
          const normalizedLang = langMap[detectedLang] || detectedLang;

          if (onLangDetected && detectedLang && langMap[detectedLang]) {
            onLangDetected(langMap[detectedLang]);
          }

          if (recognizedText.trim()) {
            const cur = valueRef.current || "";
            onChange(
              cur
                ? `${cur} ${recognizedText.trim()}`.trim()
                : recognizedText.trim(),
            );
          } else {
            setError("Речь не распознана. Попробуйте ещё раз.");
          }
        } catch (err) {
          console.error("STT error:", err);
          setError("Ошибка: " + err.message);
        } finally {
          setIsProcessing(false);
          setIsRecording(false);
        }
      };

      recorder.start(1000); // timeslice = 1s
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setError("Нет доступа к микрофону");
      } else if (err.name === "NotFoundError") {
        setError("Микрофон не найден");
      } else {
        setError("Ошибка: " + err.message);
      }
    }
  }, [onChange]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    // isRecording и isProcessing будут установлены в onstop
  }, []);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const isActive = isRecording || isProcessing;

  return (
    <div style={styles.container}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          ...styles.textarea,
          borderColor: isRecording
            ? "#e74c3c"
            : isProcessing
              ? currentTheme?.primary || "#3498db"
              : currentTheme?.border || "#ddd",
          background: currentTheme?.background || "#fff",
          color: currentTheme?.text || "#333",
        }}
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          isRecording ? stopRecording() : startRecording();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        disabled={isProcessing}
        style={{
          ...styles.micButton,
          background: isProcessing
            ? "#95a5a6"
            : isRecording
              ? "#e74c3c"
              : `${currentTheme?.primary || "#3498db"}15`,
          color:
            isProcessing || isRecording
              ? "#fff"
              : currentTheme?.primary || "#3498db",
          cursor: isProcessing ? "not-allowed" : "pointer",
        }}
        title={
          isProcessing
            ? "Распознаю..."
            : isRecording
              ? "Остановить запись"
              : "Голосовой ввод"
        }
      >
        <FontAwesomeIcon
          icon={isProcessing ? faSpinner : isRecording ? faStop : faMicrophone}
          spin={isProcessing}
        />
      </button>

      {error && <div style={styles.error}>{error}</div>}

      {isRecording && (
        <div style={styles.listeningIndicator}>
          <span style={styles.recordingDot} />
          Запись... Нажмите стоп
        </div>
      )}
      {isProcessing && (
        <div style={{ ...styles.listeningIndicator, color: "var(--nt-primary)" }}>
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            style={{ marginRight: "4px" }}
          />
          Распознаю...
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    border: "2px solid",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  micButton: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    transition: "all 0.2s",
    zIndex: 1,
  },
  error: {
    marginTop: "4px",
    fontSize: "11px",
    color: "var(--nt-error)",
    background: "rgba(231,76,60,0.1)",
    padding: "6px 8px",
    borderRadius: "4px",
  },
  listeningIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "4px",
    fontSize: "12px",
    color: "var(--nt-error)",
  },
  recordingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "var(--nt-error)",
    animation: "pulse 1s infinite",
  },
};
