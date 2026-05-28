import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faVolumeHigh,
  faLanguage,
  faChevronDown,
  faChevronUp,
} from "../../../utils/icons";
import AudioRecorder from "./AudioRecorder";
import AudioUploader from "./AudioUploader";
import SpeechToText from "./SpeechToText";
import TextToSpeech from "./TextToSpeech";
import TextTranslator from "./TextTranslator";

/**
 * Главная панель speech-функций
 * Объединяет: запись с микрофона, загрузку аудио, STT, TTS и перевод
 */
export default function SpeechPanel({
  currentTheme,
  side = "front",
  // Для TTS и перевода
  text = "",
  lang = "ru",
  onTextChange = null,
  onLangChange = null,
}) {
  const [activeTab, setActiveTab] = useState("record"); // 'record' | 'upload' | 'stt' | 'tts' | 'translate'
  const [expanded, setExpanded] = useState(true);

  // Аудио из записи
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recognizedText, setRecognizedText] = useState("");

  const tabs = [
    { id: "record", label: "Запись", icon: faMicrophone },
    { id: "upload", label: "Загрузка", icon: faVolumeHigh },
    { id: "stt", label: "STT", icon: faMicrophone },
    { id: "tts", label: "TTS", icon: faVolumeHigh },
    { id: "translate", label: "Перевод", icon: faLanguage },
  ];

  const handleRecordingComplete = (audioBlob) => {
    setRecordedAudio(audioBlob);
    if (audioBlob) {
      // Автоматически переключаем на STT
      setActiveTab("stt");
    }
  };

  const handleTextRecognized = (text) => {
    setRecognizedText(text);
    if (onTextChange) {
      onTextChange(text);
    }
  };

  return (
    <div
      style={{
        background: currentTheme?.cardBackground || "var(--nt-surface)",
        borderRadius: "8px",
        border: `1px solid ${currentTheme?.border || "var(--nt-border)"}`,
        overflow: "hidden",
      }}
    >
      {/* Заголовок панели */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: "12px 16px",
          background: currentTheme?.primary || "var(--nt-primary)",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "background 0.2s",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: "600" }}>
          Аудио и перевод
        </span>
        <FontAwesomeIcon
          icon={expanded ? faChevronUp : faChevronDown}
          style={{ fontSize: "12px" }}
        />
      </div>

      {expanded && (
        <>
          {/* Табы */}
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${currentTheme?.border || "var(--nt-border)"}`,
              background: currentTheme?.background || "var(--nt-background)",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: "10px 8px",
                  background:
                    activeTab === tab.id
                      ? currentTheme?.cardBackground || "#ffffff"
                      : "transparent",
                  border: "none",
                  borderBottom:
                    activeTab === tab.id
                      ? `2px solid ${currentTheme?.primary || "#3498db"}`
                      : "2px solid transparent",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: activeTab === tab.id ? "600" : "400",
                  color:
                    activeTab === tab.id
                      ? currentTheme?.primary || "#3498db"
                      : currentTheme?.textSecondary || "#666",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.2s",
                }}
              >
                <FontAwesomeIcon icon={tab.icon} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Контент табов */}
          <div style={{ padding: "16px" }}>
            {activeTab === "record" && (
              <AudioRecorder
                currentTheme={currentTheme}
                side={side}
                onRecordingComplete={handleRecordingComplete}
              />
            )}

            {activeTab === "upload" && (
              <AudioUploader
                currentTheme={currentTheme}
                side={side}
                onAudioChange={() => {}}
              />
            )}

            {activeTab === "stt" && (
              <SpeechToText
                currentTheme={currentTheme}
                audioFile={recordedAudio}
                onTextRecognized={handleTextRecognized}
              />
            )}

            {activeTab === "tts" && (
              <TextToSpeech
                currentTheme={currentTheme}
                text={text || recognizedText}
                lang={lang}
                onLangChange={onLangChange}
              />
            )}

            {activeTab === "translate" && (
              <TextTranslator
                currentTheme={currentTheme}
                text={text || recognizedText}
                targetLang={lang}
                onTranslate={onLangChange}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
