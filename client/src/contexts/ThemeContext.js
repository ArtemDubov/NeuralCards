// contexts/ThemeContext.js
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";

// 🎯 Создаем контекст
const ThemeContext = createContext();

// 🎯 Начальное состояние
const initialState = {
  currentTheme: "ocean",
  isDropdownOpen: false,
  themes: [
    { id: "ocean", nameKey: "theme.ocean", icon: "🌊" },
    { id: "dark", nameKey: "theme.dark", icon: "🌙" },
    { id: "forest", nameKey: "theme.forest", icon: "🌲" },
    { id: "sunset", nameKey: "theme.sunset", icon: "🌅" },
    { id: "light", nameKey: "theme.light", icon: "☀️" },
  ],
};

// 🎯 Редуктор для управления состоянием
const themeReducer = (state, action) => {
  console.log(`🎨 [ThemeReducer] Action: ${action.type}`, action.payload || "");

  switch (action.type) {
    case "SET_THEME":
      return {
        ...state,
        currentTheme: action.payload,
      };

    case "TOGGLE_DROPDOWN":
      return {
        ...state,
        isDropdownOpen: !state.isDropdownOpen,
      };

    case "CLOSE_DROPDOWN":
      return {
        ...state,
        isDropdownOpen: false,
      };

    case "INIT_THEME":
      return {
        ...state,
        currentTheme: action.payload,
      };

    default:
      console.warn(`⚠️ [ThemeReducer] Unknown action type: ${action.type}`);
      return state;
  }
};

// 🎯 Провайдер контекста
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // 🎯 Инициализация темы при загрузке
  useEffect(() => {
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem("neuraltrident-theme");

      // Проверяем сохраненную тему
      if (savedTheme && initialState.themes.find((t) => t.id === savedTheme)) {
        console.log(
          "🎨 [ThemeProvider] Восстанавливаем сохраненную тему:",
          savedTheme
        );
        applyTheme(savedTheme);
        dispatch({ type: "INIT_THEME", payload: savedTheme });
      } else {
        // Проверяем системные настройки
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        const defaultTheme = systemPrefersDark ? "dark" : "ocean";

        console.log(
          "🎨 [ThemeProvider] Используем тему по умолчанию:",
          defaultTheme
        );
        applyTheme(defaultTheme);
        dispatch({ type: "INIT_THEME", payload: defaultTheme });
        localStorage.setItem("neuraltrident-theme", defaultTheme);
      }
    };

    initializeTheme();
  }, []);

  // 🎯 Применение темы к DOM
  const applyTheme = useCallback((themeId) => {
    console.log("🎨 [ThemeProvider] Применяем тему:", themeId);
    document.documentElement.setAttribute("data-theme", themeId);
  }, []);

  // 🎯 Переключение темы
  const switchTheme = useCallback(
    (themeId) => {
      console.log("🎨 [ThemeProvider] Переключаем тему на:", themeId);

      // ВРЕМЕННО применяем transition ко ВСЕМ элементам
      const style = document.createElement("style");
      style.textContent = `* { transition: var(--transition) !important; }`;
      style.id = "theme-transition-override";
      document.head.appendChild(style);

      // Сохраняем в localStorage
      localStorage.setItem("neuraltrident-theme", themeId);

      // Применяем к DOM
      applyTheme(themeId);

      // Обновляем состояние
      dispatch({ type: "SET_THEME", payload: themeId });
      dispatch({ type: "CLOSE_DROPDOWN" });

      // Убираем временный стиль через 100ms
      setTimeout(() => {
        const styleElement = document.getElementById(
          "theme-transition-override"
        );
        if (styleElement) {
          styleElement.remove();
        }
      }, 100);
    },
    [applyTheme]
  );

  // 🎯 Переключение дропдауна
  const toggleDropdown = useCallback(() => {
    console.log("🎨 [ThemeProvider] Переключаем дропдаун");
    dispatch({ type: "TOGGLE_DROPDOWN" });
  }, []);

  // 🎯 Закрытие дропдауна
  const closeDropdown = useCallback(() => {
    console.log("🎨 [ThemeProvider] Закрываем дропдаун");
    dispatch({ type: "CLOSE_DROPDOWN" });
  }, []);

  // 🎯 Получение текущей темы с переводом
  const getCurrentThemeWithTranslation = useCallback(
    (t) => {
      const theme = state.themes.find((t) => t.id === state.currentTheme);
      return {
        ...theme,
        name: t(theme.nameKey),
      };
    },
    [state.currentTheme, state.themes]
  );

  // 🎯 Значение контекста
  const value = {
    // Состояние
    currentTheme: state.currentTheme,
    isDropdownOpen: state.isDropdownOpen,
    themes: state.themes,

    // Методы
    switchTheme,
    toggleDropdown,
    closeDropdown,
    getCurrentThemeWithTranslation,

    // Утилиты
    applyTheme,
  };

  console.log("🎨 [ThemeProvider] Рендер:", {
    currentTheme: state.currentTheme,
    isDropdownOpen: state.isDropdownOpen,
  });

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// 🎯 Хук для использования
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

export default ThemeContext;
