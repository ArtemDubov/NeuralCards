import React from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";

const ProfilePage = ({ user }) => {
  const { t } = useLanguage();

  return (
    <div className="page-container profile-page">
      <div className="page-header">
        <h2>👤 {t("profile.title")}</h2>
      </div>

      <div
        className="content-grid"
        style={{ gridTemplateColumns: "1fr 1fr", gap: "2rem" }}
      >
        <div className="content-card">
          <h3>{t("profile.personal.info")}</h3>
          <div className="profile-info">
            <div className="input-group">
              <label className="form-label">{t("profile.name")}</label>
              <input
                type="text"
                value={user?.name || ""}
                readOnly
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label className="form-label">{t("profile.email")}</label>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label className="form-label">
                {t("profile.registration.date")}
              </label>
              <input
                type="text"
                value={new Date(user?.createdAt).toLocaleDateString("ru-RU")}
                readOnly
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="content-card">
          <h3>{t("profile.statistics")}</h3>
          <div className="profile-stats">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">
                  {t("profile.stats.sets.created")}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">
                  {t("profile.stats.cards.created")}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">
                  {t("profile.stats.trainings.completed")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-card" style={{ marginTop: "2rem" }}>
        <button className="btn-tp1" style={{ width: "auto" }}>
          {t("profile.save")}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
