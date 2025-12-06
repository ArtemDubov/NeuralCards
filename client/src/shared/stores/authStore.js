import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "../../api-client";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      register: async (name, email, password) => {
        set({ loading: true, error: null });

        try {
          const response = await apiClient.post("/api/register", {
            name,
            email,
            password,
          });

          const {
            token,
            userId,
            name: userName,
            email: userEmail,
          } = response.data;

          if (!token) {
            throw new Error("Токен не получен от сервера");
          }

          localStorage.setItem("token", token);

          const user = {
            id: userId,
            name: userName || name,
            email: userEmail || email,
            isPremium: false,
            premiumUntil: null,
          };

          set({ user, token, loading: false, error: null });

          return { success: true, user, token };
        } catch (error) {
          const errorMessage =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Ошибка регистрации";
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      login: async (email, password) => {
        set({ loading: true, error: null });

        try {
          const response = await apiClient.post("/api/login", {
            email,
            password,
          });

          const {
            token,
            userId,
            name,
            isPremium = false,
            premiumUntil = null,
          } = response.data;

          if (!token) {
            throw new Error("Токен не получен от сервера");
          }

          localStorage.setItem("token", token);

          const user = {
            id: userId,
            name: name,
            email: email,
            isPremium: isPremium,
            premiumUntil: premiumUntil,
          };

          set({ user, token, loading: false, error: null });

          return { success: true, user, token };
        } catch (error) {
          const errorMessage =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Ошибка входа";
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null, error: null });
        window.location.reload();
        return { success: true };
      },

      fetchProfile: async () => {
        set({ loading: true });

        try {
          const response = await apiClient.get("/api/profile");
          set({
            user: response.data,
            loading: false,
            error: null,
          });
          return { success: true, user: response.data };
        } catch (error) {
          console.error("Ошибка загрузки профиля:", error);
          set({ loading: false });
          return { success: false, error: "Не удалось загрузить профиль" };
        }
      },

      // Премиум функции
      togglePremium: async (action) => {
        set({ loading: true, error: null });

        try {
          const response = await apiClient.patch("/api/profile/premium", {
            action,
          });
          const updatedUser = response.data.user;

          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  ...updatedUser,
                }
              : null,
            loading: false,
            error: null,
          }));

          return {
            success: true,
            user: updatedUser,
            message: response.data.message,
          };
        } catch (error) {
          console.error("Ошибка изменения премиум статуса:", error);
          const errorMessage =
            error.response?.data?.error ||
            error.message ||
            "Ошибка изменения премиум статуса";
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      isLoggedIn: () => {
        const { token } = get();
        return !!token;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
