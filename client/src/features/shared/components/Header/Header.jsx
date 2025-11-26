import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import "./Header.css";
import ThemeSwitcher from "../ThemeSwitcher/ThemeSwitcher";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";

const Header = ({ user, onLogout, setActiveTab, onSearch }) => {
  const { t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleAvatarClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleProfileClick = () => {
    setActiveTab("profile");
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  // Закрытие dropdown при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Получаем первую букву имени для аватара
  const getInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : "Г";
  };

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
          {/* Аватар пользователя с dropdown меню */}
          <div className="avatar-dropdown" ref={dropdownRef}>
            <button className="avatar-btn" onClick={handleAvatarClick}>
              <div className="avatar-circle">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="avatar-image"
                  />
                ) : (
                  <span className="avatar-initial">{getInitial()}</span>
                )}
              </div>
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        className="dropdown-avatar-image"
                      />
                    ) : (
                      <span className="dropdown-avatar-initial">
                        {getInitial()}
                      </span>
                    )}
                  </div>
                  <div className="dropdown-user-info">
                    <div className="dropdown-user-name">
                      {user?.name || "Гость"}
                    </div>
                    <div className="dropdown-user-email">
                      {user?.email || ""}
                    </div>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                <button
                  className="dropdown-item profile-item"
                  onClick={handleProfileClick}
                >
                  <span className="dropdown-icon">👤</span>
                  {t("profile.title")}
                </button>

                <button
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  <span className="dropdown-icon">🚪</span>
                  {t("logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
