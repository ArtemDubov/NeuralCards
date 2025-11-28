import axios from "axios";

const debugLog = (component, action, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${component}] ${action}`, data || "");
};

// ИЗМЕНИТЬ: убрать /api из baseURL
const API_URL = "http://localhost:5001"; // ← ТАК ПРАВИЛЬНО

// Создаем экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Интерцептор запросов
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    debugLog("API Client", "Request", {
      method: config.method,
      url: config.url,
      headers: config.headers,
      data: config.data,
      baseURL: config.baseURL,
      fullURL: config.baseURL + config.url,
    });

    return config;
  },
  (error) => {
    debugLog("API Client", "Request Error", {
      error: error.message,
      stack: error.stack,
    });
    return Promise.reject(error);
  }
);

// Интерцептор ответов
apiClient.interceptors.response.use(
  (response) => {
    debugLog("API Client", "Response Success", {
      status: response.status,
      url: response.config.url,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    debugLog("API Client", "Response Error", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      response: error.response?.data,
      requestHeaders: error.config?.headers,
      requestData: error.config?.data,
    });

    if (error.response?.status === 401) {
      debugLog("API Client", "Authentication error - redirecting to login");
      localStorage.removeItem("token");
      window.location.reload();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
