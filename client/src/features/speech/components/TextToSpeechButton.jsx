import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh, faPlay, faPause, faSpinner } from "../../../utils/icons";
import { textToSpeech, getTtsAudioUrl } from "../api/speechApi";

/**
 * Кнопка озвучки текста (TTS)
 * Размещается ниже поля ввода текста
 */
export default function TextToSpeechButton({
  text,
  lang = "ru",
  currentTheme,
}) {
  const [synthesizing, setSynthesizing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  if (!text?.trim()) return null;

  const handleSynthesize = async (e) => {
    if (e) e.stopPropagation();
    setSynthesizing(true);
    setError(null);

    try {
      const result = await textToSpeech(text, lang);
      const url = getTtsAudioUrl(result.audio_url);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current
          .play()
          .catch((err) => console.error("Audio play error:", err));
        setPlaying(true);
      }
    } catch (err) {
      console.error("TTS error:", err);
      setError("Ошибка: " + (err.response?.data?.detail || err.message));
    } finally {
      setSynthesizing(false);
    }
  };

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div 
      style={styles.container}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={synthesizing ? null : handleSynthesize}
        disabled={synthesizing}
        style={{
          ...styles.button,
          background: synthesizing
            ? "var(--nt-text-secondary)"
            : `${currentTheme?.success || "var(--nt-success)"}15`,
          color: synthesizing ? "#fff" : currentTheme?.success || "var(--nt-success)",
          cursor: synthesizing ? "not-allowed" : "pointer",
        }}
        title="Озвучить текст"
      >
        <FontAwesomeIcon
          icon={synthesizing ? faSpinner : faVolumeHigh}
          spin={synthesizing}
        />
      </button>

      {playing && (
        <button
          onClick={togglePlay}
          style={{
            ...styles.button,
            background: `${currentTheme?.primary || "var(--nt-primary)"}15`,
            color: currentTheme?.primary || "var(--nt-primary)",
          }}
          title={playing ? "Пауза" : "Воспроизвести"}
        >
          <FontAwesomeIcon icon={playing ? faPause : faPlay} />
        </button>
      )}

      {error && <span style={styles.error}>{error}</span>}

      <audio
        ref={audioRef}
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        style={{ display: "none" }}
      />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "6px",
  },
  button: {
    width: "28px",
    height: "28px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    transition: "all 0.2s",
  },
  error: {
    fontSize: "11px",
    color: "var(--nt-error)",
  },
};
