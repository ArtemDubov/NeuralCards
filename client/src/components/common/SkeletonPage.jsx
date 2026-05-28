import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import Skeleton from "./Skeleton";

/**
 * Full page skeleton.
 * Shows skeleton header, content blocks, and sidebar.
 * Used while pages load.
 */
export default function SkeletonPage() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme?.mode === "dark";

  return (
    <div style={styles.container}>
      {/* Header skeleton */}
      <div
        style={{
          ...styles.header,
          background: currentTheme?.surface || "var(--nt-surface)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
        }}
      >
        <Skeleton width="40px" height="40px" borderRadius="8px" />
        <Skeleton width="200px" height="24px" borderRadius="6px" />
        <div style={styles.headerActions}>
          <Skeleton width="80px" height="36px" borderRadius="8px" />
          <Skeleton width="80px" height="36px" borderRadius="8px" />
        </div>
      </div>

      {/* Content area */}
      <div style={styles.content}>
        {/* Main content blocks */}
        <div style={styles.main}>
          <Skeleton width="60%" height="28px" borderRadius="8px" />
          <div style={styles.spacer} />
          {/* Content cards */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                ...styles.card,
                background: currentTheme?.surface || "var(--nt-surface)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
              }}
            >
              <Skeleton width="50%" height="18px" borderRadius="6px" />
              <div style={styles.spacerSm} />
              <Skeleton width="100%" height="14px" borderRadius="4px" />
              <div style={styles.spacerSm} />
              <Skeleton width="85%" height="14px" borderRadius="4px" />
            </div>
          ))}
        </div>

        {/* Sidebar skeleton */}
        <div style={styles.sidebar}>
          <div
            style={{
              ...styles.sidebarCard,
              background: currentTheme?.surface || "var(--nt-surface)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
            }}
          >
            <Skeleton width="70%" height="18px" borderRadius="6px" />
            <div style={styles.spacer} />
            <Skeleton width="100%" height="100px" borderRadius="8px" />
          </div>
          <div style={styles.spacer} />
          <div
            style={{
              ...styles.sidebarCard,
              background: currentTheme?.surface || "var(--nt-surface)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
            }}
          >
            <Skeleton width="60%" height="18px" borderRadius="6px" />
            <div style={styles.spacerSm} />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={styles.sidebarItem}>
                <Skeleton width="24px" height="24px" borderRadius="50%" />
                <Skeleton width="70%" height="14px" borderRadius="4px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px 20px",
    borderRadius: "12px",
    marginBottom: "20px",
  },
  headerActions: {
    marginLeft: "auto",
    display: "flex",
    gap: "8px",
  },
  content: {
    display: "grid",
    gridTemplateColumns: "1fr 280px",
    gap: "20px",
  },
  main: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
  },
  card: {
    padding: "20px",
    borderRadius: "12px",
  },
  sidebarCard: {
    padding: "16px",
    borderRadius: "12px",
  },
  sidebarItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  },
  spacer: {
    height: "16px",
  },
  spacerSm: {
    height: "10px",
  },
};
