const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

/**
 * Обрабатывает и обрезает изображение для аватара
 * @param {string} inputPath - Путь к исходному файлу
 * @param {string} outputPath - Путь для сохранения
 * @param {Object} cropData - Данные обрезки {x, y, width, height, scale}
 * @returns {Promise<string>} - Путь к обработанному файлу
 */
async function processAvatar(inputPath, outputPath, cropData = null) {
  try {
    let image = sharp(inputPath);

    // Получаем метаданные
    const metadata = await image.metadata();

    if (cropData) {
      // Обрезаем по данным из редактора
      const { x, y, width, height, scale } = cropData;

      // Рассчитываем фактические координаты (с учётом масштаба)
      const actualX = Math.max(0, Math.round(x / scale));
      const actualY = Math.max(0, Math.round(y / scale));
      const actualWidth = Math.min(
        Math.round(width / scale),
        metadata.width - actualX
      );
      const actualHeight = Math.min(
        Math.round(height / scale),
        metadata.height - actualY
      );

      // Обрезаем
      image = image.extract({
        left: actualX,
        top: actualY,
        width: actualWidth,
        height: actualHeight,
      });
    }

    // Делаем квадратным (обрезаем до минимальной стороны)
    image = image.resize({
      width: 400,
      height: 400,
      fit: "cover",
      position: "center",
    });

    // Конвертируем в webp для оптимизации
    const finalPath = outputPath.replace(/\.[^/.]+$/, "") + ".webp";

    await image.webp({ quality: 85 }).toFile(finalPath);

    // Удаляем исходный файл
    fs.unlinkSync(inputPath);

    return finalPath;
  } catch (error) {
    throw new Error(`Ошибка обработки изображения: ${error.message}`);
  }
}

/**
 * Создаёт цветной аватар с инициалом
 * @param {string} initial - Инициал пользователя
 * @param {string} color - Цвет фона
 * @param {string} outputPath - Путь для сохранения
 */
async function createColorAvatar(initial, color, outputPath) {
  try {
    const svg = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="${color}" />
        <text x="200" y="220" font-family="Arial, sans-serif" font-size="180" 
              fill="white" text-anchor="middle" dominant-baseline="middle"
              font-weight="bold">
          ${initial.toUpperCase()}
        </text>
      </svg>
    `;

    await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(outputPath);

    return outputPath;
  } catch (error) {
    throw new Error(`Ошибка создания цветного аватара: ${error.message}`);
  }
}

module.exports = {
  processAvatar,
  createColorAvatar,
};
