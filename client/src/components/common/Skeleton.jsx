import React, { useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";

// Inject keyframe animation once
let animationInjected = false;
function injectKeyframes() {
  if (animationInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes skeleton-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
  animationInjected = true;
}

/**
 * Base skeleton component with animated shimmer effect using CSS.
 * Props: width, height, borderRadius, className
 */
export default function Skeleton({
  width = "100%",
  height = "20px",
  borderRadius = "8px",
  className = "",
}) {
  const { currentTheme } = useTheme();

  useEffect(() => {
    injectKeyframes();
  }, []);

  const isDark = currentTheme?.mode === "dark";
  const baseBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const shimmerBg = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";

  return (
    <div
      className={`nt-skeleton ${className}`}
      style={{
        ...styles.skeleton,
        width,
        height,
        borderRadius,
        background: `linear-gradient(90deg, ${baseBg} 25%, ${shimmerBg} 50%, ${baseBg} 75%)`,
        backgroundSize: "200% 100%",
      }}
    />
  );
}

const styles = {
  skeleton: {
    animation: "skeleton-shimmer 1.5s ease-in-out infinite",
    display: "inline-block",
  },
};
