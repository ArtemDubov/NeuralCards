import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faInfo } from "../../utils/icons";
import PageShell from "../../components/layout/PageShell";

export default function LanguagesPage() {
  const { currentTheme } = useTheme();

  return (
    <PageShell currentTheme={currentTheme}>
      {/* Заголовок страницы */}
      <div className="page-header-section" style={{ marginBottom: "24px" }}>
        <h1 className="page-title" style={{ color: currentTheme.text }}>
          <FontAwesomeIcon icon={faGlobe} style={{ marginRight: "8px", color: currentTheme.primary }} />
          Языки
        </h1>
      </div>

      <div className="languages-container">
        <div
          style={{
            ...styles.card,
            background: currentTheme.surface,
            border: `1px solid ${currentTheme.border}`,
          }}
        >
          <FontAwesomeIcon
            icon={faGlobe}
            style={{ fontSize: "48px", color: currentTheme.primary, marginBottom: "16px" }}
          />
          <h2 style={{ color: currentTheme.text, margin: "0 0 8px 0" }}>
            Языки
          </h2>
          <p style={{ color: currentTheme.textSecondary, fontSize: "16px", margin: "0 0 16px 0" }}>
            Страница управления языками находится в разработке
          </p>
          <div
            style={{
              ...styles.badge,
              background: `${currentTheme.primary}20`,
              color: currentTheme.primary,
            }}
          >
            <FontAwesomeIcon icon={faInfo} style={{ marginRight: "6px" }} />
            Скоро будет доступно
          </div>
        </div>
      </div>
    </PageShell>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
    padding: "40px 20px",
  },
  card: {
    textAlign: "center",
    padding: "48px 32px",
    borderRadius: "16px",
    maxWidth: "480px",
    width: "100%",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
  },
};
