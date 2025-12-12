import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import ThemeSwitcher from "../ThemeSwitcher/ThemeSwitcher";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
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
    return user?.name
      ? user.name.charAt(0).toUpperCase()
      : t("user.guest.initial");
  };

  // Функция для получения цвета фона (ОБНОВЛЕНО)
  const getAvatarBackgroundColor = () => {
    // 1. Если явно указан цвет
    if (user?.avatarColor !== undefined && user?.avatarColor !== null) {
      return user.avatarColor;
    }

    // 2. Прозрачный по умолчанию (буква на фоне хедера)
    return "transparent";
  };

  // Функция для отображения аватара в хедере
  const getAvatarContent = () => {
    const backgroundColor = getAvatarBackgroundColor();

    // Если есть изображение аватара
    if (user?.avatarUrl) {
      let avatarSrc = user.avatarUrl;

      if (
        avatarSrc &&
        !avatarSrc.startsWith("http") &&
        !avatarSrc.startsWith("/api/")
      ) {
        avatarSrc = avatarSrc.startsWith("/")
          ? `/api${avatarSrc}`
          : `/api/${avatarSrc}`;
      }

      return (
        <div className="nt-header-avatar__image-container">
          <img
            src={avatarSrc}
            alt="Avatar"
            className="nt-header-avatar__image"
            onError={(e) => {
              e.target.style.display = "none";
              const fallback = document.createElement("div");
              fallback.className = "nt-header-avatar__color-fallback";
              fallback.style.cssText = `
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: ${backgroundColor};
                display: flex;
                align-items: center;
                justify-content: center;
              `;

              if (user?.avatarEmoji) {
                const emojiSpan = document.createElement("span");
                emojiSpan.className = "nt-header-avatar__emoji";
                emojiSpan.textContent = user.avatarEmoji;
                emojiSpan.style.cssText = "font-size: 1.5rem; color: white;";
                fallback.appendChild(emojiSpan);
              } else {
                const initialSpan = document.createElement("span");
                initialSpan.className = "nt-header-avatar__initial";
                initialSpan.textContent = getInitial();
                initialSpan.style.cssText =
                  "font-size: 1.2rem; font-weight: bold; color: white;";
                fallback.appendChild(initialSpan);
              }

              e.target.parentNode.appendChild(fallback);
            }}
          />
          {user?.avatarEmoji && (
            <span className="nt-header-avatar__emoji-overlay">
              {user.avatarEmoji}
            </span>
          )}
        </div>
      );
    }

    // Прозрачный фон
    if (backgroundColor === "transparent") {
      return (
        <div className="nt-header-avatar__transparent-container">
          {user?.avatarEmoji ? (
            <span className="nt-header-avatar__emoji">{user.avatarEmoji}</span>
          ) : (
            <span className="nt-header-avatar__initial">{getInitial()}</span>
          )}
        </div>
      );
    }

    // Цветной фон (с эмодзи или инициалом)
    return (
      <div
        className="nt-header-avatar__color-container"
        style={{ backgroundColor }}
      >
        {user?.avatarEmoji ? (
          <span className="nt-header-avatar__emoji">{user.avatarEmoji}</span>
        ) : (
          <span className="nt-header-avatar__initial">{getInitial()}</span>
        )}
      </div>
    );
  };

  // Функция для отображения аватара в дропдауне
  const getDropdownAvatarContent = () => {
    const backgroundColor = getAvatarBackgroundColor();

    if (user?.avatarUrl) {
      let avatarSrc = user.avatarUrl;

      if (
        avatarSrc &&
        !avatarSrc.startsWith("http") &&
        !avatarSrc.startsWith("/api/")
      ) {
        avatarSrc = avatarSrc.startsWith("/")
          ? `/api${avatarSrc}`
          : `/api/${avatarSrc}`;
      }

      return (
        <div className="nt-dropdown-avatar__image-container">
          <img
            src={avatarSrc}
            alt="Avatar"
            className="nt-dropdown-avatar__image"
          />
          {user?.avatarEmoji && (
            <span className="nt-dropdown-avatar__emoji-overlay">
              {user.avatarEmoji}
            </span>
          )}
        </div>
      );
    }

    // Прозрачный фон в дропдауне
    if (backgroundColor === "transparent") {
      return (
        <div className="nt-dropdown-avatar__transparent-container">
          {user?.avatarEmoji ? (
            <span className="nt-dropdown-avatar__emoji">
              {user.avatarEmoji}
            </span>
          ) : (
            <span className="nt-dropdown-avatar__initial">{getInitial()}</span>
          )}
        </div>
      );
    }

    return (
      <div
        className="nt-dropdown-avatar__color-container"
        style={{ backgroundColor }}
      >
        {user?.avatarEmoji ? (
          <span className="nt-dropdown-avatar__emoji">{user.avatarEmoji}</span>
        ) : (
          <span className="nt-dropdown-avatar__initial">{getInitial()}</span>
        )}
      </div>
    );
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

          <div className="nt-header__dropdown-container" ref={dropdownRef}>
            {/* АВАТАРКА В ХЕДЕРЕ */}
            <button
              ref={avatarRef}
              className="nt-header__avatar-button"
              onClick={handleAvatarClick}
              title={user?.name || t("user.guest")}
              style={{
                background: "transparent",
                backgroundColor: "transparent",
                backgroundImage: "none",
              }}
            >
              {getAvatarContent()}
            </button>

            {/* ВЫПАДАЮЩЕЕ МЕНЮ */}
            {isDropdownOpen && (
              <div
                className="nt-header__dropdown-menu"
                style={{
                  maxWidth: "calc(100vw - 40px)",
                  minWidth: "200px",
                }}
              >
                {/* ЗАГОЛОВОК МЕНЮ */}
                <div className="nt-header__dropdown-header">
                  <div className="nt-header__dropdown-user">
                    <div
                      className="nt-header__dropdown-avatar-button"
                      onClick={() => {
                        setActiveTab("profile");
                        setIsDropdownOpen(false);
                      }}
                      style={{ cursor: "pointer" }}
                      title={t("profile.avatar.change_title")}
                    >
                      {getDropdownAvatarContent()}
                    </div>
                    <div className="nt-header__dropdown-user-info">
                      <div className="nt-header__dropdown-name">
                        {user?.name || t("user.guest")}
                      </div>
                      <div className="nt-header__dropdown-email">
                        {user?.email || ""}
                      </div>
                      <div className="nt-header__dropdown-premium-status">
                        <span
                          style={{
                            color: isPremium ? "#2E7D32" : "#757575",
                            fontSize: "0.85rem",
                          }}
                        >
                          {isPremium
                            ? t("premium.status.active.short")
                            : t("premium.status.inactive.very_short")}
                        </span>
                      </div>
                    </div>
                  </div>
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
