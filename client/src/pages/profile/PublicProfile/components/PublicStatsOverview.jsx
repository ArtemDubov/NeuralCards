import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBrain, faClock, faFire, faBullseye } from "../../../../utils/icons";

export default function PublicStatsOverview({ stats, currentTheme }) {
  if (!stats) return null;

  const metrics = [
    {
      icon: faBrain,
      value: stats.total_cards_learned || 0,
      label: "Всего карточек",
      color: currentTheme?.primary || "var(--nt-primary)",
    },
    {
      icon: faClock,
      value: `${Math.round((stats.total_training_time || 0) / 60)}ч`,
      label: "Время обучения",
      color: "var(--nt-info)",
    },
    {
      icon: faFire,
      value: stats.current_streak || 0,
      label: "Дней подряд",
      color: "var(--nt-error)",
    },
    {
      icon: faBullseye,
      value: `${stats.accuracy || 0}%`,
      label: "Точность",
      color: currentTheme?.success || "var(--nt-success)",
    },
  ];

  return (
    <div className="public-profile-stats-grid">
      {metrics.map((metric, idx) => (
        <div key={idx} className="public-profile-stat-card">
          <div className="profile-stat-icon-wrapper">
            <FontAwesomeIcon
              icon={metric.icon}
              style={{ color: metric.color, fontSize: "20px" }}
            />
          </div>
          <div className="public-profile-stat-value">{metric.value}</div>
          <div className="public-profile-stat-label">{metric.label}</div>
        </div>
      ))}
    </div>
  );
}
