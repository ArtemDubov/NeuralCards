import React, { useRef, useEffect } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";

const ThemeSwitcher = () => {
  const { t, theme, themes, setTheme } = useAppStore();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = useRef(null);

  // Обработчик клика вне дропдауна
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

  // Получаем информацию о текущей теме с переводом
  const currentThemeInfo = themes.find((t) => t.id === theme);

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSwitchTheme = (themeId) => {
    setTheme(themeId);
    setIsDropdownOpen(false);
  };

  return (
    <div className="nt-theme__container" ref={dropdownRef}>
      <div
        className={`nt-theme__dropdown ${
          isDropdownOpen ? "nt-theme__dropdown--open" : ""
        }`}
      >
        <button className="nt-theme__current" onClick={handleToggleDropdown}>
          <span className="nt-theme__icon">{currentThemeInfo?.icon}</span>
          <span className="nt-theme__arrow">{isDropdownOpen ? "▲" : "▼"}</span>
        </button>

        <div
          className={`nt-theme__options ${
            isDropdownOpen ? "nt-theme__options--open" : ""
          }`}
        >
          {themes.map((themeItem) => (
            <button
              key={themeItem.id}
              className={`nt-theme__option ${
                theme === themeItem.id ? "nt-theme__option--active" : ""
              }`}
              data-theme={themeItem.id}
              onClick={() => handleSwitchTheme(themeItem.id)}
            >
              <span className="nt-theme__option-icon">{themeItem.icon}</span>
              <span className="nt-theme__option-name">
                {t(themeItem.nameKey)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
