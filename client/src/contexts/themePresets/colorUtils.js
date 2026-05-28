/**
 * Утилиты для работы с цветами
 * Конвертация, осветление, затемнение, смешивание цветов
 */

// Конвертация HEX в RGB
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 100, g: 100, b: 100 };
}

// Конвертация RGB в HEX
export function rgbToHex(r, g, b) {
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

// Осветление цвета
export function lightenColor(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  );
}

// Затемнение цвета
export function darkenColor(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

// Десатурация цвета
export function desaturateColor(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  return rgbToHex(
    r + (gray - r) * amount,
    g + (gray - g) * amount,
    b + (gray - b) * amount,
  );
}

// Смешивание цвета с оттенком
export function getTintedColor(hex, tintHex, amount) {
  const { r: r1, g: g1, b: b1 } = hexToRgb(hex);
  const { r: r2, g: g2, b: b2 } = hexToRgb(tintHex);
  return rgbToHex(
    Math.round(r1 * (1 - amount) + r2 * amount),
    Math.round(g1 * (1 - amount) + g2 * amount),
    Math.round(b1 * (1 - amount) + b2 * amount),
  );
}
