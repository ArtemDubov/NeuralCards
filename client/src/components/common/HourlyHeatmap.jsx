/**
 * Returns grid color based on theme mode
 */
export function getGridColor(isDark) {
  return isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
}

/**
 * Returns axis line color based on theme mode
 */
export function getAxisColor(isDark) {
  return isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";
}

/**
 * Returns tick line color based on theme mode
 */
export function getTickLineColor(isDark) {
  return isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
}

/**
 * Returns axis tick color based on theme mode
 */
export function getAxisTickColor(isDark) {
  return isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";
}

/**
 * Returns bar color based on base color, intensity and theme mode
 */
export function getBarColor(baseColor, intensity, isDark) {
  if (intensity === 0) return isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

  if (isDark) {
    // Dark mode: lighter = more activity
    const alpha = 0.3 + intensity * 0.7;
    return hexToRgba(baseColor, alpha);
  } else {
    // Light mode: darker = more activity
    const alpha = 0.3 + intensity * 0.6;
    return hexToRgba(baseColor, alpha);
  }
}

function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== "string") return `rgba(102, 126, 234, ${alpha})`;
  const hexStr = hex.replace("#", "");
  if (hexStr.length < 6) return `rgba(102, 126, 234, ${alpha})`;
  const r = parseInt(hexStr.substring(0, 2), 16);
  const g = parseInt(hexStr.substring(2, 4), 16);
  const b = parseInt(hexStr.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
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
import { getGridColor, getAxisColor, getTickLineColor, getAxisTickColor, getBarColor } from "../../utils/chartTheme";

/**
 * Hourly heatmap component.
 * Receives hourly data [{hour: 0-23, count: N}].
 * Shows 24 bars using recharts BarChart with horizontal layout.
 * Darker color = more activity. Shows peak hour.
 * Props: data
 */
export default function HourlyHeatmap({ data }) {
  const { currentTheme } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div style={styles.empty}>
        Нет данных активности по часам
      </div>
    );
  }

  const isDark = currentTheme?.mode === "dark";
  const primaryColor = currentTheme?.primary || "#667eea";

  // Ensure all 24 hours are present
  const fullData = [];
  for (let h = 0; h < 24; h++) {
    const found = data.find((d) => d.hour === h);
    fullData.push({
      hour: h,
      label: `${String(h).padStart(2, "0")}:00`,
      count: found?.count || 0,
    });
  }

  const maxCount = Math.max(...fullData.map((d) => d.count), 1);
  const peakHour = fullData.reduce(
    (max, d) => (d.count > max.count ? d : max),
    fullData[0],
  );

  return (
    <div>
      {/* Peak hour badge */}
      {peakHour.count > 0 && (
        <div
          style={{
            ...styles.peakBadge,
            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
            color: currentTheme?.text || "#333",
          }}
        >
          <span style={styles.peakIcon}>🔥</span>
          Пиковый час: <strong>{peakHour.label}</strong> ({peakHour.count}{" "}
          {peakHour.count === 1 ? "действие" : "действий"})
        </div>
      )}

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={fullData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={getGridColor(isDark)}
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{
              fontSize: 10,
              fill: getAxisTickColor(isDark),
            }}
            axisLine={{
              stroke: getAxisColor(isDark),
            }}
            tickLine={{
              stroke: getTickLineColor(isDark),
            }}
            interval={2}
          />
          <YAxis
            tick={{
              fontSize: 11,
              fill: getAxisTickColor(isDark),
            }}
            axisLine={{
              stroke: getAxisColor(isDark),
            }}
            tickLine={{
              stroke: getTickLineColor(isDark),
            }}
            domain={[0, maxCount]}
            allowDecimals={false}
            width={32}
          />
          <Tooltip
            cursor={{
              fill: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
            }}
            contentStyle={{
              background: isDark
                ? `${currentTheme.surface || "var(--nt-surface)"}ee`
                : "rgba(255,255,255,0.98)",
              border: `1px solid ${isDark ? (currentTheme.border || "var(--nt-border)") : "rgba(0,0,0,0.1)"}`,
              borderRadius: "6px",
              fontSize: "12px",
              color: currentTheme.text || "var(--nt-text)",
            }}
            labelStyle={{
              color: currentTheme.textSecondary || "var(--nt-text-secondary)",
              fontWeight: 600,
            }}
            itemStyle={{
              color: currentTheme.text || "var(--nt-text)",
            }}
            formatter={(value) => [`${value} действий`, "Активность"]}
          />
          <Bar dataKey="count" name="Активность" radius={[4, 4, 0, 0]}>
            {fullData.map((entry, i) => {
              const intensity = entry.count / maxCount;
              return (
                <Cell
                  key={i}
                  fill={getBarColor(primaryColor, intensity, isDark)}
                  opacity={entry.count > 0 ? 0.6 + intensity * 0.4 : 0.2}
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
  empty: {
    padding: "20px",
    textAlign: "center",
    color: "#999",
    fontSize: "14px",
  },
  peakBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "12px",
  },
  peakIcon: {
    fontSize: "16px",
  },
};
