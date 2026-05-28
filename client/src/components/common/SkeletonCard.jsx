import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import Skeleton from "./Skeleton";

/**
 * Skeleton for card components.
 * Shows skeleton for image, title, description.
 */
export default function SkeletonCard() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme?.mode === "dark";

  return (
    <div
      style={{
        ...styles.card,
        background: currentTheme?.surface || "var(--nt-surface)",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
      }}
    >
      <Skeleton
        width="100%"
        height="160px"
        borderRadius="8px 8px 0 0"
      />
      <div style={styles.body}>
        <Skeleton width="80%" height="20px" borderRadius="6px" />
        <div style={styles.spacer} />
        <Skeleton width="100%" height="14px" borderRadius="4px" />
        <div style={styles.spacerSm} />
        <Skeleton width="60%" height="14px" borderRadius="4px" />
      </div>
    </div>
  );
}

const styles = {
  card: {
    borderRadius: "12px",
    overflow: "hidden",
  },
  body: {
    padding: "16px",
  },
  spacer: {
    height: "12px",
  },
  spacerSm: {
    height: "8px",
  },
};
