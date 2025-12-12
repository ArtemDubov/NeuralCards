import React, { useRef, useEffect, useState } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";

const ThemeSwitcher = () => {
  const { t, theme, themes, setTheme } = useAppStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [activatingTheme, setActivatingTheme] = useState(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Группы тем
  const themeGroups = [
    {
      nameKey: "timeOfDay",
      icon: "⏰",
      themes: ["morning", "day", "evening", "night"],
    },
    {
      nameKey: "water",
      icon: "🌊",
      themes: ["ocean", "deep-sea", "arctic-ice", "warm-waters"],
    },
    {
      nameKey: "earth",
      icon: "🌳",
      themes: ["forest", "mossy-grove", "jungle", "swamp"],
    },
    {
      nameKey: "stone",
      icon: "🪨",
      themes: ["desert-sand", "canyon", "basalt", "marble"],
    },
    {
      nameKey: "wind",
      icon: "💨",
      themes: ["sky", "mist", "storm", "zenith"],
    },
    {
      nameKey: "fire",
      icon: "🔥",
      themes: ["sunset", "ember", "volcano", "lava"],
    },
    {
      nameKey: "aesthetics",
      icon: "🎨",
      themes: ["monochrome", "cyberpunk", "neon-nights", "vintage-wine"],
    },
    {
      nameKey: "materials",
      icon: "🧵",
      themes: ["lavender-field", "rose-quartz", "coral", "velvet"],
    },
  ];

  // Найти текущую группу
  useEffect(() => {
    if (isDropdownOpen) {
      const themePage = themeGroups.findIndex((group) =>
        group.themes.includes(theme)
      );
      if (themePage >= 0 && themePage !== currentPage) {
        setCurrentPage(themePage);
      }
    }
  }, [isDropdownOpen, theme]);

  // Клик вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Сброс анимации активации
  useEffect(() => {
    if (activatingTheme) {
      const timer = setTimeout(() => {
        setActivatingTheme(null);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [activatingTheme]);

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSwitchTheme = (themeId) => {
    if (themeId !== theme) {
      setActivatingTheme(themeId);
    }
    setTheme(themeId);
  };

  const goToPage = (pageIndex) => {
    setCurrentPage(pageIndex);
  };

  const currentGroup = themeGroups[currentPage];
  const currentThemeInfo = themes.find((t) => t.id === theme);

  return (
    <div className="nt-theme__container" ref={dropdownRef}>
      <div
        className={`nt-theme__dropdown ${
          isDropdownOpen ? "nt-theme__dropdown--open" : ""
        }`}
      >
        <button
          ref={buttonRef}
          className="nt-theme__current"
          onClick={handleToggleDropdown}
          aria-label={t("switchTheme")}
          aria-expanded={isDropdownOpen}
        >
          <span className="nt-theme__icon">
            {currentThemeInfo?.icon || "🎨"}
          </span>
          <span className="nt-theme__arrow">{isDropdownOpen ? "▲" : "▼"}</span>
        </button>

        <div
          className={`nt-theme__options ${
            isDropdownOpen ? "nt-theme__options--open" : ""
          }`}
        >
          <div className="nt-theme__group-content">
            {currentGroup.themes.map((themeId) => {
              const themeItem = themes.find((t) => t.id === themeId);
              if (!themeItem) return null;

              const isActive = theme === themeItem.id;
              const isActivating = activatingTheme === themeItem.id;

              return (
                <button
                  key={themeItem.id}
                  className={`nt-theme__option ${
                    isActive ? "nt-theme__option--active" : ""
                  } ${isActivating ? "nt-theme__option--activating" : ""}`}
                  data-theme={themeItem.id}
                  onClick={() => handleSwitchTheme(themeItem.id)}
                  aria-current={isActive ? "true" : "false"}
                  disabled={isActive}
                >
                  <span className="nt-theme__option-icon">
                    {themeItem.icon}
                  </span>
                  <span className="nt-theme__option-name">
                    {t(themeItem.nameKey)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="nt-theme__group-indicators">
            {themeGroups.map((group, index) => (
              <button
                key={group.nameKey}
                className={`nt-theme__group-indicator ${
                  currentPage === index
                    ? "nt-theme__group-indicator--active"
                    : ""
                }`}
                onClick={() => goToPage(index)}
                aria-label={t(group.nameKey)}
                title={t(group.nameKey)}
              >
                {group.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
