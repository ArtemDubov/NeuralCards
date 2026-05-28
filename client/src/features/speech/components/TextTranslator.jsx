import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLanguage, faSpinner } from "../../../utils/icons";
import { translateText } from "../api/speechApi";

/**
 * Компонент для перевода текста через Google Translate
 */
export default function TextTranslator({
  currentTheme,
  text = "",
  targetLang = "en",
  onTranslate = null,
}) {
  const [translating, setTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("");
  const [error, setError] = useState("");

  // Доступные языки
  const languages = [
    { code: "en", name: "English" },
    { code: "ru", name: "Русский" },
    { code: "de", name: "Deutsch" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
    { code: "it", name: "Italiano" },
    { code: "zh-CN", name: "中文" },
    { code: "ja", name: "日本語" },
  ];

  // Перевод текста
  const handleTranslate = async () => {
    if (!text.trim()) {
      setError("Введите текст для перевода");
      return;
    }

    setTranslating(true);
    setError("");

    try {
      const result = await translateText(text, targetLang);
      setTranslatedText(result.translated_text);
      setSourceLang(result.source_lang || "");

      if (onTranslate) {
        onTranslate(result.translated_text);
      }
    } catch (error) {
      console.error("Ошибка перевода:", error);
      setError(
        "Ошибка перевода: " + (error.response?.data?.detail || error.message),
      );
    } finally {
      setTranslating(false);
    }
  };

  const getLangName = (code) => {
    const lang = languages.find((l) => l.code === code);
    return lang ? lang.name : code;
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
          <FontAwesomeIcon icon={faLanguage} style={{ marginRight: "6px" }} />
          Перевод текста
        </span>

        <select
          value={targetLang}
          onChange={(e) => onTranslate && onTranslate(e.target.value)}
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
        onClick={handleTranslate}
        disabled={translating || !text.trim()}
        style={{
          width: "100%",
          padding: "10px 16px",
          background: translating
            ? "#95a5a6"
            : currentTheme?.primary || "#3498db",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: translating || !text.trim() ? "not-allowed" : "pointer",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          transition: "background 0.2s",
          opacity: translating || !text.trim() ? 0.6 : 1,
        }}
      >
        {translating ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin />
            Перевод...
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faLanguage} />
            Перевести
          </>
        )}
      </button>

      {translatedText && (
        <div
          style={{
            marginTop: "12px",
            padding: "10px",
            background: "white",
            borderRadius: "6px",
            border: `1px solid ${currentTheme?.border || "#e0e0e0"}`,
          }}
        >
          {sourceLang && (
            <div
              style={{
                fontSize: "11px",
                color: currentTheme?.textSecondary || "#666",
                marginBottom: "6px",
              }}
            >
              Определён язык: {getLangName(sourceLang)}
            </div>
          )}
          <textarea
            value={translatedText}
            onChange={(e) => setTranslatedText(e.target.value)}
            style={{
              width: "100%",
              minHeight: "80px",
              border: "none",
              resize: "vertical",
              fontSize: "13px",
              fontFamily: "inherit",
              color: currentTheme?.text || "#333",
            }}
            placeholder="Переведённый текст..."
          />
        </div>
      )}
    </div>
  );
}
