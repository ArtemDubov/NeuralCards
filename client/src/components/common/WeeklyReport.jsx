import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faBullseye, faClock } from "../../utils/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Weekly report component for dashboard.
 * Shows current week vs previous week comparison with trend chart.
 * Props: report, prevReport
 */
export default function WeeklyReport({ report, prevReport }) {
  const { currentTheme } = useTheme();

  if (!report) {
    return (
      <div style={styles.empty}>
        Нет данных за неделю
      </div>
    );
  }

  const isDark = currentTheme?.mode === "dark";
  const primaryColor = currentTheme?.primary || "#667eea";
  const secondaryColor = currentTheme?.secondary || "#764ba2";

  const cardsReviewed = report.cards_reviewed || 0;
  const sessions = report.sessions || 0;
  const totalTime = report.total_time || 0;
  const accuracy = report.accuracy || 0;

  const prevCards = prevReport?.cards_reviewed || 0;
  const prevSessions = prevReport?.sessions || 0;
  const prevTime = prevReport?.total_time || 0;
  const prevAccuracy = prevReport?.accuracy || 0;

  const cardsChange = calcChange(cardsReviewed, prevCards);
  const sessionsChange = calcChange(sessions, prevSessions);
  const timeChange = calcChange(totalTime, prevTime);
  const accuracyChange = prevAccuracy ? accuracy - prevAccuracy : 0;

  const trendData = buildTrendData(report.daily || [], prevReport?.daily || []);

  return (
    <div
      style={{
        ...styles.container,
        background: currentTheme?.surface || "var(--nt-surface)",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
      }}
    >
      {/* Metric cards */}
      <div style={styles.metricsGrid}>
        <MetricTile
          label="Карточек пройдено"
          value={cardsReviewed}
          change={cardsChange}
          icon={faBook}
          currentTheme={currentTheme}
        />
        <MetricTile
          label="Сессий"
          value={sessions}
          change={sessionsChange}
          icon={faBullseye}
          currentTheme={currentTheme}
        />
        <MetricTile
          label="Время (мин)"
          value={totalTime}
          change={timeChange}
          icon={faClock}
          currentTheme={currentTheme}
        />
        <MetricTile
          label="Точность"
          value={`${accuracy}%`}
          change={accuracyChange}
          isPercent
          icon={faBullseye}
          currentTheme={currentTheme}
        />
      </div>

      {/* Trend chart */}
      {trendData.length > 0 && (
        <div style={styles.chartContainer}>
          <div style={styles.chartTitle}>Тренд за 2 недели</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{
                  fontSize: 11,
                  fill: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
                }}
                axisLine={{
                  stroke: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                }}
                tickLine={{
                  stroke: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
                }}
              />
              <YAxis
                tick={{
                  fontSize: 11,
                  fill: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
                }}
                axisLine={{
                  stroke: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                }}
                tickLine={{
                  stroke: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
                }}
                domain={[0, "auto"]}
                allowDecimals={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  background: isDark
                    ? "rgba(28,28,28,0.96)"
                    : "rgba(255,255,255,0.98)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="prev"
                name="Пред. неделя"
                stroke={secondaryColor}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="curr"
                name="Текущая неделя"
                stroke={primaryColor}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function MetricTile({ label, value, change, icon, isPercent, currentTheme }) {
  const isDark = currentTheme?.mode === "dark";
  const isPositive = change > 0;
  const isNegative = change < 0;
  const changeColor = isPositive
    ? currentTheme?.success || "#27ae60"
    : isNegative
      ? currentTheme?.error || "#e74c3c"
      : currentTheme?.textMuted || "#999";

  return (
    <div
      style={{
        ...styles.tile,
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        borderRadius: "10px",
      }}
    >
      <div style={styles.tileIcon}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div style={styles.tileValue}>{value}</div>
      <div
        style={{
          ...styles.tileLabel,
          color: currentTheme?.textMuted || "#999",
        }}
      >
        {label}
      </div>
      {change !== 0 && (
        <div style={{ ...styles.tileChange, color: changeColor }}>
          {isPositive ? "▲" : isNegative ? "▼" : ""}{" "}
          {isPercent
            ? `${change > 0 ? "+" : ""}${change.toFixed(1)}%`
            : `${change > 0 ? "+" : ""}${change}%`}
        </div>
      )}
    </div>
  );
}

function calcChange(current, previous) {
  if (!previous || previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

function buildTrendData(currentDaily, prevDaily) {
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const result = [];
  for (let i = 0; i < 7; i++) {
    const curr = currentDaily[i]?.cards || 0;
    const prev = prevDaily[i]?.cards || 0;
    result.push({
      label: days[i],
      curr,
      prev,
    });
  }
  return result;
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
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  tile: {
    padding: "14px",
    textAlign: "center",
  },
  tileIcon: {
    fontSize: "20px",
    marginBottom: "6px",
  },
  tileValue: {
    fontSize: "22px",
    fontWeight: "700",
  },
  tileLabel: {
    fontSize: "11px",
    marginTop: "2px",
  },
  tileChange: {
    fontSize: "12px",
    fontWeight: "600",
    marginTop: "4px",
  },
  chartContainer: {
    marginTop: "8px",
  },
  chartTitle: {
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "8px",
  },
};
