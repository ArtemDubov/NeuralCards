/**
 * Страница таблицы лидеров
 */

import React, { useState, useEffect } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import PageShell from "../../../components/layout/PageShell";
import { statsApi } from "../../../features/stats/api/statsApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy, faMedal } from "../../../utils/icons";
import { PERIODS } from "./constants";
import LeaderboardChart from "./LeaderboardChart";
import LeaderboardTable from "./LeaderboardTable";

export default function LeaderboardPage() {
  const { currentTheme } = useTheme();
  const [period, setPeriod] = useState(30);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await statsApi.getLeaderboard(50, period);
      const data = response.data;
      setLeaderboard(data.leaderboard || []);
      setCurrentUserRank(data.current_user_rank || null);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
      setError("Не удалось загрузить таблицу лидеров");
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = currentTheme?.primary || "#667eea";

  if (loading) {
    return (
      <PageShell currentTheme={currentTheme}>
        <div className="stats-loading-container">
          <div className="stats-spinner" />
          <p style={{ color: currentTheme?.textMuted }}>
            Загрузка таблицы лидеров...
          </p>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell currentTheme={currentTheme}>
        <div className="stats-error-container">
          <p style={{ color: currentTheme?.error || "var(--nt-error)" }}>{error}</p>
          <button onClick={loadLeaderboard} className="stats-retry-button">
            Повторить
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell currentTheme={currentTheme}>
      {/* Заголовок и переключатель периодов */}
      <div className="stats-header">
        <h1 className="stats-title">
          <FontAwesomeIcon
            icon={faTrophy}
            style={{ marginRight: "12px", color: "var(--nt-warning)" }}
          />
          Таблица лидеров
        </h1>
        <div className="stats-period-selector">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
                border: `1px solid ${period === p.key ? primaryColor : currentTheme?.border || "#e0e0e0"}`,
                background: period === p.key ? primaryColor : "transparent",
                color: period === p.key ? "#fff" : currentTheme?.text,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Диаграмма топ-15 */}
      {leaderboard.length > 0 && (
        <LeaderboardChart
          leaderboard={leaderboard}
          currentTheme={currentTheme}
          primaryColor={primaryColor}
        />
      )}

      {/* Полная таблица */}
      <LeaderboardTable
        leaderboard={leaderboard}
        currentTheme={currentTheme}
        primaryColor={primaryColor}
      />

      {/* Ранг текущего пользователя */}
      {currentUserRank && !leaderboard.some((u) => u.is_current_user) && (
        <div className="stats-your-rank-card">
          <FontAwesomeIcon
            icon={faMedal}
            style={{
              marginRight: "8px",
              color: primaryColor,
              fontSize: "18px",
            }}
          />
          Ваш ранг: <strong>#{currentUserRank.rank}</strong> из{" "}
          {currentUserRank.total_users} участников
        </div>
      )}

      {leaderboard.length === 0 && (
        <div className="stats-empty-state">
          <FontAwesomeIcon
            icon={faTrophy}
            style={{
              fontSize: "48px",
              color: currentTheme?.textMuted || "#ccc",
              marginBottom: "16px",
            }}
          />
          <p style={{ color: currentTheme?.textMuted }}>
            Пока нет данных для таблицы лидеров
          </p>
        </div>
      )}
    </PageShell>
  );
}
