/**
 * Система пресетов тем - Базовые цвета
 * 9 основных цветов с уникальными светлыми и тёмными версиями
 * Полная градиентная гармония - все цвета соответствуют основной теме
 */
/**
 * Файл-обертка для обратной совместимости
 * Все импорты теперь идут из ./themePresets/
 */

export * from "./themePresets";

// Вспомогательные функции для работы с цветами
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 100, g: 100, b: 100 };
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function lightenColor(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  );
}

function darkenColor(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

function desaturateColor(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  return rgbToHex(
    r + (gray - r) * amount,
    g + (gray - g) * amount,
    b + (gray - b) * amount,
  );
}

function getTintedColor(hex, tintHex, amount) {
  const { r: r1, g: g1, b: b1 } = hexToRgb(hex);
  const { r: r2, g: g2, b: b2 } = hexToRgb(tintHex);
  return rgbToHex(
    Math.round(r1 * (1 - amount) + r2 * amount),
    Math.round(g1 * (1 - amount) + g2 * amount),
    Math.round(b1 * (1 - amount) + b2 * amount),
  );
}

// Генератор семантических цветов на основе основного цвета темы
const generateSemanticColors = (primary, isDark = false) => {
  if (isDark) {
    return {
      success: "#27ae60",
      successLight: "rgba(39, 174, 96, 0.15)",
      error: "#c0392b",
      errorLight: "rgba(192, 57, 43, 0.15)",
      warning: "#d68910",
      warningLight: "rgba(214, 137, 16, 0.15)",
      info: primary,
      infoLight: `${primary}20`,
    };
  }
  return {
    success: "#27ae60",
    successLight: getTintedColor("#d5f5e3", primary, 0.1),
    error: "#c0392b",
    errorLight: getTintedColor("#fadbd8", primary, 0.1),
    warning: "#d68910",
    warningLight: getTintedColor("#fdebd0", primary, 0.1),
    info: primary,
    infoLight: `${primary}15`,
  };
};

// Генератор СВЕТЛОЙ темы с полной градиентной гармонией
const generateLightTheme = (primary, secondary, accent, name, config = {}) => {
  const primaryLight = lightenColor(primary, 0.35);
  const primaryLighter = lightenColor(primary, 0.5);
  const textDark = darkenColor(primary, 0.65);

  return {
    name,
    mode: "light",
    colors: {
      ...generateSemanticColors(primary, false),
      primary,
      secondary,
      accent,

      // Фоны с оттенком primary
      background:
        config.background || getTintedColor(primaryLighter, "#ffffff", 0.3),
      backgroundSecondary:
        config.backgroundSecondary ||
        getTintedColor(primaryLight, "#ffffff", 0.5),
      surface: config.surface || "#ffffff",
      surfaceElevated: config.surfaceElevated || "#ffffff",

      // Текст с оттенком primary
      text: config.text || textDark,
      textSecondary: config.textSecondary || darkenColor(primary, 0.45),
      textMuted: config.textMuted || darkenColor(primary, 0.25),

      // Границы с оттенком primary
      border: config.border || getTintedColor(primaryLight, "#e0e0e0", 0.5),
      borderLight:
        config.borderLight || getTintedColor(primaryLighter, "#ffffff", 0.7),
      borderDark: config.borderDark || primaryLight,

      // Компоненты
      headerBackground: primary,
      headerText: "#ffffff",
      buttonPrimaryBg: primary,
      buttonPrimaryText: "#ffffff",
      buttonSecondaryBg: getTintedColor(primaryLight, "#e0e0e0", 0.4),
      buttonSecondaryText: textDark,
      cardBackground: config.cardBackground || "#ffffff",
      cardShadow: `rgba(${hexToRgb(primary)}, 0.12)`,
      linkColor: primary,
      linkHover: secondary,

      // Градиенты
      gradientStart: primary,
      gradientEnd: secondary,

      // Скроллбар
      scrollbarThumb: getTintedColor(primaryLight, "#cccccc", 0.5),
      scrollbarTrack: getTintedColor(primaryLighter, "#f0f0f0", 0.6),

      // Настройки
      borderRadius: config.borderRadius || "10px",
      shadows: config.shadows || `0 2px 8px rgba(${hexToRgb(primary)}, 0.12)`,
    },
    density: "normal",
  };
};

// Генератор ТЁМНОЙ темы с полной градиентной гармонией
// ИСПРАВЛЕНО: хедер и кнопки теперь тёмные, гармонирующие с темой
const generateDarkTheme = (primary, secondary, accent, name, config = {}) => {
  const primaryDark = darkenColor(primary, 0.55);
  const primaryDarker = darkenColor(primary, 0.75);
  const primaryLight = lightenColor(primary, 0.15);
  const primaryMuted = desaturateColor(primary, 0.35);
  const primaryDesaturated = desaturateColor(primary, 0.5);

  return {
    name,
    mode: "dark",
    colors: {
      ...generateSemanticColors(primary, true),
      primary: primaryLight,
      secondary: desaturateColor(secondary, 0.25),
      accent,

      // Фоны тёмные с оттенком primary
      background:
        config.background || getTintedColor(primaryDarker, "#0a0a0a", 0.3),
      backgroundSecondary:
        config.backgroundSecondary ||
        getTintedColor(primaryDarker, "#1a1a1a", 0.5),
      surface: config.surface || getTintedColor(primaryDark, "#1a1a1a", 0.4),
      surfaceElevated: config.surfaceElevated || primaryDark,

      // Текст приглушённый
      text: config.text || getTintedColor("#d0d0d0", primaryLight, 0.15),
      textSecondary:
        config.textSecondary || getTintedColor("#909090", primaryMuted, 0.2),
      textMuted:
        config.textMuted || getTintedColor("#555555", primaryDesaturated, 0.25),

      // Границы тёмные с оттенком primary
      border: config.border || getTintedColor(primaryMuted, "#2d2d2d", 0.4),
      borderLight:
        config.borderLight || getTintedColor(primaryDark, "#3a3a3a", 0.5),
      borderDark:
        config.borderDark || getTintedColor(primaryDarker, "#1a1a1a", 0.6),

      // Компоненты - ИСПРАВЛЕНО: хедер тёмный, кнопки гармоничные
      headerBackground: config.headerBackground || primaryDark,
      headerText: getTintedColor("#ffffff", primaryLight, 0.1),
      buttonPrimaryBg: primary,
      buttonPrimaryText: "#ffffff",
      buttonSecondaryBg: primaryDark,
      buttonSecondaryText: getTintedColor("#d0d0d0", primaryLight, 0.15),
      cardBackground: config.cardBackground || primaryDark,
      cardShadow: `rgba(0, 0, 0, 0.5)`,
      linkColor: primaryLight,
      linkHover: secondary,

      // Градиенты
      gradientStart: primary,
      gradientEnd: secondary,

      // Скроллбар
      scrollbarThumb: getTintedColor(primaryMuted, "#4a4a4a", 0.5),
      scrollbarTrack: getTintedColor(primaryDarker, "#1a1a1a", 0.7),

      // Настройки
      borderRadius: config.borderRadius || "10px",
      shadows: config.shadows || `0 2px 8px rgba(0, 0, 0, 0.5)`,
    },
    density: "normal",
  };
};

// ============================================================================
// БАЗОВЫЕ ЦВЕТА - 9 основных цветов (убраны голубой и белый)
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

// Группы цветов для UI
export const COLOR_GROUPS = {
  main: {
    name: "🎨 Основные цвета",
    colors: ["primary", "secondary", "accent"],
  },
  backgrounds: {
    name: "🌈 Фоны",
    colors: ["background", "backgroundSecondary", "surface", "surfaceElevated"],
  },
  text: {
    name: "📝 Текст",
    colors: ["text", "textSecondary", "textMuted", "textInverse"],
  },
  borders: {
    name: "🔲 Границы",
    colors: ["border", "borderLight", "borderDark"],
  },
  semantic: {
    name: "⚡ Семантика",
    colors: [
      "success",
      "successLight",
      "error",
      "errorLight",
      "warning",
      "warningLight",
      "info",
      "infoLight",
    ],
  },
  components: {
    name: "🧩 Компоненты",
    colors: [
      "headerBackground",
      "headerText",
      "buttonPrimaryBg",
      "buttonPrimaryText",
      "buttonSecondaryBg",
      "buttonSecondaryText",
      "cardBackground",
      "linkColor",
      "linkHover",
    ],
  },
  effects: {
    name: "✨ Эффекты",
    colors: [
      "gradientStart",
      "gradientEnd",
      "scrollbarThumb",
      "scrollbarTrack",
      "cardShadow",
    ],
  },
};

// Шрифты
export const FONT_PRESETS = {
  system: {
    name: "Системный",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  modern: {
    name: "Современный",
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
  },
  classic: {
    name: "Классический",
    fontFamily: '"Georgia", "Times New Roman", serif',
  },
  monospace: {
    name: "Моноширинный",
    fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
  },
  playful: {
    name: "Игривый",
    fontFamily: '"Comic Sans MS", "Chalkboard", cursive, sans-serif',
  },
};

// Плотность
export const DENSITY_SETTINGS = {
  compact: {
    name: "Компактная",
    spacingXs: 4,
    spacingSm: 8,
    spacingMd: 12,
    spacingLg: 16,
    spacingXl: 20,
    spacing2xl: 24,
    spacing3xl: 32,
    componentPadding: "12px 16px",
    cardPadding: "16px",
    sectionPadding: "20px",
  },
  normal: {
    name: "Нормальная",
    spacingXs: 6,
    spacingSm: 12,
    spacingMd: 16,
    spacingLg: 20,
    spacingXl: 24,
    spacing2xl: 32,
    spacing3xl: 40,
    componentPadding: "14px 20px",
    cardPadding: "20px",
    sectionPadding: "28px",
  },
  spacious: {
    name: "Просторная",
    spacingXs: 8,
    spacingSm: 16,
    spacingMd: 24,
    spacingLg: 32,
    spacingXl: 40,
    spacing2xl: 48,
    spacing3xl: 64,
    componentPadding: "16px 24px",
    cardPadding: "28px",
    sectionPadding: "40px",
  },
};
