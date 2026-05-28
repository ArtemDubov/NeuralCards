import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

export default function ModeDistributionChart({ modeDist, currentTheme }) {
  const isDark = currentTheme?.mode === "dark";
  
  const modeNames = {
    practice: "Practice",
    quiz: "Quiz",
    marathon: "Marathon",
    dictation: "Dictation",
    matching: "Matching",
  };

  // Используем цвета из темы с разными оттенками для разных режимов
  const baseColor = currentTheme?.primary || "#667eea";
  
  const modeColors = {
    practice: baseColor,
    quiz: adjustColor(baseColor, -20),
    marathon: adjustColor(baseColor, 20),
    dictation: adjustColor(baseColor, 40),
    matching: adjustColor(baseColor, -40),
  };

  // Функция для изменения яркости цвета
  function adjustColor(hex, amount) {
    if (!hex) return "#999";
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  }

  const chartData = Object.entries(modeDist).map(([key, val]) => ({
    name: modeNames[key] || key,
    value: val.sessions || val.count || 0,
  }));

  if (chartData.length === 0) return null;

  return (
    <div className="white-card">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={modeColors[Object.keys(modeDist)[index]] || "#999"} 
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "var(--nt-surface)" : "var(--nt-surface)",
              border: `1px solid ${isDark ? "var(--nt-border)" : "var(--nt-border)"}`,
              borderRadius: "8px",
              color: currentTheme?.text || "var(--nt-text)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mode-legend">
        {chartData.map((item, idx) => (
          <div key={idx} className="mode-legend-item">
            <div
              className="mode-dot"
              style={{
                background: modeColors[Object.keys(modeDist)[idx]] || "#999",
              }}
            />
            <span className="mode-label">{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
