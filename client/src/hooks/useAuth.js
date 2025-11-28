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
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setState((prev) => ({ ...prev, isLoggedIn: true, user }));
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient.post("/api/login", { email, password });
      const token = response.data.token;
      localStorage.setItem("token", token);

      const profileResponse = await apiClient.get("/api/profile");
      const userData = profileResponse.data;

      localStorage.setItem("user", JSON.stringify(userData));
      setState({
        isLoggedIn: true,
        user: userData,
        loading: false,
        error: null,
      });

      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(
    async (name, email, password) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await apiClient.post("/api/register", { name, email, password });

        // Автоматический вход после регистрации
        const result = await login(email, password);
        return result;
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setState({ isLoggedIn: false, user: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
  };
};
