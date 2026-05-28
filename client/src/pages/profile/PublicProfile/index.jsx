import React from "react";
import { useParams, Link } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext";
import PageShell from "../../../components/layout/PageShell";
import { usePublicProfile } from "./hooks/usePublicProfile";
import ProfileHeader from "./components/ProfileHeader";
import PublicStatsOverview from "./components/PublicStatsOverview";
import AccuracyBlock from "./components/AccuracyBlock";
import ModeDistributionChart from "./components/ModeDistributionChart";
import ActivitySection from "./components/ActivitySection";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faChartBar, faBrain } from "../../../utils/icons";
import "./styles/public-profile.css";

export default function PublicProfilePage() {
  const { currentTheme } = useTheme();
  const { userId } = useParams();
  const { 
    profile, 
    friendshipStatus, 
    loading, 
    error, 
    sendingRequest, 
    handleAddFriend 
  } = usePublicProfile(userId);

  if (loading) {
    return (
      <PageShell currentTheme={currentTheme}>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid var(--nt-border, #e0e0e0)",
              borderTopColor: currentTheme?.primary || "#667eea",
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 1s linear infinite",
            }}
          />
          <p>Загрузка профиля...</p>
        </div>
      </PageShell>
    );
  }

  if (error || !profile) {
    return (
      <PageShell currentTheme={currentTheme}>
        <Link to="/chat" className="public-profile-back-link">
          <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: "6px" }} />
          Назад к чатам
        </Link>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p>{error || "Профиль не найден"}</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell currentTheme={currentTheme}>
      <Link to="/chat" className="public-profile-back-link">
        <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: "6px" }} />
        Назад к чатам
      </Link>

      {/* Шапка профиля */}
      <ProfileHeader
        user={profile}
        friendshipStatus={friendshipStatus}
        sendingRequest={sendingRequest}
        onAddFriend={handleAddFriend}
        currentTheme={currentTheme}
      />

      {/* Основные метрики */}
      {profile.stats && (
        <PublicStatsOverview stats={profile.stats} currentTheme={currentTheme} />
      )}

      {/* Дашборд с графиками */}
      {profile.stats && (
        <div className="profile-section">
          <h3 className="profile-section-title">
            <FontAwesomeIcon
              icon={faChartBar}
              style={{ marginRight: "8px", color: currentTheme?.primary }}
            />
            Детальная статистика
          </h3>

          {/* Блок точности */}
          <AccuracyBlock 
            accuracy={profile.stats.accuracy} 
            currentTheme={currentTheme} 
          />

          {/* Календарь активности */}
          <ActivitySection
            activityCalendar={profile.activity_calendar}
            currentTheme={currentTheme}
          />

          {/* Распределение по режимам */}
          {profile.mode_distribution && Object.keys(profile.mode_distribution).length > 0 && (
            <div className="profile-subsection">
              <h4 className="profile-subsection-title">Распределение по режимам</h4>
              <ModeDistributionChart 
                modeDist={profile.mode_distribution} 
                currentTheme={currentTheme} 
              />
            </div>
          )}
        </div>
      )}

      {/* Любимые наборы */}
      {profile.favorite_sets && profile.favorite_sets.length > 0 && (
        <div className="profile-section">
          <h3 className="profile-section-title">
            <FontAwesomeIcon
              icon={faBrain}
              style={{ marginRight: "8px", color: currentTheme?.primary }}
            />
            Любимые наборы
          </h3>
          <div className="profile-sets-grid">
            {profile.favorite_sets.map((set) => (
              <div key={set.id} className="profile-set-card">
                <div className="profile-set-name">{set.title}</div>
                <div className="profile-set-meta">
                  {set.cards_count || 0} карточек · {set.sessions || 0} сессий
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}
