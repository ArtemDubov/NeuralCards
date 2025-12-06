import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import ThemeSwitcher from "../ThemeSwitcher/ThemeSwitcher";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import PremiumButton from "../../../premium/components/PremiumButton/PremiumButton";
import { usePremium } from "../../../../hooks/usePremium";

const Header = ({ user, onLogout, setActiveTab }) => {
  const { t } = useAppStore();
  const { isPremium } = usePremium();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : "Г";
  };

  return (
    <header className="nt-app__header">
      <div className="nt-app__header-content">
        <div className="nt-app__logo">
          <h1 className="nt-util__text-accent">{t("app.title")}</h1>
          <p className="nt-app__welcome">
            {t("welcome").replace("{name}", user?.name || t("user.guest"))}
          </p>
        </div>
        <div className="nt-app__header-actions">
          <LanguageSwitcher />
          <ThemeSwitcher />

          {/* УБИРАЕМ КНОПКУ ПРЕМИУМА ИЗ ХЕДЕРА - остаётся только в выпадающем меню */}

          <div className="nt-header__dropdown-container" ref={dropdownRef}>
            {/* АВАТАРКА В ХЕДЕРЕ */}
            <button
              ref={avatarRef}
              className="nt-app__header-avatar"
              onClick={handleAvatarClick}
              title={user?.name || t("user.guest")}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="nt-app__header-avatar-img"
                />
              ) : (
                <span className="nt-app__header-avatar-initial">
                  {getInitial()}
                </span>
              )}
            </button>

            {/* ВЫПАДАЮЩЕЕ МЕНЮ */}
            {isDropdownOpen && (
              <div
                className="nt-header__dropdown-menu"
                style={{
                  maxWidth: "calc(100vw - 40px)",
                }}
              >
                {/* ЗАГОЛОВОК МЕНЮ */}
                <div className="nt-header__dropdown-header">
                  <div className="nt-header__dropdown-user">
                    <div className="nt-header__dropdown-avatar">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Avatar"
                          className="nt-header__dropdown-avatar-img"
                        />
                      ) : (
                        <span className="nt-header__dropdown-avatar-initial">
                          {getInitial()}
                        </span>
                      )}
                    </div>
                    <div className="nt-header__dropdown-user-info">
                      <div className="nt-header__dropdown-name">
                        {user?.name || t("user.guest")}
                      </div>
                      <div className="nt-header__dropdown-email">
                        {user?.email || ""}
                      </div>
                      <div className="nt-header__dropdown-premium-status">
                        {isPremium ? (
                          <span style={{ color: "#2E7D32", fontWeight: "600" }}>
                            ⭐ Премиум активен
                          </span>
                        ) : (
                          <span style={{ color: "#FFA500" }}>
                            ⭐ Базовый аккаунт
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* БЛОК ПРЕМИУМ В МЕНЮ - остаётся только здесь */}
                <div className="nt-header__dropdown-premium">
                  <div className="nt-header__dropdown-premium-info">
                    <div className="nt-header__dropdown-premium-label">
                      Премиум подписка
                    </div>
                    <div
                      className={`nt-header__dropdown-premium-status ${
                        isPremium
                          ? "nt-header__dropdown-premium-status--active"
                          : ""
                      }`}
                    >
                      {isPremium ? "Активна" : "Не активна"}
                    </div>
                  </div>
                  <PremiumButton compact={true} />
                </div>

                {/* ОПЦИИ МЕНЮ */}
                <div className="nt-header__dropdown-options">
                  <button
                    className="nt-header__dropdown-option"
                    onClick={handleProfileClick}
                  >
                    <span className="nt-header__dropdown-option-icon">👤</span>
                    <span className="nt-header__dropdown-option-text">
                      {t("profile.title")}
                    </span>
                  </button>

                  <button
                    className="nt-header__dropdown-option nt-header__dropdown-option--logout"
                    onClick={handleLogout}
                  >
                    <span className="nt-header__dropdown-option-icon">🚪</span>
                    <span className="nt-header__dropdown-option-text">
                      {t("logout")}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
