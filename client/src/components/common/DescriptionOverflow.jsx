import React, { useState, useRef, useEffect } from "react";

/**
 * Компонент для отображения описания в ОДНУ строку.
 * Если текст влезает — показывает полностью без модалки.
 * Если НЕ влезает — показывает с многоточием и модалкой при наведении.
 */
export default function DescriptionOverflow({ text = "", currentTheme }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const textRef = useRef(null);

  // Проверяем, обрезается ли текст
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    // scrollWidth — реальная ширина контента, clientWidth — видимая
    setIsTruncated(el.scrollWidth > el.clientWidth);
  }, [text]);

  useEffect(() => {
    if (showTooltip && textRef.current) {
      const rect = textRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 6,
        left: rect.left,
      });
    }
  }, [showTooltip]);

  if (!text) return null;

  // Если текст не обрезан — просто выводим, без модалки
  if (!isTruncated) {
    return (
      <span
        ref={textRef}
        style={{
          fontSize: "14px",
          lineHeight: "1.5",
          color: currentTheme?.textSecondary || "#666",
        }}
      >
        {text}
      </span>
    );
  }

  // Текст обрезан — с многоточием и модалкой
  return (
    <div style={{ position: "relative", display: "block", width: "100%" }}>
      <span
        ref={textRef}
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 1,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontSize: "14px",
          lineHeight: "1.5",
          color: currentTheme?.textSecondary || "#666",
          cursor: "pointer",
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {text}
      </span>

      {showTooltip && (
        <div
          style={{
            position: "fixed",
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            background: currentTheme?.surface || "var(--nt-surface)",
            border: `1px solid ${currentTheme?.border || "var(--nt-border)"}`,
            borderRadius: "8px",
            padding: "8px 12px",
            boxShadow: `0 4px 12px ${currentTheme?.cardShadow || "rgba(0,0,0,0.15)"}`,
            zIndex: 1000,
            maxWidth: "320px",
            fontSize: "13px",
            lineHeight: "1.5",
            color: currentTheme?.text || "#333",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}
