/**
 * Точка входа для themePresets
 * Реэкспортирует все необходимые символы для обратной совместимости
 */

// Утилиты для работы с цветами
export {
  hexToRgb,
  rgbToHex,
  lightenColor,
  darkenColor,
  desaturateColor,
  getTintedColor,
} from "./colorUtils";

// Генераторы тем
export { generateLightTheme, generateDarkTheme } from "./themeGenerators";

// Пресеты и функции работы с ними
export {
  EXTENDED_PRESETS,
  PRESET_THEMES,
  getDarkPreset,
  getPreset,
} from "./presets";

// Константы (только COLOR_GROUPS, шрифты и плотность удалены)
export { COLOR_GROUPS } from "./constants";
