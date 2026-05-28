import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import PageShell from "../../components/layout/PageShell";
import { statsApi } from "../../features/stats/api/statsApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy, faFire, faClock, faBrain, faMedal } from "../../utils/icons";
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

const PERIODS = [
  { key: 7, label: "7 дней" },
  { key: 30, label: "30 дней" },
  { key: 90, label: "90 дней" },
];

const MEDAL_COLORS = ["#f1c40f", "#95a5a6", "#cd7f32"];

/**
 * Файл-обертка для обратной совместимости
 * Все импорты теперь идут из ./leaderboard/
 */

export { default } from "./leaderboard";
