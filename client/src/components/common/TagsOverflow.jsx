import React, { useState, useRef, useEffect } from "react";

/**
 * Компонент для отображения тегов в ОДНУ строку.
 * Теги, которые не влезли, скрываются за "+N".
 * При наведении на "+N" — модалка со всеми скрытыми тегами.
 */
export default function TagsOverflow({ tags = [], currentTheme }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [visibleCount, setVisibleCount] = useState(tags.length);
  const containerRef = useRef(null);
  const overflowRef = useRef(null);

  // Вычисляем сколько тегов влезает в одну строку
  useEffect(() => {
    if (!containerRef.current || tags.length === 0) return;

    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    let totalWidth = 0;
    let count = 0;

    // Измеряем каждый тег
    const tempSpan = document.createElement("span");
    tempSpan.style.cssText =
      "position:absolute;visibility:hidden;white-space:nowrap;font-size:12px;font-weight:500;padding:4px 10px;";
    document.body.appendChild(tempSpan);

    for (let i = 0; i < tags.length; i++) {
      tempSpan.textContent = tags[i];
      const tagWidth = tempSpan.offsetWidth + 6; // gap
      if (totalWidth + tagWidth <= containerWidth) {
        totalWidth += tagWidth;
        count++;
      } else {
        break;
      }
    }

    document.body.removeChild(tempSpan);

    // Оставляем место для "+N" если не все влезли
    if (count < tags.length) {
      const plusWidth = 30; // примерная ширина "+N"
      while (count > 0 && totalWidth + plusWidth > containerWidth) {
        count--;
        totalWidth -= (tags[count - 1]?.length || 0) * 7 + 26;
      }
    }

    setVisibleCount(Math.max(0, count));
  }, [tags]);

  // Позиционирование тултипа
  useEffect(() => {
    if (showTooltip && overflowRef.current) {
      const rect = overflowRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [showTooltip]);

  if (tags.length === 0) return null;

  const visibleTags = tags.slice(0, visibleCount);
  const hiddenTags = tags.slice(visibleCount);
  const hasOverflow = hiddenTags.length > 0;

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexWrap: "nowrap",
        gap: "6px",
        marginTop: "8px",
        alignItems: "center",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      {visibleTags.map((tag, index) => (
        <span
          key={index}
          style={{
            padding: "4px 10px",
            background: `${currentTheme?.primary || "var(--nt-primary)"}15`,
            color: currentTheme?.primary || "var(--nt-primary)",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "500",
            flexShrink: 0,
          }}
        >
          {tag}
        </span>
      ))}

      {hasOverflow && (
        <div
          ref={overflowRef}
          style={{ position: "relative", flexShrink: 0 }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <span
            style={{
              padding: "4px 8px",
              background: `${currentTheme?.textMuted || "#999"}20`,
              color: currentTheme?.textMuted || "#999",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              display: "inline-block",
            }}
          >
            +{hiddenTags.length}
          </span>

          {showTooltip && (
            <div
              style={{
                position: "fixed",
                top: tooltipPosition.top,
                left: tooltipPosition.left,
                background: currentTheme?.surface || "#fff",
                border: `1px solid ${currentTheme?.border || "#e0e0e0"}`,
                borderRadius: "8px",
                padding: "8px 10px",
                boxShadow: `0 4px 12px ${currentTheme?.cardShadow || "rgba(0,0,0,0.15)"}`,
                zIndex: 1000,
                maxWidth: "280px",
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
              }}
            >
              {hiddenTags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    padding: "3px 8px",
                    background: `${currentTheme?.primary || "var(--nt-primary)"}15`,
                    color: currentTheme?.primary || "var(--nt-primary)",
                    borderRadius: "10px",
                    fontSize: "11px",
                    fontWeight: "500",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
