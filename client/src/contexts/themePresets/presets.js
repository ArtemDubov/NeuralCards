/**
 * Пресеты тем - 9 основных цветов
 * Каждый цвет имеет светлую и тёмную версию
 */

import { generateLightTheme, generateDarkTheme } from "./themeGenerators";

// ============================================================================
// БАЗОВЫЕ ЦВЕТА - 9 основных цветов
// ============================================================================
export const EXTENDED_PRESETS = {
  // КРАСНЫЙ
  red: {
    light: generateLightTheme("#c0392b", "#e74c3c", "#ff6b6b", "Красный", {
      background: "#fef7f7",
      surface: "#ffffff",
    }),
    dark: generateDarkTheme("#e76f6f", "#d65a5a", "#ff8a8a", "Красный Тёмный", {
      background: "#2a1515",
      surface: "#3a1f1f",
    }),
  },

  // ОРАНЖЕВЫЙ
  orange: {
    light: generateLightTheme("#d35400", "#e67e22", "#ff9f43", "Оранжевый", {
      background: "#fff8f2",
      surface: "#ffffff",
    }),
    dark: generateDarkTheme(
      "#ff9f5a",
      "#e67e3a",
      "#ffb57b",
      "Оранжевый Тёмный",
      {
        background: "#2a1f15",
        surface: "#3a2a1a",
      },
    ),
  },

  // ЖЁЛТЫЙ
  yellow: {
    light: generateLightTheme("#f39c12", "#f1c40f", "#fdd835", "Жёлтый", {
      background: "#fffef0",
      surface: "#ffffff",
      text: "#4a3f1a",
    }),
    dark: generateDarkTheme("#ffd54f", "#ffca28", "#ffe082", "Жёлтый Тёмный", {
      background: "#2a2510",
      surface: "#3a3518",
    }),
  },

  // ЗЕЛЁНЫЙ
  green: {
    light: generateLightTheme("#27ae60", "#2ecc71", "#58d68d", "Зелёный", {
      background: "#f2fbf5",
      surface: "#ffffff",
    }),
    dark: generateDarkTheme("#58d68d", "#52be80", "#77dda3", "Зелёный Тёмный", {
      background: "#12241a",
      surface: "#1a3424",
    }),
  },

  // СИНИЙ
  blue: {
    light: generateLightTheme("#2980b9", "#3498db", "#5dade2", "Синий", {
      background: "#f0f8fc",
      surface: "#ffffff",
    }),
    dark: generateDarkTheme("#5dade2", "#3498db", "#85c1e9", "Синий Тёмный", {
      background: "#121e2e",
      surface: "#1a2a3e",
    }),
  },

  // ФИОЛЕТОВЫЙ
  purple: {
    light: generateLightTheme("#8e44ad", "#9b59b6", "#af7ac5", "Фиолетовый", {
      background: "#faf5fc",
      surface: "#ffffff",
    }),
    dark: generateDarkTheme(
      "#af7ac5",
      "#bb8fce",
      "#c39bd7",
      "Фиолетовый Тёмный",
      {
        background: "#24142e",
        surface: "#341a3e",
      },
    ),
  },

  // ЧЁРНЫЙ
  black: {
    light: generateLightTheme("#2c3e50", "#34495e", "#5dade2", "Чёрный", {
      background: "#f4f6f8",
      surface: "#ffffff",
    }),
    dark: generateDarkTheme("#7f8c8d", "#95a5a6", "#bdc3c7", "Чёрный Тёмный", {
      background: "#0a0a0a",
      surface: "#1a1a1a",
    }),
  },

  // СЕРЫЙ
  gray: {
    light: generateLightTheme("#7f8c8d", "#95a5a6", "#bdc3c7", "Серый", {
      background: "#f5f5f5",
      surface: "#ffffff",
    }),
    dark: generateDarkTheme("#95a5a6", "#bdc3c7", "#d0d0d0", "Серый Тёмный", {
      background: "#121212",
      surface: "#1e1e1e",
    }),
  },

  // КОРИЧНЕВЫЙ
  brown: {
    light: generateLightTheme("#8d6e63", "#a1887f", "#bcaaa4", "Коричневый", {
      background: "#faf7f5",
      surface: "#ffffff",
    }),
    dark: generateDarkTheme(
      "#bcaaa4",
      "#a1887f",
      "#d7ccc8",
      "Коричневый Тёмный",
      {
        background: "#241a15",
        surface: "#34261f",
      },
    ),
  },
};

// Преобразуем в формат для ThemeContext (только светлые версии для выбора)
export const PRESET_THEMES = {};
Object.entries(EXTENDED_PRESETS).forEach(([key, preset]) => {
  PRESET_THEMES[key] = preset.light;
});

// Функция для получения тёмной версии пресета
export const getDarkPreset = (presetKey) => {
  const preset = EXTENDED_PRESETS[presetKey];
  if (preset && preset.dark) {
    return preset.dark;
  }
  return null;
};

// Функция для получения пресета по ключу и режиму
export const getPreset = (presetKey, isDark = false) => {
  const preset = EXTENDED_PRESETS[presetKey];
  if (!preset) return null;
  return isDark ? preset.dark : preset.light;
};
