/**
 * Компонент таблицы лидерборда
 */

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBrain, faFire, faClock } from "../../../utils/icons";
import { MEDAL_COLORS } from "./constants";
import { styles } from "./styles";

export default function LeaderboardTable({
  leaderboard,
  currentTheme,
  primaryColor,
}) {
  const isDark = currentTheme?.mode === "dark";

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

  return (
    <div className="stats-table-card">
      <table className="stats-table">
        <thead>
          <tr className="stats-table-header">
            <th style={{ ...styles.th, ...styles.rankCol }}>#</th>
            <th style={{ ...styles.th, ...styles.nameCol }}>Имя</th>
            <th style={{ ...styles.th, ...styles.cardsCol }}>
              <FontAwesomeIcon icon={faBrain} style={{ marginRight: "4px" }} />
              Карточки
            </th>
            <th style={{ ...styles.th, ...styles.streakCol }}>
              <FontAwesomeIcon icon={faFire} style={{ marginRight: "4px" }} />
              Серия
            </th>
            <th style={{ ...styles.th, ...styles.timeCol }}>
              <FontAwesomeIcon icon={faClock} style={{ marginRight: "4px" }} />
              Время (мин)
            </th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((user, index) => {
            const isCurrentUser = user.is_current_user;
            return (
              <tr
                key={user.id || index}
                style={{
                  ...styles.tableRow,
                  background: isCurrentUser
                    ? isDark
                      ? "rgba(102,126,234,0.15)"
                      : "rgba(102,126,234,0.08)"
                    : index % 2 === 0
                      ? isDark
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(0,0,0,0.01)"
                      : "transparent",
                  borderLeft: isCurrentUser
                    ? `3px solid ${primaryColor}`
                    : "3px solid transparent",
                }}
              >
                <td className="stats-td">{renderRank(index + 1)}</td>
                <td style={{ ...styles.td, ...styles.nameCell }}>
                  <span style={{ fontWeight: isCurrentUser ? 700 : 500 }}>
                    {user.name}
                  </span>
                  {isCurrentUser && (
                    <span className="stats-current-user-badge">Вы</span>
                  )}
                </td>
                <td style={{ ...styles.td, ...styles.cardsCell }}>
                  {user.cards_learned || 0}
                </td>
                <td style={{ ...styles.td, ...styles.streakCell }}>
                  <span className="stats-streak-badge">
                    <FontAwesomeIcon
                      icon={faFire}
                      style={{
                        marginRight: "3px",
                        color: (user.streak || 0) > 0 ? "var(--nt-error)" : "var(--nt-text-muted)",
                      }}
                    />
                    {user.streak || 0}
                  </span>
                </td>
                <td style={{ ...styles.td, ...styles.timeCell }}>
                  {user.training_time || 0}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
