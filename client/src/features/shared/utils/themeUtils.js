// Утилиты для работы с темами (совместимость со старым кодом)
export const themeUtils = {
  // Получить текущую тему
  getCurrentTheme: () => {
    return localStorage.getItem("neuraltrident-theme") || "ocean";
  },

  // Установить тему
  setTheme: (themeId) => {
    localStorage.setItem("neuraltrident-theme", themeId);
    document.documentElement.setAttribute("data-theme", themeId);
  },

  // Получить информацию о теме
  getThemeInfo: (themeId) => {
    const themes = {
      ocean: { name: "Океан", icon: "🌊", colors: ["#667eea", "#4fc3f7"] },
      dark: { name: "Тёмная", icon: "🌙", colors: ["#8b5cf6", "#60a5fa"] },
      forest: { name: "Лесная", icon: "🌲", colors: ["#059669", "#10b981"] },
      sunset: { name: "Закат", icon: "🌅", colors: ["#ea580c", "#f97316"] },
      light: { name: "Светлая", icon: "☀️", colors: ["#3b82f6", "#06b6d4"] },
    };
    return themes[themeId] || themes.ocean;
  },

  // Применить тему при загрузке приложения
  applySavedTheme: () => {
    const savedTheme = localStorage.getItem("neuraltrident-theme") || "ocean";
    document.documentElement.setAttribute("data-theme", savedTheme);
    return savedTheme;
  },

  // Получить все темы
  getAllThemes: () => {
    return [
      { id: "ocean", name: "🌊 Океан", icon: "🌊" },
      { id: "dark", name: "🌙 Тёмная", icon: "🌙" },
      { id: "forest", name: "🌲 Лесная", icon: "🌲" },
      { id: "sunset", name: "🌅 Закат", icon: "🌅" },
      { id: "light", name: "☀️ Светлая", icon: "☀️" },
    ];
  },

  // Новые функции для контекста
  getSystemTheme: () => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  },

  watchSystemTheme: (callback) => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => callback(e.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  },
};
