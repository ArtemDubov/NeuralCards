import React, { useState, useRef, useEffect } from "react";
import { useToast } from "../../../contexts/ToastContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faStop } from "../../../utils/icons";

/**
 * Компонент для записи аудио с микрофона
 * Использует браузерный MediaRecorder API
 */
export default function AudioRecorder({
  currentTheme,
  onRecordingComplete,
  side = "front",
}) {
  const toast = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Начало записи
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(url);

        // Останавливаем все треки
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        // Передаём blob родителю
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Запускаем таймер
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Ошибка доступа к микрофону:", error);
      toast.error(
        "Не удалось получить доступ к микрофону. Проверьте разрешения браузера.",
      );
    }
  };

  // Остановка записи
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Сброс записи
  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    if (onRecordingComplete) {
      onRecordingComplete(null);
    }
  };

  // Форматирование времени
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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
          <FontAwesomeIcon icon={faMicrophone} style={{ marginRight: "6px" }} />
          Запись аудио ({sideLabel})
        </span>

        {isRecording && (
          <span
            style={{
              fontSize: "12px",
              color: "var(--nt-error)",
              fontWeight: "600",
              animation: "pulse 1s infinite",
            }}
          >
            ● {formatTime(recordingTime)}
          </span>
        )}
      </div>

      {!audioBlob ? (
        <div style={{ display: "flex", gap: "8px" }}>
          {!isRecording ? (
            <button
              onClick={startRecording}
              style={{
                flex: 1,
                padding: "10px 16px",
                background: currentTheme?.primary || "var(--nt-primary)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.target.style.background =
                  currentTheme?.primaryDark || "var(--nt-primary-dark)")
              }
              onMouseLeave={(e) =>
                (e.target.style.background = currentTheme?.primary || "var(--nt-primary)")
              }
            >
              <FontAwesomeIcon icon={faMicrophone} />
              Начать запись
            </button>
          ) : (
            <button
              onClick={stopRecording}
              style={{
                flex: 1,
                padding: "10px 16px",
                background: "var(--nt-error)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "var(--nt-error-dark)")}
              onMouseLeave={(e) => (e.target.style.background = "var(--nt-error)")}
            >
              <FontAwesomeIcon icon={faStop} />
              Остановить
            </button>
          )}
        </div>
      ) : (
        <div>
          <audio
            controls
            src={audioUrl}
            style={{ width: "100%", marginBottom: "8px" }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={resetRecording}
              style={{
                flex: 1,
                padding: "8px 12px",
                background: "var(--nt-text-secondary)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Перезаписать
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
