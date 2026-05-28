import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh, faPlay, faPause, faSpinner } from "../../../utils/icons";
import { textToSpeech, getTtsAudioUrl } from "../api/speechApi";

/**
 * Компонент для синтеза речи из текста (TTS)
 */
export default function TextToSpeech({
  currentTheme,
  text = "",
  lang = "ru",
  onLangChange = null,
}) {
  const [synthesizing, setSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef(null);

  // Доступные языки
  const languages = [
    { code: "ru", name: "Русский" },
    { code: "en", name: "English" },
    { code: "de", name: "Deutsch" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
    { code: "it", name: "Italiano" },
    { code: "zh-CN", name: "中文" },
    { code: "ja", name: "日本語" },
  ];

  // Синтез речи
  const handleSynthesize = async () => {
    if (!text.trim()) {
      setError("Введите текст для озвучки");
      return;
    }

    setSynthesizing(true);
    setError("");

    try {
      const result = await textToSpeech(text, lang);
      const url = getTtsAudioUrl(result.audio_url);
      setAudioUrl(url);
    } catch (error) {
      console.error("Ошибка синтеза:", error);
      setError(
        "Ошибка синтеза речи: " +
          (error.response?.data?.detail || error.message),
      );
    } finally {
      setSynthesizing(false);
    }
  };

  // Воспроизведение
  const handlePlay = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  // Окончание воспроизведения
  const handleAudioEnded = () => {
    setPlaying(false);
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
          <FontAwesomeIcon icon={faVolumeHigh} style={{ marginRight: "6px" }} />
          Синтез речи
        </span>

        {onLangChange && (
          <select
            value={lang}
            onChange={(e) => onLangChange(e.target.value)}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              border: `1px solid ${currentTheme?.border || "#e0e0e0"}`,
              fontSize: "12px",
              background: "white",
              color: currentTheme?.text || "#333",
              cursor: "pointer",
            }}
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
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

      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <button
          onClick={handleSynthesize}
          disabled={synthesizing || !text.trim()}
          style={{
            flex: 1,
            padding: "10px 16px",
            background: synthesizing
              ? "#95a5a6"
              : currentTheme?.primary || "#3498db",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: synthesizing || !text.trim() ? "not-allowed" : "pointer",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "background 0.2s",
            opacity: synthesizing || !text.trim() ? 0.6 : 1,
          }}
        >
          {synthesizing ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              Синтез...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faVolumeHigh} />
              Озвучить текст
            </>
          )}
        </button>

        {audioUrl && (
          <button
            onClick={handlePlay}
            style={{
              padding: "10px 16px",
              background: playing
                ? currentTheme?.warning || "#f39c12"
                : currentTheme?.success || "#27ae60",
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
          >
            <FontAwesomeIcon icon={playing ? faPause : faPlay} />
          </button>
        )}
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnded}
          onPause={() => setPlaying(false)}
          style={{ display: "none" }}
        />
      )}
    </div>
  );
}
