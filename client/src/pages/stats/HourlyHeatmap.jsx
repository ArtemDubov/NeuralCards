import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { statsApi } from "../../features/stats/api/statsApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faChartBar,
  faBrain,
  faFire,
} from "../../utils/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getGridColor, getAxisColor, getTickLineColor, getAxisTickColor } from "../../utils/chartTheme";

export default function HourlyHeatmap() {
  const { currentTheme } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await statsApi.getHourlyHeatmap(30);
      setData(response.data.hours || []);
    } catch (err) {
      console.error("Error loading hourly heatmap:", err);
      setError("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  const isDark = currentTheme?.mode === "dark";
  const primaryColor = currentTheme?.primary || "#667eea";

  if (loading) return <div className="stats-loading">Загрузка...</div>;
  if (error) return <div className="stats-error">{error}</div>;
  if (data.length === 0) return <div className="stats-empty">Нет данных</div>;

  const chartData = data.map((d) => ({
    hour: `${d.hour}:00`,
    sessions: d.sessions || 0,
  }));

  const maxSessions = Math.max(...chartData.map((d) => d.sessions), 1);

  return (
    <div>
      <h3 className="stats-title">
        <FontAwesomeIcon icon={faClock} style={{ marginRight: "8px", color: primaryColor }} />
        Активность по часам (последние 30 дней)
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={getGridColor(isDark)}
            vertical={false}
          />
          <XAxis
            dataKey="hour"
            tick={{
              fontSize: 11,
              fill: getAxisTickColor(isDark),
            }}
            axisLine={{ stroke: getAxisColor(isDark) }}
            tickLine={{ stroke: getTickLineColor(isDark) }}
            interval={2}
          />
          <YAxis
            tick={{
              fontSize: 12,
              fill: getAxisTickColor(isDark),
            }}
            axisLine={{ stroke: getAxisColor(isDark) }}
            tickLine={{ stroke: getTickLineColor(isDark) }}
            width={40}
          />
          <Tooltip
            cursor={{ fill: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }}
            contentStyle={{
              background: isDark ? `${currentTheme.surface || "rgba(28,28,28,0.96)"}ee` : "rgba(255,255,255,0.98)",
              border: `1px solid ${isDark ? (currentTheme.border || "rgba(255,255,255,0.15)") : "rgba(0,0,0,0.1)"}`,
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              color: currentTheme.text || (isDark ? "var(--nt-text)" : "var(--nt-text)"),
            }}
            labelStyle={{
              color: currentTheme.textSecondary || (isDark ? "var(--nt-text-secondary)" : "var(--nt-text-secondary)"),
              fontWeight: 600,
            }}
            itemStyle={{
              color: currentTheme.text || (isDark ? "var(--nt-text)" : "var(--nt-text)"),
            }}
            formatter={(value) => [`${value} сессий`, "Активность"]}
            labelFormatter={(label) => `Время: ${label}`}
          />
          <Bar dataKey="sessions" name="Сессии" radius={[4, 4, 0, 0]} barSize={20}>
            {chartData.map((entry, index) => {
              const intensity = entry.sessions / maxSessions;
              return (
                <Cell
                  key={index}
                  fill={primaryColor}
                  opacity={Math.max(0.15, intensity)}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
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
  loading: { textAlign: "center", padding: "20px", color: "var(--nt-text-muted, #999)" },
  error: { textAlign: "center", padding: "20px", color: "var(--nt-error, #e74c3c)" },
  empty: { textAlign: "center", padding: "30px", color: "var(--nt-text-muted, #999)" },
};
