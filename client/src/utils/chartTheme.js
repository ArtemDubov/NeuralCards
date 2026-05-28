/**
 * Helper функции для адаптации цветов графиков под тёмные темы.
 * Решает проблемы видимости сетки, осей и heatmap в dark mode.
 */

/**
 * Получает цвет текста меток на осях графиков.
 */
export function getAxisTickColor(isDark) {
  return isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)";
}

/**
 * Получает цвет сетки графика с учётом темы.
 * В тёмной теме увеличивает opacity для лучшей видимости.
 */
export function getGridColor(isDark) {
  return isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.06)";
}

/**
 * Получает цвет осей графика с учётом темы.
 */
export function getAxisColor(isDark) {
  return isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.12)";
}

/**
 * Получает цвет tickLine (меток на осях).
 */
export function getTickLineColor(isDark) {
  return isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)";
}

/**
 * Получает цвет outline для ячеек календаря активности.
 * Использует theme.border если доступен, иначе адаптивный fallback.
 */
export function getCellOutline(isDark, themeBorder) {
  if (themeBorder) {
    return `1px solid ${themeBorder}`;
  }
  return isDark 
    ? "1px solid rgba(255,255,255,0.2)" 
    : "1px solid rgba(0,0,0,0.08)";
}

/**
 * Корректирует RGB цвет heatmap для тёмной темы.
 * Увеличивает lightness на 12% и уменьшает saturation на 8% для лучшей видимости.
 */
export function adjustHeatmapColorForTheme(rgbString, isDark) {
  if (!isDark || !rgbString) return rgbString;
  
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return rgbString;
  
  let r = parseInt(match[1]);
  let g = parseInt(match[2]);
  let b = parseInt(match[3]);
  
  // Увеличиваем яркость на 12% для лучшей видимости на тёмном фоне
  const lightnessFactor = 1.12;
  r = Math.min(255, Math.round(r * lightnessFactor));
  g = Math.min(255, Math.round(g * lightnessFactor));
  b = Math.min(255, Math.round(b * lightnessFactor));
  
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Получает безопасный цвет текста с fallback, учитывающим тему.
 * Избегает использования хардкода #666/#999 которые невидимы на тёмном фоне.
 */
export function getSafeTextColor(currentTheme, fallbackLight = "#666", fallbackDark = "#b0b0b0") {
  if (currentTheme?.text) {
    return currentTheme.text;
  }
  
  // Если тема не загрузилась, используем fallback с учётом предполагаемой темы
  const isDark = currentTheme?.mode === "dark";
  return isDark ? fallbackDark : fallbackLight;
}

/**
 * Получает безопасный вторичный цвет текста.
 */
export function getSafeTextSecondary(currentTheme, fallbackLight = "#999", fallbackDark = "#a0a0a0") {
  if (currentTheme?.textSecondary) {
    return currentTheme.textSecondary;
  }
  
  const isDark = currentTheme?.mode === "dark";
  return isDark ? fallbackDark : fallbackLight;
}

/**
 * Получает безопасный приглушённый цвет текста.
 */
export function getSafeTextMuted(currentTheme, fallbackLight = "#bbb", fallbackDark = "#888") {
  if (currentTheme?.textMuted) {
    return currentTheme.textMuted;
  }
  
  const isDark = currentTheme?.mode === "dark";
  return isDark ? fallbackDark : fallbackLight;
}

/**
 * Генерирует цвет столбца BarChart с улучшенной видимостью в тёмной теме.
 * Для пустых значений использует более высокий opacity.
 */
export function getBarColor(baseColor, intensity, isDark) {
  if (intensity === 0) {
    // Увеличиваем opacity для пустых ячеек в тёмной теме
    return isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)";
  }

  if (!baseColor || typeof baseColor !== "string") {
    baseColor = "#667eea";
  }

  const hexStr = baseColor.replace("#", "");
  if (hexStr.length < 6) {
    return isDark ? "rgba(139,159,240,0.6)" : "rgba(102,126,234,0.6)";
  }

  const r = parseInt(hexStr.substring(0, 2), 16);
  const g = parseInt(hexStr.substring(2, 4), 16);
  const b = parseInt(hexStr.substring(4, 6), 16);

  if (isDark) {
    // Тёмная тема: увеличиваем базовую прозрачность и добавляем яркость
    const alpha = 0.4 + intensity * 0.6;
    
    // Увеличиваем яркость цвета на 15% для лучшей видимости
    const brightnessFactor = 1.15;
    const adjustedR = Math.min(255, Math.round(r * brightnessFactor));
    const adjustedG = Math.min(255, Math.round(g * brightnessFactor));
    const adjustedB = Math.min(255, Math.round(b * brightnessFactor));
    
    return `rgba(${adjustedR}, ${adjustedG}, ${adjustedB}, ${alpha})`;
  } else {
    // Светлая тема: стандартное поведение
    const alpha = 0.3 + intensity * 0.6;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

/**
 * Получает цвет фона контейнера heatmap с учётом темы.
 */
export function getHeatmapContainerBg(isDark, themeSurface) {
  if (themeSurface) {
    return themeSurface;
  }
  return isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
}

/**
 * Получает цвет границы ячейки heatmap.
 */
export function getHeatmapCellBorder(isDark) {
  return isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.1)";
}
