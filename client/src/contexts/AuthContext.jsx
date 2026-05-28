import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { authApi } from "../features/auth/api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("isAuthenticated");
      return;
    }

    try {
      const response = await authApi.getMe();
      setUser(response.data);
      setIsAuthenticated(true);

      sessionStorage.setItem("user", JSON.stringify(response.data));
      sessionStorage.setItem("isAuthenticated", "true");
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();

    const handler = () => {
      setUser(null);
      setIsAuthenticated(false);
    };
    window.addEventListener("auth:expired", handler);
    return () => window.removeEventListener("auth:expired", handler);
  }, [loadUser]);

  const login = useCallback(
    async (email, password) => {
      try {
        const response = await authApi.login({ email, password });
        const { access_token, refresh_token } = response.data;

        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);

        await loadUser();
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    [loadUser],
  );

  const register = useCallback(
    async (email, password, name) => {
      try {
        const response = await authApi.register({ email, password, name });

        const loginResponse = await authApi.login({ email, password });
        const { access_token, refresh_token } = loginResponse.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);

        await loadUser();
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    [loadUser],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Игнорируем ошибки выхода
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("isAuthenticated");
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      loadUser, // Экспортируем loadUser для обновления данных пользователя
    }),
    [user, isAuthenticated, isLoading, login, register, logout, loadUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
