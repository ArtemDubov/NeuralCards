import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Training forecast component.
 * Shows current learning rate, remaining cards, estimated completion date.
 * Props: forecast
 */
export default function TrainingForecast({ forecast }) {
  const { currentTheme } = useTheme();

  if (!forecast) {
    return (
      <div style={styles.empty}>
        Загрузка прогноза...
      </div>
    );
  }

  const isDark = currentTheme?.mode === "dark";
  const primaryColor = currentTheme?.primary || "#667eea";
  const secondaryColor = currentTheme?.secondary || "#764ba2";

  const cardsLearned = forecast.cards_learned || 0;
  const cardsRemaining = forecast.cards_remaining || 0;
  const totalCards = cardsLearned + cardsRemaining;
  const dailyRate = forecast.daily_progress || 0;
  const daysToComplete = forecast.days_to_complete;
  const estimatedDate = forecast.estimated_date;

  const progressPercent =
    totalCards > 0 ? Math.round((cardsLearned / totalCards) * 100) : 0;

  return (
    <div
      style={{
        ...styles.container,
        background: currentTheme?.surface || "var(--nt-surface)",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
      }}
    >
      {/* Stats row */}
      <div style={styles.statsRow}>
        <StatCard
          label="Скорость обучения"
          value={`${dailyRate} карточек/день`}
          currentTheme={currentTheme}
        />
        <StatCard
          label="Осталось карточек"
          value={cardsRemaining}
          currentTheme={currentTheme}
        />
        <StatCard
          label="Завершение"
          value={
            daysToComplete !== undefined && daysToComplete !== null
              ? `${daysToComplete} дней`
              : estimatedDate || "—"
          }
          currentTheme={currentTheme}
        />
      </div>

      {/* Progress bar */}
      {totalCards > 0 && (
        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <span
              style={{
                ...styles.progressLabel,
                color: currentTheme?.textMuted || "#999",
              }}
            >
              Прогресс обучения
            </span>
            <span
              style={{
                ...styles.progressPercent,
                color: primaryColor,
              }}
            >
              {progressPercent}%
            </span>
          </div>
          <div
            style={{
              ...styles.progressBar,
              background: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                ...styles.progressFill,
                width: `${Math.min(progressPercent, 100)}%`,
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              }}
            />
          </div>
          <div
            style={{
              ...styles.progressDetail,
              color: currentTheme?.textMuted || "#999",
            }}
          >
            Изучено: {cardsLearned} · Осталось: {cardsRemaining} · Всего:{" "}
            {totalCards}
          </div>
        </div>
      )}

      {/* Completion message */}
      {cardsRemaining === 0 && totalCards > 0 ? (
        <div
          style={{
            ...styles.completeMsg,
            background: `${currentTheme?.success || "var(--nt-success)"}18`,
            color: currentTheme?.success || "var(--nt-success-dark)",
          }}
        >
          Все карточки изучены!
        </div>
      ) : daysToComplete !== undefined && daysToComplete !== null ? (
        <div
          style={{
            ...styles.hint,
            background: `${currentTheme?.info || "var(--nt-info)"}12`,
            color: currentTheme?.info || "var(--nt-info-dark)",
          }}
        >
          При текущем темпе завершение через {daysToComplete}{" "}
          {pluralDays(daysToComplete)}
          {estimatedDate ? ` (~${estimatedDate})` : ""}
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, currentTheme }) {
  const isDark = currentTheme?.mode === "dark";
  return (
    <div
      style={{
        ...styles.statCard,
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          ...styles.statValue,
          color: currentTheme?.primary || "var(--nt-primary)",
        }}
      >
        {value}
      </div>
      <div
        style={{
          ...styles.statLabel,
          color: currentTheme?.textMuted || "#999",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function pluralDays(n) {
  const abs = Math.abs(n) % 100;
  const lastDigit = abs % 10;
  if (abs > 10 && abs < 20) return "дней";
  if (lastDigit === 1) return "день";
  if (lastDigit >= 2 && lastDigit <= 4) return "дня";
  return "дней";
}

const styles = {
  container: {
    padding: "20px",
    borderRadius: "12px",
  },
  empty: {
    padding: "20px",
    textAlign: "center",
    color: "#999",
    fontSize: "14px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  statCard: {
    padding: "14px",
    textAlign: "center",
  },
  statValue: {
    fontSize: "20px",
    fontWeight: "700",
  },
  statLabel: {
    fontSize: "11px",
    marginTop: "4px",
  },
  progressSection: {
    marginTop: "8px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  progressLabel: {
    fontSize: "13px",
    fontWeight: "600",
  },
  progressPercent: {
    fontSize: "16px",
    fontWeight: "700",
  },
  progressBar: {
    height: "14px",
    borderRadius: "7px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "7px",
    transition: "width 0.5s ease",
  },
  progressDetail: {
    fontSize: "12px",
    marginTop: "6px",
    textAlign: "center",
  },
  completeMsg: {
    padding: "14px",
    borderRadius: "8px",
    textAlign: "center",
    fontWeight: "600",
    marginTop: "16px",
    fontSize: "14px",
  },
  hint: {
    padding: "12px",
    borderRadius: "8px",
    textAlign: "center",
    fontSize: "13px",
    marginTop: "16px",
  },
};
