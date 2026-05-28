import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faVolumeHigh } from "../../../utils/icons";
import { mediaApi } from "../api/mediaApi";

/**
 * Миниатюрный аудиоплеер — используется везде (список, плитка, модалки)
 */
export default function MiniAudioPlayer({ audioUrl, currentTheme }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const src =
    audioUrl &&
    (audioUrl.startsWith("http://") ||
      audioUrl.startsWith("https://") ||
      audioUrl.startsWith("blob:"))
      ? audioUrl
      : mediaApi.getMediaUrl(audioUrl);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => setDuration(audio.duration);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setPlaying(false);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    audio.currentTime = percent * duration;
    setCurrentTime(percent * duration);
  };

  const handleVolume = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    audio.volume = percent;
    setVolume(percent);
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const accent = currentTheme?.primary || "var(--nt-primary)";
  const bg = currentTheme?.backgroundSecondary || "var(--nt-background-secondary)";
  const textCol = currentTheme?.text || "var(--nt-text)";

  return (
    <div
      style={styles.wrapper}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      <div style={styles.row}>
        <button
          onClick={togglePlay}
          style={{ ...styles.playBtn, background: accent, color: "#fff" }}
        >
          <FontAwesomeIcon icon={playing ? faPause : faPlay} />
        </button>
        <span style={{ ...styles.time, color: textCol }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <div
          style={{ ...styles.seekTrack, background: bg }}
          onClick={handleSeek}
        >
          <div
            style={{
              ...styles.seekFill,
              background: accent,
              width: `${progress}%`,
            }}
          />
        </div>
        <FontAwesomeIcon icon={faVolumeHigh} style={styles.volIcon} />
        <div
          style={{ ...styles.volumeTrack, background: bg }}
          onClick={handleVolume}
        >
          <div
            style={{
              ...styles.volumeFill,
              background: accent,
              width: `${volume * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    marginTop: "8px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 8px",
    borderRadius: "8px",
    background: "var(--nt-background-secondary, #f5f5f5)",
    border: "1px solid var(--nt-border, #e0e0e0)",
  },
  playBtn: {
    width: "24px",
    height: "24px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    flexShrink: 0,
  },
  time: {
    fontSize: "10px",
    fontWeight: "500",
    minWidth: "60px",
    flexShrink: 0,
    fontVariantNumeric: "tabular-nums",
  },
  seekTrack: {
    flex: 1,
    height: "5px",
    borderRadius: "3px",
    cursor: "pointer",
    overflow: "hidden",
  },
  seekFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.05s linear",
  },
  volIcon: {
    color: "var(--nt-text-muted, #999)",
    opacity: 0.5,
    fontSize: "11px",
    flexShrink: 0,
  },
  volumeTrack: {
    width: "40px",
    height: "4px",
    borderRadius: "2px",
    cursor: "pointer",
    overflow: "hidden",
    flexShrink: 0,
  },
  volumeFill: {
    height: "100%",
    borderRadius: "2px",
  },
};
