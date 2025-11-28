// hooks/useAuth.js
import { useState, useCallback, useEffect } from "react";
import apiClient from "../api-client";

export const useAuth = () => {
  const [state, setState] = useState({
    isLoggedIn: false,
    user: null,
    loading: false,
    error: null,
  });

  // Проверка аутентификации при загрузке
  useEffect(() => {
    console.log("🟡 [useAuth] Проверяем аутентификацию при загрузке");
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    console.log(
      "🔑 [useAuth] Токен в localStorage:",
      token ? "присутствует" : "отсутствует"
    );
    console.log(
      "👤 [useAuth] Данные пользователя:",
      userData ? "присутствуют" : "отсутствуют"
    );

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        console.log("✅ [useAuth] Пользователь авторизован:", user.email);
        setState((prev) => ({ ...prev, isLoggedIn: true, user }));
      } catch (error) {
        console.error(
          "❌ [useAuth] Ошибка парсинга данных пользователя:",
          error
        );
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } else {
      console.log("🔴 [useAuth] Пользователь не авторизован");
    }
  }, []);

  const login = useCallback(async (email, password) => {
    console.log("🟡 [useAuth] Начинаем процесс входа...");
    console.log("📧 [useAuth] Email:", email);

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      console.log("🟡 [useAuth] Отправляем запрос на /api/login");
      const response = await apiClient.post("/api/login", { email, password });
      const token = response.data.token;

      console.log("✅ [useAuth] Успешный вход, получен токен");
      localStorage.setItem("token", token);

      console.log("🟡 [useAuth] Загружаем профиль пользователя...");
      const profileResponse = await apiClient.get("/api/profile");
      const userData = profileResponse.data;

      console.log("✅ [useAuth] Профиль загружен:", userData);
      localStorage.setItem("user", JSON.stringify(userData));

      setState({
        isLoggedIn: true,
        user: userData,
        loading: false,
        error: null,
      });

      console.log("✅ [useAuth] Вход завершен успешно");
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      console.error("❌ [useAuth] Ошибка входа:", errorMessage);
      console.error("❌ [useAuth] Детали ошибки:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(
    async (name, email, password) => {
      console.log("🟡 [useAuth] Начинаем процесс регистрации...");
      console.log("📝 [useAuth] Данные регистрации:", {
        name,
        email,
        password: "***",
      });

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        console.log("🟡 [useAuth] Отправляем запрос на /api/register");
        const response = await apiClient.post("/api/register", {
          name,
          email,
          password,
        });

        console.log("✅ [useAuth] Регистрация успешна, ответ:", response.data);

        // Автоматический вход после регистрации
        console.log("🟡 [useAuth] Выполняем автоматический вход...");
        const result = await login(email, password);

        if (result.success) {
          console.log(
            "✅ [useAuth] Автоматический вход после регистрации успешен"
          );
        } else {
          console.error(
            "❌ [useAuth] Ошибка автоматического входа после регистрации:",
            result.error
          );
        }

        return result;
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        console.error("❌ [useAuth] Ошибка регистрации:", errorMessage);
        console.error("❌ [useAuth] Детали ошибки:", {
          status: error.response?.status,
          data: error.response?.data,
          config: error.config,
        });

        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    console.log("🟡 [useAuth] Выполняем выход...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setState({ isLoggedIn: false, user: null, loading: false, error: null });
    console.log("✅ [useAuth] Выход выполнен");
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
  };
};
