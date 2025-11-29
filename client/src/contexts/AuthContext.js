// contexts/AuthContext.js
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import apiClient from "../api-client";

// 🎯 Создаем контекст
const AuthContext = createContext();

// 🎯 Начальное состояние (совместимо с старым useAuth)
const initialState = {
  isLoggedIn: false,
  user: null,
  loading: false,
  error: null,
};

// 🎯 Редуктор для управления состоянием
const authReducer = (state, action) => {
  console.log(
    `🔄 [AuthReducer] Action: ${action.type}`,
    action.payload ? `Payload: ${action.payload.email || action.payload}` : ""
  );

  switch (action.type) {
    case "AUTH_START":
      return { ...state, loading: true, error: null };

    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      return {
        isLoggedIn: true,
        user: action.payload,
        loading: false,
        error: null,
      };

    case "AUTH_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case "LOGOUT":
      return {
        isLoggedIn: false,
        user: null,
        loading: false,
        error: null,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    default:
      console.warn(`⚠️ [AuthReducer] Unknown action type: ${action.type}`);
      return state;
  }
};

// 🎯 Провайдер контекста
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 🎯 Проверка аутентификации при загрузке (совместимо с старым useAuth)
  useEffect(() => {
    const checkAuth = async () => {
      console.log("🟡 [AuthProvider] Проверяем аутентификацию при загрузке");
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      console.log(
        "🔑 [AuthProvider] Токен в localStorage:",
        token ? "присутствует" : "отсутствует"
      );
      console.log(
        "👤 [AuthProvider] Данные пользователя:",
        userData ? "присутствуют" : "отсутствуют"
      );

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          console.log(
            "✅ [AuthProvider] Пользователь авторизован:",
            user.email
          );

          // Проверяем валидность токена
          const profileResponse = await apiClient.get("/api/profile");
          const freshUserData = profileResponse.data;

          dispatch({ type: "LOGIN_SUCCESS", payload: freshUserData });
        } catch (error) {
          console.error("❌ [AuthProvider] Ошибка проверки токена:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } else {
        console.log("🔴 [AuthProvider] Пользователь не авторизован");
      }
    };

    checkAuth();
  }, []);

  // 🎯 Логин (совместимо с старым useAuth)
  const login = useCallback(async (email, password) => {
    console.log("🟡 [AuthContext] Начинаем процесс входа...");
    console.log("📧 [AuthContext] Email:", email);

    dispatch({ type: "AUTH_START" });

    try {
      console.log("🟡 [AuthContext] Отправляем запрос на /api/login");
      const response = await apiClient.post("/api/login", { email, password });
      const token = response.data.token;

      console.log("✅ [AuthContext] Успешный вход, получен токен");
      localStorage.setItem("token", token);

      console.log("🟡 [AuthContext] Загружаем профиль пользователя...");
      const profileResponse = await apiClient.get("/api/profile");
      const userData = profileResponse.data;

      console.log("✅ [AuthContext] Профиль загружен:", userData);
      localStorage.setItem("user", JSON.stringify(userData));

      dispatch({ type: "LOGIN_SUCCESS", payload: userData });

      console.log("✅ [AuthContext] Вход завершен успешно");
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      console.error("❌ [AuthContext] Ошибка входа:", errorMessage);
      console.error("❌ [AuthContext] Детали ошибки:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  // 🎯 Регистрация (ИСПРАВЛЕННАЯ - без вложенного вызова login)
  const register = useCallback(async (name, email, password) => {
    console.log("🟡 [AuthContext] Начинаем процесс регистрации...");
    console.log("📝 [AuthContext] Данные регистрации:", {
      name,
      email,
      password: "***",
    });

    dispatch({ type: "AUTH_START" });

    try {
      console.log("🟡 [AuthContext] Отправляем запрос на /api/register");
      const response = await apiClient.post("/api/register", {
        name,
        email,
        password,
      });

      console.log(
        "✅ [AuthContext] Регистрация успешна, ответ:",
        response.data
      );

      // 🔥 ИСПРАВЛЕНИЕ: Автоматический вход отдельно, без вложенности
      console.log("🟡 [AuthContext] Выполняем автоматический вход...");
      const loginResponse = await apiClient.post("/api/login", {
        email,
        password,
      });
      const token = loginResponse.data.token;

      console.log("✅ [AuthContext] Автоматический вход успешен");
      localStorage.setItem("token", token);

      console.log("🟡 [AuthContext] Загружаем профиль...");
      const profileResponse = await apiClient.get("/api/profile");
      const userData = profileResponse.data;

      console.log("✅ [AuthContext] Профиль загружен:", userData);
      localStorage.setItem("user", JSON.stringify(userData));

      dispatch({ type: "REGISTER_SUCCESS", payload: userData });

      console.log("✅ [AuthContext] Регистрация и вход завершены");
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      console.error("❌ [AuthContext] Ошибка регистрации:", errorMessage);
      console.error("❌ [AuthContext] Детали ошибки:", {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });

      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []); // 🔥 Убрана зависимость от login

  // 🎯 Логаут (совместимо с старым useAuth)
  const logout = useCallback(() => {
    console.log("🟡 [AuthContext] Выполняем выход...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
    console.log("✅ [AuthContext] Выход выполнен");
  }, []);

  // 🎯 Очистка ошибок (новая функция)
  const clearError = useCallback(() => {
    console.log("🟡 [AuthContext] Очищаем ошибки");
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  // 🎯 Значение контекста (ПОЛНОСТЬЮ СОВМЕСТИМО с старым useAuth)
  const value = {
    // Состояние (совместимо)
    isLoggedIn: state.isLoggedIn,
    user: state.user,
    loading: state.loading,
    error: state.error,

    // Методы (совместимо)
    login,
    register,
    logout,

    // Дополнительные методы для будущего
    clearError,
  };

  console.log("🔄 [AuthProvider] Рендер:", {
    isLoggedIn: state.isLoggedIn,
    user: state.user?.email,
    loading: state.loading,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 🎯 Хук для использования (ПОЛНОСТЬЮ СОВМЕСТИМ с старым useAuth)
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;
