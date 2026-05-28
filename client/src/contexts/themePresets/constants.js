/**
 * Константы для тем - группы цветов
 * Примечание: FONT_PRESETS и DENSITY_SETTINGS удалены,
 * так как соответствующий функционал не реализован в бэкенде
 */

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
