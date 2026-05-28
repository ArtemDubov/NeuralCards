import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import PageShell from "../../components/layout/PageShell";
import { statsApi } from "../../features/stats/api/statsApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faFire,
  faClock,
  faBrain,
  faBolt,
  faChartLine,
  faUser,
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

const PERIODS = [
  { key: 7, label: "7 дней" },
  { key: 30, label: "30 дней" },
  { key: 90, label: "90 дней" },
  { key: 0, label: "Всё время" },
];

const MEDAL_COLORS = ["#f1c40f", "#95a5a6", "#cd7f32"];

export default function LeaderboardPage() {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const isDark = currentTheme?.mode === "dark";
  const primaryColor = currentTheme?.primary || "#667eea";
  const secondaryColor = currentTheme?.secondary || "#764ba2";
  const borderColor = currentTheme?.border || "#e0e0e0";
  const textSec = currentTheme?.textSecondary || "#888";
  const surface = currentTheme?.surface || "#fff";
  const text = currentTheme?.text || "#333";

  const [period, setPeriod] = useState(30);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    statsApi
      .getLeaderboard(5, period)
      .then((res) => {
        if (!cancelled) {
          setLeaderboard(res.data || []);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Не удалось загрузить таблицу лидеров");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  const chartData = useMemo(
    () => {
      // Всегда создаем ровно 5 позиций для графика
      const data = [];
      for (let i = 0; i < 5; i++) {
        if (i < leaderboard.length) {
          const user = leaderboard[i];
          data.push({
            key: `u_${i}`,
            name: user.user_name?.substring(0, 12) || `#${i + 1}`,
            cards: user.total_cards_learned || 0,
            fullName: user.user_name,
            isEmpty: false
          });
        } else {
          // Пустая позиция
          data.push({
            key: `empty_${i}`,
            name: `—`,
            cards: 0,
            fullName: "Нет данных",
            isEmpty: true
          });
        }
      }
      return data;
    },
    [leaderboard],
  );

  const periodLabel = PERIODS.find((p) => p.key === period)?.label || "30 дней";

  // Таблица лидеров - показываем только топ-5
  const topFiveLeaderboard = useMemo(
    () => leaderboard.slice(0, 5),
    [leaderboard]
  );

  return (
    <PageShell currentTheme={currentTheme}>
      <div className="leaderboard-container">
        <div className="page-header-section" style={{ marginBottom: "24px" }}>
          <h1 className="page-title" style={{ color: currentTheme.text, display: "flex", alignItems: "center" }}>
            <FontAwesomeIcon
              icon={faTrophy}
              style={{ marginRight: "8px", color: currentTheme?.warning || "var(--nt-warning)" }}
            />
            Таблица лидеров
          </h1>
        </div>

        <div className="leaderboard-header">
          <div>
            {user && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 14, color: textSec }}>
                <FontAwesomeIcon icon={faUser} style={{ color: primaryColor }} />
                <span>Вы вошли как: <strong style={{ color: text }}>{user.name}</strong></span>
              </div>
            )}
          </div>
          <div className="leaderboard-periods" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                style={{
                  ...styles.periodBtn,
                  background: period === p.key ? primaryColor : "transparent",
                  color: period === p.key ? "#fff" : text,
                  borderColor: period === p.key ? primaryColor : borderColor,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ ...styles.error, color: currentTheme?.error || "var(--nt-error)" }}>{error}</div>
        )}

        {chartData.length > 0 && (
          <div
            style={{
              ...styles.card,
              background: surface,
              border: `1px solid ${borderColor}`,
            }}
          >
            <h3
              style={{
                color: text,
                margin: "0 0 16px",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              <FontAwesomeIcon
                icon={faChartLine}
                style={{ marginRight: 8, color: secondaryColor }}
              />
              Топ-5 по карточкам — {periodLabel}
            </h3>
            <ResponsiveContainer width="100%" height={240}>
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
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fontSize: 12,
                    fill: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  cursor={{
                    fill: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.04)",
                  }}
                  contentStyle={{
                    background: isDark ? "rgba(28,28,28,0.96)" : "#fff",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#e0e0e0"}`,
                    borderRadius: 8,
                  }}
                  formatter={(value) => [`${value}`, "Карточек"]}
                  labelFormatter={(label) => {
                    const item = chartData.find((d) => d.name === label);
                    return item?.fullName || label;
                  }}
                />
                <Bar dataKey="cards" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((item, i) => (
                    <Cell
                      key={item.key}
                      fill={item.isEmpty ? (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)") : (i < 3 ? MEDAL_COLORS[i] : primaryColor)}
                      opacity={item.isEmpty ? 0.3 : (i < 3 ? 1 : 0.75)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {topFiveLeaderboard.length > 0 && (
          <div
            style={{
              ...styles.card,
              background: surface,
              border: `1px solid ${borderColor}`,
            }}
          >
            <table className="leaderboard-table">
              <thead>
                <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
                  <th className="leaderboard-th">#</th>
                  <th style={{ ...styles.th, textAlign: "left" }}>Имя</th>
                  <th className="leaderboard-th">
                    <FontAwesomeIcon icon={faBrain} /> Карточки
                  </th>
                  <th className="leaderboard-th">
                    <FontAwesomeIcon icon={faFire} /> Серия
                  </th>
                  <th className="leaderboard-th">
                    <FontAwesomeIcon icon={faClock} /> Время
                  </th>
                  <th className="leaderboard-th">
                    <FontAwesomeIcon icon={faBolt} /> Сессии
                  </th>
                </tr>
              </thead>
              <tbody>
                {topFiveLeaderboard.map((user, index) => (
                  <tr
                    key={user.user_id || index}
                    style={{
                      background: index % 2 === 0 ? `${text}03` : "transparent",
                      borderBottom: `1px solid ${borderColor}`,
                    }}
                  >
                    <td className="leaderboard-td">
                      {index < 3 ? (
                        <span
                          style={{
                            background: MEDAL_COLORS[index],
                            color: "#fff",
                            borderRadius: 6,
                            padding: "2px 8px",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          {index + 1}
                        </span>
                      ) : (
                        <span
                          style={{
                            color: isDark
                              ? "rgba(255,255,255,0.5)"
                              : "rgba(0,0,0,0.4)",
                            fontWeight: 600,
                          }}
                        >
                          {index + 1}
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        textAlign: "left",
                        fontWeight: 600,
                        color: text,
                      }}
                    >
                      {user.user_name}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        fontWeight: 700,
                        color: primaryColor,
                      }}
                    >
                      {user.total_cards_learned || 0}
                    </td>
                    <td className="leaderboard-td">
                      <span
                        style={{
                          color:
                            (user.current_streak || 0) > 0
                              ? "#e74c3c"
                              : isDark
                                ? "rgba(255,255,255,0.3)"
                                : "#ccc",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faFire}
                          style={{ marginRight: 3 }}
                        />
                        {user.current_streak || 0}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: textSec }}>
                      {user.total_training_time || 0} мин
                    </td>
                    <td style={{ ...styles.td, color: textSec }}>
                      {user.total_sessions || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && topFiveLeaderboard.length === 0 && !error && (
          <div className="leaderboard-empty">
            <FontAwesomeIcon
              icon={faTrophy}
              style={{
                fontSize: 48,
                color: isDark ? "rgba(255,255,255,0.2)" : "#ccc",
                marginBottom: 16,
              }}
            />
            <p style={{ color: textSec }}>
              Пока нет данных для таблицы лидеров. Начните тренироваться!
            </p>
          </div>
        )}
        {loading && leaderboard.length === 0 && (
          <div className="leaderboard-empty">
            <FontAwesomeIcon
              icon={faTrophy}
              style={{
                fontSize: 48,
                color: isDark ? "rgba(255,255,255,0.2)" : "#ccc",
                marginBottom: 16,
              }}
            />
            <p style={{ color: textSec }}>
              Загрузка таблицы лидеров...
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}

const styles = {
  container: { maxWidth: 900, margin: "0 auto", padding: "20px 0" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  periods: { display: "flex", gap: 12 },
  periodBtn: {
    padding: "7px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    border: "1px solid",
    transition: "all 0.2s",
  },
  card: { borderRadius: 12, padding: 20, marginBottom: 20 },
  error: {
    padding: 12,
    borderRadius: 8,
    background: "rgba(231,76,60,0.1)",
    marginBottom: 16,
    textAlign: "center",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "10px 12px",
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#888",
  },
  td: { padding: "12px 12px", fontSize: 14, textAlign: "center" },
  loading: { textAlign: "center", padding: 60 },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid var(--nt-border, #e0e0e0)",
    borderTopColor: "var(--nt-primary, #667eea)",
    borderRadius: "50%",
    animation: "lb-spin 0.8s linear infinite",
    margin: "0 auto 12px",
  },
  empty: { textAlign: "center", padding: 60 },
};
