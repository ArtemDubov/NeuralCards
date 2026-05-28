import React, { useState, useRef, useEffect } from "react";

/**
 * Компонент для отображения названия с обрезкой и тултипом
 * Если название длиннее maxLength, показывает обрезанный текст с многоточием.
 * При наведении появляется тултип с полным названием.
 */
export default function TitleOverflow({
  text = "",
  maxLength = 40,
  currentTheme,
  style = {},
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const ref = useRef(null);

  const isTruncated = text.length > maxLength;
  const displayText = isTruncated ? text.slice(0, maxLength) + "..." : text;

  useEffect(() => {
    if (showTooltip && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [showTooltip]);

  if (!text) return null;

  return (
    <div style={{ position: "relative", display: "inline-block", ...style }}>
      <span
        ref={ref}
        style={{
          cursor: isTruncated ? "pointer" : "default",
        }}
        onMouseEnter={() => isTruncated && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {displayText}
      </span>

      {showTooltip && isTruncated && (
        <div
          style={{
            position: "fixed",
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            background: currentTheme?.surface || "#fff",
            border: `1px solid ${currentTheme?.border || "#e0e0e0"}`,
            borderRadius: "8px",
            padding: "8px 12px",
            boxShadow: `0 4px 12px ${currentTheme?.cardShadow || "rgba(0,0,0,0.15)"}`,
            zIndex: 1000,
            maxWidth: "280px",
            fontSize: "13px",
            lineHeight: "1.4",
            color: currentTheme?.text || "#333",
            fontWeight: "600",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}
