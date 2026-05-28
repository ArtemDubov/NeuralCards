/**
 * Компонент диаграммы лидерборда
 */

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBrain } from "../../../utils/icons";
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
import { MEDAL_COLORS } from "./constants";

export default function LeaderboardChart({
  leaderboard,
  currentTheme,
  primaryColor,
}) {
  const isDark = currentTheme?.mode === "dark";

  const chartData = leaderboard.slice(0, 15).map((user, index) => ({
    name: user.name?.substring(0, 10) || `#${index + 1}`,
    cards: user.cards_learned || 0,
    fullName: user.name,
  }));

  return (
    <div className="stats-chart-card">
      <h3 className="stats-chart-title">
        <FontAwesomeIcon
          icon={faBrain}
          style={{ marginRight: "8px", color: primaryColor }}
        />
        Карточек изучено — топ-15
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}
            vertical={false}
          />
          <XAxis
            dataKey="name"
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
              fontSize: 12,
              fill: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
            }}
            axisLine={{
              stroke: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
            }}
            tickLine={{
              stroke: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
            }}
            width={45}
          />
          <Tooltip
            cursor={{
              fill: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
            }}
            contentStyle={{
              background: isDark
                ? "rgba(28,28,28,0.96)"
                : "rgba(255,255,255,0.98)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            }}
            formatter={(value) => [`${value} карточек`, "Изучено"]}
            labelFormatter={(label) => {
              const item = chartData.find((d) => d.name === label);
              return item?.fullName || label;
            }}
          />
          <Bar dataKey="cards" name="Изучено" radius={[6, 6, 0, 0]} barSize={36}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  index < 3
                    ? MEDAL_COLORS[index]
                    : index < 10
                      ? primaryColor
                      : isDark
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(0,0,0,0.15)"
                }
                opacity={index < 10 ? 0.9 : 0.55}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
