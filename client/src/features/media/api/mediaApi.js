import axiosClient from "../../../shared/api/axiosClient";

const API_BASE = "/api/media";

export const mediaApi = {
  /**
   * Загрузка изображения
   * @param {File} file - Файл изображения
   * @param {string} side - 'front' или 'back'
   * @returns {Promise} - { file_url, file_type, side }
   */
  uploadImage: async (file, side) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("side", side);

    const response = await axiosClient.post(
      `${API_BASE}/upload/image`,
      formData,
    );
    return response.data;
  },

  /**
   * Загрузка аудио
   * @param {File} file - Аудиофайл
   * @param {string} side - 'front' или 'back'
   */
  uploadAudio: async (file, side) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("side", side);

    const response = await axiosClient.post(
      `${API_BASE}/upload/audio`,
      formData,
    );
    return response.data;
  },

  /**
   * Загрузка видео
   * @param {File} file - Видеофайл
   * @param {string} side - 'front' или 'back'
   */
  uploadVideo: async (file, side) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("side", side);

    const response = await axiosClient.post(
      `${API_BASE}/upload/video`,
      formData,
    );
    return response.data;
  },

  /**
   * Удаление медиафайла
   * @param {string} filePath - Путь к файлу
   */
  deleteFile: async (filePath) => {
    await axiosClient.delete(
      `${API_BASE}/files/${encodeURIComponent(filePath)}`,
    );
  },

  /**
   * Получить URL для медиафайла
   * @param {string} filePath - Путь к файлу
   * @returns {string} - Полный URL
   */
  getMediaUrl: (filePath) => {
    if (!filePath) return null;
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8081";
    // Полный URL, т.к. фронтенд и бэкенд на разных портах
    return `${API_URL}/media/${filePath}`;
  },
};
