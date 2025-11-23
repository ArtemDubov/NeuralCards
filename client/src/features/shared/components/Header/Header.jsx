import React from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import "./Header.css";
import ThemeSwitcher from "../ThemeSwitcher/ThemeSwitcher";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";

const Header = ({ user, onLogout }) => {
  const { t } = useLanguage();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-logo">
          <h1>{t("app.title")}</h1>
          <p className="welcome-text">
            {t("welcome").replace("{name}", user?.name || "Гость")}
          </p>
        </div>

        <div className="header-actions">
          {/* Добавляем переключатель языка */}
          <LanguageSwitcher />

          {/* Добавляем переключатель тем */}
          <ThemeSwitcher />

          {/* Кнопка выхода */}
          <button className="btn-tp2" onClick={onLogout}>
            {t("logout")}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
