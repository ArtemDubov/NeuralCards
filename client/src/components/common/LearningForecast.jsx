import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHourglassHalf, faLightbulb, faRocket, faTrophy, faCalendar, faChartLine } from "../../utils/icons";

export default function LearningForecast({ forecast, currentTheme }) {
  if (!forecast) {
    return (
      <div
        style={{
          ...styles.container,
          background: currentTheme?.surface || "var(--nt-surface)",
          boxShadow: `0 2px 8px ${currentTheme?.cardShadow || "rgba(0,0,0,0.1)"}`,
        }}
      >
        <p style={{ color: currentTheme?.text || "var(--nt-text)" }}>
          <FontAwesomeIcon
            icon={faHourglassHalf}
            style={{ marginRight: "6px" }}
          />
          Загрузка прогноза...
        </p>
      </div>
    );
  }

  // Определяем уровень мотивации на основе текущей активности
  const getMotivationLevel = () => {
    const weeklyAvg = forecast.weekly_average || 0;
    if (weeklyAvg >= 50) return { level: "excellent", icon: faRocket, text: "Отличный темп!" };
    if (weeklyAvg >= 20) return { level: "good", icon: faChartLine, text: "Хороший прогресс" };
    if (weeklyAvg >= 5) return { level: "moderate", icon: faChartLine, text: "Есть рост" };
    return { level: "starting", icon: faLightbulb, text: "Начало пути" };
  };

  const motivation = getMotivationLevel();
  const isDark = currentTheme?.mode === "dark";

  return (
    <div
      style={{
        ...styles.container,
        background: currentTheme?.surface || "white",
        boxShadow: `0 2px 8px ${currentTheme?.cardShadow || "rgba(0,0,0,0.1)"}`,
      }}
    >
      {/* Мотивационный баннер */}
      <div
        style={{
          ...styles.motivationBanner,
          background: isDark 
            ? "linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.15))"
            : "linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))",
          border: `2px solid ${currentTheme?.primary || "#667eea"}`,
        }}
      >
        <div style={styles.motivationIcon}>
          <FontAwesomeIcon icon={motivation.icon} size="2x" />
        </div>
        <div>
          <div style={styles.motivationTitle}>{motivation.text}</div>
          <div style={styles.motivationSubtitle}>
            В среднем {forecast.weekly_average || 0} карточек в неделю
          </div>
        </div>
      </div>

      {/* Прогноз на разные периоды */}
      <div style={styles.forecastGrid}>
        {/* Через неделю */}
        <div
          style={{
            ...styles.forecastCard,
            background: `${currentTheme?.surface || "var(--nt-surface)"}cc`,
            border: `1px solid ${currentTheme?.borderLight || "rgba(0,0,0,0.06)"}`,
            borderRadius: "10px",
          }}
        >
          <div style={styles.forecastIcon}>
            <FontAwesomeIcon icon={faCalendar} style={{ color: "var(--nt-primary)" }} />
          </div>
          <span
            style={{
              ...styles.forecastValue,
              color: "var(--nt-primary)",
            }}
          >
            +{forecast.next_week_cards || 0}
          </span>
          <span
            style={{
              ...styles.forecastLabel,
              color: currentTheme?.textMuted || "#666",
            }}
          >
            карточек через неделю
          </span>
        </div>

        {/* Через месяц */}
        <div
          style={{
            ...styles.forecastCard,
            background: `${currentTheme?.surface || "var(--nt-surface)"}cc`,
            border: `1px solid ${currentTheme?.borderLight || "rgba(0,0,0,0.06)"}`,
            borderRadius: "10px",
          }}
        >
          <div style={styles.forecastIcon}>
            <FontAwesomeIcon icon={faRocket} style={{ color: "var(--nt-secondary)" }} />
          </div>
          <span
            style={{
              ...styles.forecastValue,
              color: "var(--nt-secondary)",
            }}
          >
            ~{forecast.next_month_cards || 0}
          </span>
          <span
            style={{
              ...styles.forecastLabel,
              color: currentTheme?.textMuted || "#666",
            }}
          >
            карточек через месяц
          </span>
        </div>

        {/* Общий прогресс */}
        <div
          style={{
            ...styles.forecastCard,
            background: `${currentTheme?.surface || "var(--nt-surface)"}cc`,
            border: `1px solid ${currentTheme?.borderLight || "rgba(0,0,0,0.06)"}`,
            borderRadius: "10px",
          }}
        >
          <div style={styles.forecastIcon}>
            <FontAwesomeIcon icon={faTrophy} style={{ color: "var(--nt-warning)" }} />
          </div>
          <span
            style={{
              ...styles.forecastValue,
              color: "var(--nt-warning)",
            }}
          >
            {forecast.total_potential || 0}
          </span>
          <span
            style={{
              ...styles.forecastLabel,
              color: currentTheme?.textMuted || "#666",
            }}
          >
            всего можно выучить
          </span>
        </div>
      </div>

      {/* Подсказка */}
      <div
        style={{
          ...styles.hint,
          background: `${currentTheme?.info || "var(--nt-info)"}15`,
          color: currentTheme?.info || "var(--nt-info-dark)",
        }}
      >
        <FontAwesomeIcon icon={faLightbulb} style={{ marginRight: "6px" }} />
        Занимайтесь регулярно, чтобы увеличить прогноз! Чем больше практикуетесь, тем быстрее учите.
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    borderRadius: "12px",
  },
  
  // Мотивационный баннер
  motivationBanner: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "24px",
  },
  motivationIcon: {
    fontSize: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  motivationTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "var(--nt-text, #333)",
    marginBottom: "4px",
  },
  motivationSubtitle: {
    fontSize: "14px",
    color: "var(--nt-text-secondary, #666)",
  },

  // Сетка прогнозов
  forecastGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  forecastCard: {
    padding: "20px",
    textAlign: "center",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  forecastIcon: {
    fontSize: "32px",
    marginBottom: "12px",
  },
  forecastValue: {
    fontSize: "32px",
    fontWeight: "700",
    display: "block",
    marginBottom: "8px",
  },
  forecastLabel: {
    fontSize: "13px",
    lineHeight: "1.4",
  },

  // Подсказка
  hint: {
    padding: "14px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    marginTop: "16px",
  },
};
