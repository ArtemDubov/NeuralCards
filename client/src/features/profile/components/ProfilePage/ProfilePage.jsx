import React from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";

const ProfilePage = ({ user }) => {
  const { t } = useLanguage();

  return (
    <div className="container-tp5 profile-page">
      <h2>{t("profile.title")}</h2>

      <div className="profile-info">
        <div className="info-item">
          <label>{t("profile.name")}</label>
          <input
            type="text"
            value={user?.name || ""}
            readOnly
            className="profile-input"
          />
        </div>

        <div className="info-item">
          <label>{t("profile.email")}</label>
          <input
            type="email"
            value={user?.email || ""}
            readOnly
            className="profile-input"
          />
        </div>

        <div className="info-item">
          <label>Дата регистрации</label>
          <input
            type="text"
            value={new Date(user?.createdAt).toLocaleDateString("ru-RU")}
            readOnly
            className="profile-input"
          />
        </div>
      </div>

      <div className="profile-stats">
        <h3>Статистика</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">0</span>
            <span className="stat-label">Наборов создано</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">0</span>
            <span className="stat-label">Карточек создано</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">0</span>
            <span className="stat-label">Тренировок пройдено</span>
          </div>
        </div>
      </div>

      <button className="btn-tp1">{t("profile.save")}</button>
    </div>
  );
};

export default ProfilePage;
