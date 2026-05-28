/**
 * Утилита для создания обрезанного изображения
 * @param {HTMLCanvasElement} canvas - Канвас с изображением
 * @param {Object} area - Область обрезки {x, y, width, height}
 * @returns {Promise<string>} - Base64 строка с изображением
 */
export const createImage = (url) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
};

export async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Устанавливаем размер канваса равным области обрезки
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Рисуем обрезанное изображение
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Конвертируем в blob и затем в base64
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        resolve(reader.result);
      };
    }, 'image/jpeg', 0.95);
  });
}
