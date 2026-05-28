import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * График прогресса за неделю — AreaChart с яркими цветами
 */
export default function ProgressChart({ data, height = 200, currentTheme }) {
  const chartData =
    data && data.length > 0
      ? data
      : [
          { day: "Пн", cards: 0 },
          { day: "Вт", cards: 0 },
          { day: "Ср", cards: 0 },
          { day: "Чт", cards: 0 },
          { day: "Пт", cards: 0 },
          { day: "Сб", cards: 0 },
          { day: "Вс", cards: 0 },
        ];

  const isEmpty = chartData.every((d) => d.cards === 0);
  const maxValue = Math.max(...chartData.map((d) => d.cards), 1);

  const isDark = currentTheme?.mode === "dark";
  const primaryColor = currentTheme?.primary || "#667eea";
  const secondaryColor = currentTheme?.secondary || "#764ba2";

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id={`progGrad_${height}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={primaryColor} stopOpacity={0.8} />
              <stop
                offset="100%"
                stopColor={secondaryColor}
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}
            vertical={false}
          />

          <XAxis
            dataKey="day"
            tick={{
              fontSize: 12,
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
              fontSize: 12,
              fill: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
            }}
            axisLine={{
              stroke: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
            }}
            tickLine={{
              stroke: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
            }}
            domain={[0, isEmpty ? 1 : Math.ceil(maxValue * 1.3)]}
            allowDecimals={false}
            width={40}
            tickCount={6}
          />

          <Tooltip
            cursor={{
              fill: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
            }}
            content={<CustomTooltip currentTheme={currentTheme} />}
          />

          <Area
            type="linear"
            dataKey="cards"
            name="Карточек"
            stroke={primaryColor}
            strokeWidth={3}
            fill={`url(#progGrad_${height})`}
            dot={{
              fill: isDark ? "rgba(0,0,0,0.4)" : "#fff",
              stroke: primaryColor,
              strokeWidth: 2.5,
              r: isEmpty ? 3 : 5,
            }}
            activeDot={{
              r: 7,
              stroke: primaryColor,
              strokeWidth: 2,
              fill: isDark ? "rgba(0,0,0,0.3)" : "#fff",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomTooltip({ active, payload, label, currentTheme }) {
  if (active && payload && payload.length) {
    const isDark = currentTheme?.mode === "dark";
    return (
      <div
        style={{
          padding: "8px 12px",
          borderRadius: "8px",
          boxShadow: currentTheme?.cardShadow || "0 4px 12px rgba(0,0,0,0.15)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
          background: isDark ? "rgba(28,28,28,0.96)" : "rgba(255,255,255,0.98)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontWeight: 600,
            fontSize: "12px",
            marginBottom: "4px",
          }}
        >
          {label}
        </p>
        <p
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: "15px",
            color: currentTheme?.primary,
          }}
        >
          {payload[0].value} карточек
        </p>
      </div>
    );
  }
  return null;
}

