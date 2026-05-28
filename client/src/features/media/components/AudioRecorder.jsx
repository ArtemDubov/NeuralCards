import React, { useState, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faStop, faSpinner } from "../../../utils/icons";
import { mediaApi } from "../../media/api/mediaApi";

/**
 * Конвертирует любой аудио-blob в WAV формат
 * Использует AudioContext для декодирования и ручное кодирование в PCM WAV
 */
async function convertBlobToWav(blob) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = audioBuffer.length * blockAlign;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const buffer = new ArrayBuffer(totalLength);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, "RIFF");
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  // Interleave channels and write PCM data
  const channels = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true,
      );
      offset += 2;
    }
  }

  audioCtx.close();
  return new Blob([buffer], { type: "audio/wav" });
}

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Кнопка записи аудио через микрофон (MediaRecorder API)
 * Записывает в WAV и сразу загружает на сервер
 */
export default function AudioRecorder({ side, onAudioUrl, currentTheme }) {
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const startTimeRef = useRef(null);

  const startRecording = useCallback(async () => {
    setError(null);
    chunksRef.current = [];
    startTimeRef.current = Date.now();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;

      // Проверяем поддерживаемые типы
      const types = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/ogg",
        "",
      ];
      let mimeType = "";
      for (const t of types) {
        if (t && MediaRecorder.isTypeSupported(t)) {
          mimeType = t;
          break;
        }
      }

      if (!mimeType && !MediaRecorder.isTypeSupported("audio/webm")) {
        setError("Браузер не поддерживает запись аудио");
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      const options = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const elapsed = startTimeRef.current
          ? ((Date.now() - startTimeRef.current) / 1000).toFixed(1)
          : "?";

        const totalSize = chunksRef.current.reduce((sum, c) => sum + c.size, 0);

        if (totalSize === 0) {
          setError("Запись пуста. Попробуйте ещё раз.");
          setUploading(false);
          setIsRecording(false);
          return;
        }

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        chunksRef.current = [];

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        // Конвертируем в WAV для максимальной совместимости
        setUploading(true);
        try {
          const wavBlob = await convertBlobToWav(blob);

          const file = new File([wavBlob], `recording.wav`, {
            type: "audio/wav",
          });
          const response = await mediaApi.uploadAudio(file, side);
          onAudioUrl(response.file_url);
        } catch (err) {
          setError(
            "Ошибка загрузки: " +
              (err.response?.data?.detail || err.message || "неизвестно"),
          );
        } finally {
          setUploading(false);
          setIsRecording(false);
        }
      };

      recorder.onerror = (event) => {
        setError("Ошибка записи: " + event.error);
        setIsRecording(false);
      };

      // timeslice = 1000ms — собираем данные каждые секунду
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setError("Нет доступа к микрофону. Разрешите в браузере.");
      } else if (err.name === "NotFoundError") {
        setError("Микрофон не найден");
      } else if (err.name === "NotReadableError") {
        setError("Микрофон используется другим приложением");
      } else {
        setError("Ошибка: " + err.message);
      }
    }
  }, [side, onAudioUrl]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    // onstop обработчик установит setIsRecording(false)
  }, []);

  // Очистка при размонтировании
  React.useEffect(() => {
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

  return (
    <>
      {isRecording ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            stopRecording();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          style={{
            ...styles.recordingBtn,
            background: "var(--nt-error)",
            color: "#fff",
          }}
          title="Остановить запись"
        >
          <FontAwesomeIcon icon={faStop} />
        </button>
      ) : uploading ? (
        <div
          style={{
            ...styles.recordingBtn,
            background: "var(--nt-text-secondary)",
            cursor: "not-allowed",
          }}
        >
          <FontAwesomeIcon icon={faSpinner} spin />
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            startRecording();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          style={{
            ...styles.recordingBtn,
            background: `${currentTheme?.success || "var(--nt-success)"}15`,
            color: currentTheme?.success || "var(--nt-success)",
          }}
          title="Записать аудио с микрофона"
        >
          <FontAwesomeIcon icon={faMicrophone} />
        </button>
      )}

      {error && (
        <span style={styles.error} onClick={(e) => e.stopPropagation()}>
          {error}
        </span>
      )}
    </>
  );
}

const styles = {
  recordingBtn: {
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
  error: {
    fontSize: "10px",
    color: "var(--nt-error)",
    marginTop: "2px",
  },
};
