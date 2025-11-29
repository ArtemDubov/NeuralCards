import React, { useRef, useEffect } from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { useTheme } from "../../../../contexts/ThemeContext";

const ThemeSwitcher = () => {
  const { t } = useLanguage();
  const {
    currentTheme,
    isDropdownOpen,
    themes,
    switchTheme,
    toggleDropdown,
    closeDropdown,
  } = useTheme();

  const dropdownRef = useRef(null);

  // Обработчик клика вне дропдауна
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeDropdown]);

  // Получаем информацию о текущей теме с переводом
  const currentThemeInfo = themes.find((theme) => theme.id === currentTheme);

  return (
    <div className="theme-switcher-container" ref={dropdownRef}>
      <div className="theme-switcher-dropdown">
        <button className="theme-current btn-tp7" onClick={toggleDropdown}>
          <span className="theme-icon">{currentThemeInfo?.icon}</span>
          <span className="theme-arrow">{isDropdownOpen ? "▲" : "▼"}</span>
        </button>

        <div className={`theme-options ${isDropdownOpen ? "open" : ""}`}>
          {themes.map((theme) => (
            <button
              key={theme.id}
              className={`theme-option ${
                currentTheme === theme.id ? "active" : ""
              }`}
              onClick={() => switchTheme(theme.id)}
            >
              <span className="theme-option-icon">{theme.icon}</span>
              <span className="theme-option-name text-primary dropdown-text-active">
                {t(theme.nameKey)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
