import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { statsApi } from "../../features/stats/api/statsApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faCalendar,
  faBullseye,
  faBrain,
  faClock,
} from "../../utils/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TrainingForecast() {
  const { currentTheme } = useTheme();
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await statsApi.getForecast();
      setForecast(response.data);
    } catch (err) {
      console.error("Error loading forecast:", err);
      setError("Не удалось загрузить прогноз");
    } finally {
      setLoading(false);
    }
  };

  const isDark = currentTheme?.mode === "dark";
  const primaryColor = currentTheme?.primary || "#667eea";
  const secondaryColor = currentTheme?.secondary || "#764ba2";

  if (loading) return <div className="stats-loading">Загрузка прогноза...</div>;
  if (error) return <div className="stats-error">{error}</div>;
  if (!forecast) return <div className="stats-empty">Нет данных для прогноза</div>;

  const projectedCards = forecast.projected_cards || 0;
  const projectedAccuracy = forecast.projected_accuracy || 0;
  const daysToMilestone = forecast.days_to_milestone || "—";
  const recommendedTime = forecast.recommended_daily_time || "—";
  const chartData = forecast.trend_data || [];

  const metrics = [
    {
      label: "Прогноз карточек",
      value: projectedCards,
      icon: faBrain,
      color: "var(--nt-info)",
      unit: "",
    },
    {
      label: "Прогноз точности",
      value: projectedAccuracy,
      icon: faBullseye,
      color: "var(--nt-success)",
      unit: "%",
    },
    {
      label: "Дней до цели",
      value: daysToMilestone,
      icon: faCalendar,
      color: "var(--nt-purple)",
      unit: "",
    },
    {
      label: "Реком. время/день",
      value: recommendedTime,
      icon: faClock,
      color: "var(--nt-warning)",
      unit: " мин",
    },
  ];

  return (
    <div>
      <h3 className="stats-title">
        <FontAwesomeIcon icon={faChartLine} style={{ marginRight: "8px", color: secondaryColor }} />
        Прогноз тренировок
      </h3>

      <div className="stats-metrics-grid">
        {metrics.map((m, i) => (
          <div key={i} className="stats-metric-card">
            <FontAwesomeIcon icon={m.icon} style={{ color: m.color, marginBottom: "6px", fontSize: "18px" }} />
            <div className="stats-metric-label">{m.label}</div>
            <div style={{ ...styles.metricValue, color: m.color }}>
              {m.value}{m.unit}
            </div>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="stats-chart-container">
          <h4 className="stats-chart-subtitle">Тренд прогресса</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }}
                axisLine={{ stroke: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)" }}
                tickLine={{ stroke: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }}
                axisLine={{ stroke: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)" }}
                tickLine={{ stroke: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" }}
                width={40}
              />
              <Tooltip
                cursor={{ fill: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
                contentStyle={{
                  background: isDark ? "rgba(28,28,28,0.96)" : "rgba(255,255,255,0.98)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name="Значение"
                stroke={primaryColor}
                strokeWidth={2.5}
                dot={{ fill: isDark ? "rgba(0,0,0,0.4)" : "#fff", stroke: primaryColor, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                strokeDasharray={chartData.map((d) => (d.is_projected ? "5 5" : "0")).join(" ")}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

const styles = {
  title: {
    fontSize: "16px",
    fontWeight: 600,
    marginTop: 0,
    marginBottom: "16px",
    color: "var(--nt-text, #333)",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  metricCard: {
    padding: "16px",
    borderRadius: "10px",
    background: "var(--nt-surface, #ffffff)",
    border: "1px solid var(--nt-border-light, #f0f0f0)",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  metricLabel: {
    fontSize: "12px",
    color: "var(--nt-text-secondary, #666)",
    marginBottom: "4px",
  },
  metricValue: {
    fontSize: "22px",
    fontWeight: 700,
    lineHeight: 1.2,
  },
  chartContainer: {
    marginTop: "12px",
  },
  chartSubtitle: {
    fontSize: "14px",
    fontWeight: 500,
    marginTop: 0,
    marginBottom: "12px",
    color: "var(--nt-text-secondary, #666)",
  },
  loading: { textAlign: "center", padding: "20px", color: "var(--nt-text-muted, #999)" },
  error: { textAlign: "center", padding: "20px", color: "var(--nt-error, #e74c3c)" },
  empty: { textAlign: "center", padding: "30px", color: "var(--nt-text-muted, #999)" },
};
