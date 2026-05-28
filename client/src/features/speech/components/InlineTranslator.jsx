import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLanguage, faSpinner, faCheck } from "../../../utils/icons";
import { translateText } from "../api/speechApi";

/**
 * Компактный перевод текста
 * Размещается рядом с полем ввода
 */
export default function InlineTranslator({
  text,
  targetLang = "en",
  onTranslated,
  currentTheme,
}) {
  const [translating, setTranslating] = useState(false);
  const [translated, setTranslated] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [lang, setLang] = useState(targetLang);

  const languages = [
    { code: "en", name: "EN" },
    { code: "ru", name: "RU" },
    { code: "de", name: "DE" },
    { code: "fr", name: "FR" },
    { code: "es", name: "ES" },
    { code: "it", name: "IT" },
    { code: "zh-CN", name: "ZH" },
    { code: "ja", name: "JA" },
  ];

  if (!text?.trim()) return null;

  const handleTranslate = async (e) => {
    if (e) e.stopPropagation();
    setTranslating(true);
    try {
      const result = await translateText(text, lang);
      setTranslated(result.translated_text);
      setShowResult(true);
      if (onTranslated) onTranslated(result.translated_text);
    } catch (err) {
      console.error("Translate error:", err);
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div style={styles.container}>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        style={{
          ...styles.select,
          background: currentTheme?.background || "#fff",
          color: currentTheme?.text || "#333",
          borderColor: currentTheme?.border || "#ddd",
        }}
        title="Язык перевода"
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleTranslate}
        disabled={translating}
        style={{
          ...styles.button,
          background: translating
            ? "var(--nt-text-secondary)"
            : `${currentTheme?.primary || "var(--nt-primary)"}15`,
          color: translating ? "#fff" : currentTheme?.primary || "var(--nt-primary)",
          cursor: translating ? "not-allowed" : "pointer",
        }}
        title="Перевести текст"
      >
        <FontAwesomeIcon
          icon={translating ? faSpinner : faLanguage}
          spin={translating}
        />
      </button>

      {showResult && translated && (
        <div
          style={{
            ...styles.result,
            background: currentTheme?.backgroundSecondary || "var(--nt-background-secondary)",
            color: currentTheme?.text || "var(--nt-text)",
          }}
        >
          <FontAwesomeIcon icon={faCheck} style={{ color: "var(--nt-success)" }} />
          <span>{translated}</span>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "4px",
    position: "relative",
  },
  select: {
    padding: "3px 6px",
    border: "1px solid",
    borderRadius: "4px",
    fontSize: "11px",
    cursor: "pointer",
  },
  button: {
    width: "26px",
    height: "26px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    transition: "all 0.2s",
  },
  result: {
    position: "absolute",
    top: "100%",
    left: "0",
    right: "0",
    marginTop: "4px",
    padding: "6px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    zIndex: 100,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
};
