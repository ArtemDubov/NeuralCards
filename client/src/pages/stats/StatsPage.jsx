import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { statsApi } from "../../features/stats/api/statsApi";
import HourlyHeatmap from "./HourlyHeatmap";
import TrainingForecast from "./TrainingForecast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faChartLine,
  faClock,
  faBrain,
  faBullseye,
  faCalendar,
  faFire,
  faMedal,
  faArrowUp,
  faArrowDown,
  faChartBar,
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
  LineChart,
  Line,
} from "recharts";
import { getGridColor, getAxisColor, getAxisTickColor } from "../../utils/chartTheme";

const PERIODS = [
  { key: 7, label: "7 дней" },
  { key: 30, label: "30 дней" },
  { key: 90, label: "90 дней" },
];

const MEDAL_COLORS = ["var(--nt-warning)", "var(--nt-text-secondary)", "#cd7f32"];

export default function StatsPage() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme?.mode === "dark";
  const primaryColor = currentTheme?.primary || "var(--nt-primary)";
  const secondaryColor = currentTheme?.secondary || "var(--nt-purple)";

  // Leaderboard state
  const [period, setPeriod] = useState(30);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [lbLoading, setLbLoading] = useState(true);
  const [lbError, setLbError] = useState(null);

  // Weekly report state
  const [reports, setReports] = useState([]);
  const [wrLoading, setWrLoading] = useState(true);
  const [wrError, setWrError] = useState(null);

  // Heatmap & forecast loading
  const [hmLoading, setHmLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  useEffect(() => {
    loadWeeklyReport();
    loadHeatmapStatus();
  }, []);

  const loadLeaderboard = async () => {
    setLbLoading(true);
    setLbError(null);
    try {
      const response = await statsApi.getLeaderboard(50, period);
      const data = response.data;
      setLeaderboard(data.leaderboard || []);
      setCurrentUserRank(data.current_user_rank || null);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
      setLbError("Не удалось загрузить таблицу лидеров");
    } finally {
      setLbLoading(false);
    }
  };

  const loadWeeklyReport = async () => {
    setWrLoading(true);
    setWrError(null);
    try {
      const response = await statsApi.getWeeklyReport(4);
      setReports(response.data.weeks || []);
    } catch (err) {
      console.error("Error loading weekly reports:", err);
      setWrError("Не удалось загрузить отчёты");
    } finally {
      setWrLoading(false);
    }
  };

  const loadHeatmapStatus = async () => {
    setHmLoading(true);
    try {
      await statsApi.getHourlyHeatmap(30);
    } catch (err) {
      console.error("Error loading heatmap:", err);
    } finally {
      setHmLoading(false);
    }
  };

  // --- Leaderboard helpers ---
  const renderRank = (rank) => {
    if (rank <= 3) {
      return (
        <span
          style={{
            ...styles.medalBadge,
            background: MEDAL_COLORS[rank - 1],
            color: "#fff",
          }}
        >
          {rank}
        </span>
      );
    }
    return (
      <span
        style={{
          ...styles.rankText,
          color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
        }}
      >
        {rank}
      </span>
    );
  };

  const chartData = leaderboard.slice(0, 15).map((user, index) => ({
    name: user.name?.substring(0, 10) || `#${index + 1}`,
    cards: user.cards_learned || 0,
    fullName: user.name,
  }));

  // --- Weekly report helpers ---
  const getChangePercent = (current, previous) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const formatChange = (percent) => {
    if (percent === null) return null;
    const sign = percent >= 0 ? "+" : "";
    return `${sign}${percent.toFixed(1)}%`;
  };

  const weeklyChartData = [...reports].reverse().map((w) => ({
    week: `Неделя ${w.week_number}`,
    cards: w.cards_reviewed || 0,
    sessions: w.sessions_count || 0,
    accuracy: w.accuracy || 0,
    time: w.total_time || 0,
  }));

  const mostRecent = reports[0];
  const previous = reports[1];

  const metrics = [
    {
      key: "cards_reviewed",
      label: "Карточек пройдено",
      icon: faBrain,
      color: "var(--nt-info)",
      value: mostRecent?.cards_reviewed || 0,
      prevValue: previous?.cards_reviewed || 0,
    },
    {
      key: "sessions_count",
      label: "Сессий",
      icon: faCalendar,
      color: "var(--nt-purple)",
      value: mostRecent?.sessions_count || 0,
      prevValue: previous?.sessions_count || 0,
    },
    {
      key: "total_time",
      label: "Время (мин)",
      icon: faClock,
      color: "var(--nt-warning)",
      value: mostRecent?.total_time || 0,
      prevValue: previous?.total_time || 0,
    },
    {
      key: "accuracy",
      label: "Точность (%)",
      icon: faBullseye,
      color: "var(--nt-success)",
      value: mostRecent?.accuracy || 0,
      prevValue: previous?.accuracy || 0,
    },
  ];

  return (
    <PageShell currentTheme={currentTheme}>
      {/* Заголовок страницы */}
      <div className="page-header-section" style={{ marginBottom: "24px" }}>
        <h1 className="page-title" style={{ color: currentTheme.text }}>
          <FontAwesomeIcon icon={faChartLine} style={{ marginRight: "8px", color: primaryColor }} />
          Статистика
        </h1>
      </div>

      {/* SECTION 1: LEADERBOARD */}
      <section className="stats-section">
        <div className="stats-section-header">
          <h2 className="stats-section-title">
            <FontAwesomeIcon
              icon={faTrophy}
              style={{ marginRight: "12px", color: currentTheme?.warning || "var(--nt-warning)" }}
            />
            Таблица лидеров
          </h2>
          <div className="stats-period-selector">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`period-btn ${period === p.key ? 'active' : ''}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {lbError && (
          <div className="stats-error-block">
            <p style={{ color: currentTheme?.error || "var(--nt-error)" }}>{lbError}</p>
            <button onClick={loadLeaderboard} className="stats-retry-button">
              Повторить
            </button>
          </div>
        )}

        {!lbLoading && !lbError && leaderboard.length > 0 && (
          <div className="stats-card">
            <h3 className="stats-card-title">
              <FontAwesomeIcon
                icon={faChartBar}
                style={{ marginRight: "8px", color: primaryColor }}
              />
              Карточек изучено — топ-15
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={getGridColor(isDark)}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: getAxisTickColor(isDark) }}
                  axisLine={{ stroke: getAxisColor(isDark) }}
                />
                <YAxis
                  tick={{ fill: getAxisTickColor(isDark) }}
                  axisLine={{ stroke: getAxisColor(isDark) }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? `${currentTheme.surface || "rgba(28,28,28,0.96)"}ee` : "#fff",
                    border: `1px solid ${isDark ? (currentTheme.border || "rgba(255,255,255,0.15)") : "rgba(0,0,0,0.1)"}`,
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    color: currentTheme.text || (isDark ? "var(--nt-text)" : "var(--nt-text)"),
                  }}
                  itemStyle={{
                    color: currentTheme.text || (isDark ? "var(--nt-text)" : "var(--nt-text)"),
                  }}
                />
                <Bar dataKey="cards" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index < 3
                          ? MEDAL_COLORS[index]
                          : index % 2 === 0
                          ? primaryColor
                          : secondaryColor
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <table className="stats-table">
              <thead>
                <tr className="stats-table-header">
                  <th>#</th>
                  <th>Пользователь</th>
                  <th>Карточки</th>
                  <th>Серия</th>
                  <th>Время</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, index) => {
                  const isCurrentUser = currentUserRank?.user_id === user.user_id;
                  return (
                    <tr
                      key={user.user_id}
                      className={`stats-table-row ${isCurrentUser ? 'current-user' : ''}`}
                    >
                      <td>{renderRank(user.rank)}</td>
                      <td>
                        <div style={styles.userNameCell}>
                          {user.rank <= 3 && (
                            <FontAwesomeIcon
                              icon={faMedal}
                              style={{
                                color: MEDAL_COLORS[user.rank - 1],
                                marginRight: "8px",
                              }}
                            />
                          )}
                          <span>{user.user_name}</span>
                          {isCurrentUser && (
                            <span style={styles.youBadge}>Вы</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <strong>{user.cards_learned || 0}</strong>
                      </td>
                      <td>
                        <span style={styles.streakBadge}>
                          <FontAwesomeIcon
                            icon={faFire}
                            style={{ marginRight: "4px", color: currentTheme?.warning || "var(--nt-warning)" }}
                          />
                          {user.current_streak || 0}
                        </span>
                      </td>
                      <td>{user.total_training_time || 0} мин</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {lbLoading && (
          <div className="stats-loading-block">
            <div className="stats-spinner" />
            <p style={{ color: currentTheme?.textMuted }}>
              Загрузка таблицы лидеров...
            </p>
          </div>
        )}

        {!lbLoading && !lbError && leaderboard.length === 0 && (
          <div className="stats-empty-block">
            <FontAwesomeIcon
              icon={faTrophy}
              style={{
                fontSize: "48px",
                color: currentTheme?.textMuted || "#ccc",
                marginBottom: "16px",
              }}
            />
            <p style={{ color: currentTheme?.textMuted }}>
              Пока нет данных. Начните тренировки!
            </p>
          </div>
        )}
      </section>

      {/* SECTION 2: WEEKLY REPORT */}
      <section className="stats-section">
        <div className="stats-section-header">
          <h2 className="stats-section-title">
            <FontAwesomeIcon
              icon={faCalendar}
              style={{ marginRight: "12px", color: currentTheme?.secondary || "var(--nt-purple)" }}
            />
            Еженедельный отчёт
          </h2>
        </div>

        {wrError && (
          <div className="stats-error-block">
            <p style={{ color: currentTheme?.error || "var(--nt-error)" }}>{wrError}</p>
            <button onClick={loadWeeklyReport} className="stats-retry-button">
              Повторить
            </button>
          </div>
        )}

        {!wrLoading && !wrError && reports.length > 0 && (
          <>
            <div className="stats-metrics-grid">
              {metrics.map((metric) => {
                const change = getChangePercent(metric.value, metric.prevValue);
                return (
                  <div key={metric.key} className="stats-metric-card">
                    <div className="stats-metric-icon" style={{ background: `${metric.color}20` }}>
                      <FontAwesomeIcon icon={metric.icon} style={{ color: metric.color }} />
                    </div>
                    <div className="stats-metric-content">
                      <p className="stats-metric-label">{metric.label}</p>
                      <p className="stats-metric-value">{metric.value}</p>
                      {change !== null && (
                        <p
                          className="stats-metric-change"
                          style={{ color: change >= 0 ? currentTheme?.success || "var(--nt-success)" : currentTheme?.error || "var(--nt-error)" }}
                        >
                          <FontAwesomeIcon
                            icon={change >= 0 ? faArrowUp : faArrowDown}
                            style={{ marginRight: "4px" }}
                          />
                          {formatChange(change)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="stats-card">
              <h3 className="stats-card-title">
                <FontAwesomeIcon
                  icon={faChartLine}
                  style={{ marginRight: "8px", color: currentTheme?.secondary || "var(--nt-purple)" }}
                />
                Динамика по неделям
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}
                  />
                  <XAxis
                    dataKey="week"
                    tick={{ fill: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}
                  />
                  <YAxis
                    tick={{ fill: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--nt-surface)",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cards"
                    stroke="var(--nt-info)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke="var(--nt-purple)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {wrLoading && (
          <div className="stats-loading-block">
            <div className="stats-spinner" />
            <p style={{ color: currentTheme?.textMuted }}>
              Загрузка отчётов...
            </p>
          </div>
        )}

        {!wrLoading && !wrError && reports.length === 0 && (
          <div className="stats-empty-block">
            <FontAwesomeIcon
              icon={faCalendar}
              style={{
                fontSize: "48px",
                color: currentTheme?.textMuted || "#ccc",
                marginBottom: "16px",
              }}
            />
            <p style={{ color: currentTheme?.textMuted }}>
              Пока нет данных. Начните тренировки!
            </p>
          </div>
        )}
      </section>

      {/* SECTION 3: HEATMAP & FORECAST */}
      <section className="stats-section">
        <div className="stats-section-header">
          <h2 className="stats-section-title">
            <FontAwesomeIcon
              icon={faClock}
              style={{ marginRight: "12px", color: currentTheme?.warning || "var(--nt-warning)" }}
            />
            Расписание тренировок
          </h2>
        </div>

        {hmLoading && (
          <div className="stats-loading-block">
            <div className="stats-spinner" />
            <p style={{ color: currentTheme?.textMuted }}>
              Загрузка расписания...
            </p>
          </div>
        )}

        {!hmLoading && (
          <>
            <HourlyHeatmap />
            <TrainingForecast />
          </>
        )}
      </section>
    </PageShell>
  );
}
