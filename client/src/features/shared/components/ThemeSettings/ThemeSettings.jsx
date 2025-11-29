import React, { useState, useEffect } from "react";
import ThemePreview from "../../../shared/components/ThemePreview/ThemePreview";

const ThemeSettings = () => {
  const [currentTheme, setCurrentTheme] = useState("ocean");

  const themes = [
    { id: "ocean", name: "Океан", icon: "🌊" },
    { id: "dark", name: "Тёмная", icon: "🌙" },
    { id: "forest", name: "Лесная", icon: "🌲" },
    { id: "sunset", name: "Закат", icon: "🌅" },
    { id: "light", name: "Светлая", icon: "☀️" },
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem("neuraltrident-theme") || "ocean";
    setCurrentTheme(savedTheme);
  }, []);

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute("data-theme", themeId);
    localStorage.setItem("neuraltrident-theme", themeId);
  };

  return (
    <div className="theme-settings container-tp5">
      <h2>Настройки темы</h2>
      <p className="settings-description">
        Выберите тему оформления, которая вам больше нравится
      </p>

      <div className="themes-grid">
        {themes.map((theme) => (
          <ThemePreview
            key={theme.id}
            theme={theme}
            isActive={currentTheme === theme.id}
            onClick={() => handleThemeChange(theme.id)}
          />
        ))}
      </div>

      <div className="current-theme-info">
        <h3>Текущая тема: {themes.find((t) => t.id === currentTheme)?.name}</h3>
        <p>
          Все элементы интерфейса автоматически адаптируются под выбранную тему
        </p>
      </div>
    </div>
  );
};

export default ThemeSettings;
