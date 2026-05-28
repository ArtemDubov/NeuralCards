/**
 * Генераторы светлой и тёмной тем
 * Создают полную палитру на основе основных цветов
 */

import {
  hexToRgb,
  lightenColor,
  darkenColor,
  desaturateColor,
  getTintedColor,
} from "./colorUtils";

// Генератор семантических цветов (success, error, warning, info)
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
export const generateLightTheme = (
  primary,
  secondary,
  accent,
  name,
  config = {},
) => {
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
export const generateDarkTheme = (
  primary,
  secondary,
  accent,
  name,
  config = {},
) => {
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
        config.textMuted ||
        getTintedColor("#555555", primaryDesaturated, 0.25),

      // Границы тёмные с оттенком primary
      border: config.border || getTintedColor(primaryMuted, "#2d2d2d", 0.4),
      borderLight:
        config.borderLight || getTintedColor(primaryDark, "#3a3a3a", 0.5),
      borderDark:
        config.borderDark || getTintedColor(primaryDarker, "#1a1a1a", 0.6),

      // Компоненты - хедер тёмный, кнопки гармоничные
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
