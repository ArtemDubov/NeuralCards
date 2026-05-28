import axios from "axios";

// Базовый URL API
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8081";

// Создаем axios инстанс
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===== Race condition guard для token refresh =====
let refreshPromise = null; // Если уже идёт refresh, хранит промис
const waiters = []; // Очередь запросов, ожидающих refresh

/**
 * Обновить токен (с защитой от race condition).
 * Если refresh уже запущен — возвращает тот же промис.
 */
async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  refreshPromise = (async () => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/refresh`, {
        refresh_token: refreshToken,
      });
      const { access_token, refresh_token: new_refresh_token } = response.data;
      localStorage.setItem("access_token", access_token);
      if (new_refresh_token) {
        localStorage.setItem("refresh_token", new_refresh_token);
      }
      return access_token;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Интерцептор для логирования и добавления токена
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Если отправляем FormData, удаляем Content-Type чтобы axios установил его автоматически с boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Интерцептор для обработки ответов
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Не пытаемся обновлять токен для запросов аутентификации
    const authUrls = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/refresh",
    ];
    const isAuthUrl = authUrls.some((url) =>
      originalRequest.url?.includes(url),
    );

    // Если ошибка 401 и мы еще не пробовали обновить токен
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthUrl
    ) {
      originalRequest._retry = true;

      try {
        // Ждём общий refresh (race condition guard)
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Не удалось обновить токен - очищаем
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("isAuthenticated");
        window.dispatchEvent(new CustomEvent("auth:expired"));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
