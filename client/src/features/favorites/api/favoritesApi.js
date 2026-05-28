import axiosClient from "../../../shared/api/axiosClient";

const API_BASE = "/api/favorites";

export const favoritesApi = {
  /**
   * Добавить в избранное
   * Если уже в избранном (409) — считаем успехом
   */
  add: async (itemType, itemId) => {
    try {
      const response = await axiosClient.post(API_BASE, {
        item_type: itemType,
        item_id: itemId,
      });
      return response.data;
    } catch (err) {
      // 409 Conflict — уже в избранном, это не ошибка
      if (err.response?.status === 409) {
        return { message: "already_favorite" };
      }
      throw err;
    }
  },

  /**
   * Удалить из избранного
   */
  remove: async (itemType, itemId) => {
    await axiosClient.delete(`${API_BASE}/${itemType}/${itemId}`);
  },

  /**
   * Проверить, есть ли в избранном
   */
  check: async (itemType, itemId) => {
    const response = await axiosClient.get(
      `${API_BASE}/check/${itemType}/${itemId}`,
    );
    return response.data;
  },

  /**
   * Получить ID всех избранных элементов типа
   */
  getList: async (itemType) => {
    const response = await axiosClient.get(`${API_BASE}/list/${itemType}`);
    return response.data; // массив ID
  },

  /**
   * Переключить статус избранного (добавить/удалить)
   */
  toggle: async (itemType, itemId, isFavorite) => {
    if (isFavorite) {
      await favoritesApi.remove(itemType, itemId);
      return false;
    } else {
      await favoritesApi.add(itemType, itemId);
      return true;
    }
  },
};

export default favoritesApi;
