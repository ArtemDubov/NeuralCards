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
            isPremium = false,
            premiumUntil = null,
            avatarEmoji = null,
            avatarUrl = null,
            avatarColor = null,
          } = response.data;

          if (!token) {
            throw new Error("Токен не получен от сервера");
          }

          localStorage.setItem("token", token);

          const user = {
            id: userId,
            name: userName || name,
            email: userEmail || email,
            isPremium: isPremium,
            premiumUntil: premiumUntil,
            avatarEmoji: avatarEmoji,
            avatarUrl: avatarUrl,
            avatarColor: avatarColor,
            createdAt: new Date().toISOString(),
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

          return {
            success: false,
            error: errorMessage,
            details: error.response?.data?.details,
          };
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
            avatarEmoji = null,
            avatarUrl = null,
            avatarColor = null,
            createdAt = null,
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
            avatarEmoji: avatarEmoji,
            avatarUrl: avatarUrl,
            avatarColor: avatarColor,
            createdAt: createdAt,
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

          return {
            success: false,
            error: errorMessage,
            details: error.response?.data?.details,
          };
        }
      },

      logout: () => {
        localStorage.removeItem("token");

        set({
          user: null,
          token: null,
          error: null,
          loading: false,
        });

        setTimeout(() => {
          window.location.reload();
        }, 100);

        return { success: true };
      },

      fetchProfile: async () => {
        set({ loading: true });

        try {
          const response = await apiClient.get("/api/profile");
          const userData = response.data;

          set({
            user: userData,
            loading: false,
            error: null,
          });

          return {
            success: true,
            user: userData,
            message: "Профиль загружен",
          };
        } catch (error) {
          if (error.response?.status === 401) {
            get().logout();
          }

          set({ loading: false });

          return {
            success: false,
            error: "Не удалось загрузить профиль",
            details: error.message,
          };
        }
      },

      updateUserEmail: async (newEmail, password) => {
        set({ loading: true, error: null });

        try {
          const response = await apiClient.put("/api/profile/email", {
            newEmail,
            password,
          });

          const updatedUser = response.data.user;

          if (!updatedUser) {
            throw new Error("Данные пользователя не получены от сервера");
          }

          set((state) => ({
            user: state.user ? { ...state.user, ...updatedUser } : null,
            loading: false,
            error: null,
          }));

          return {
            success: true,
            user: updatedUser,
            message: response.data.message || "Email успешно обновлен",
          };
        } catch (error) {
          const errorMessage =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Ошибка обновления email";

          set({ loading: false, error: errorMessage });

          return {
            success: false,
            error: errorMessage,
            details: error.response?.data?.details,
          };
        }
      },

      updateUserPassword: async (currentPassword, newPassword) => {
        set({ loading: true, error: null });

        try {
          const response = await apiClient.put("/api/profile/password", {
            currentPassword,
            newPassword,
          });

          set({ loading: false, error: null });

          return {
            success: true,
            message: response.data.message || "Пароль успешно обновлен",
          };
        } catch (error) {
          const errorMessage =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Ошибка обновления пароля";

          set({ loading: false, error: errorMessage });

          return {
            success: false,
            error: errorMessage,
            details: error.response?.data?.details,
          };
        }
      },

      updateUserName: async (newName, password) => {
        set({ loading: true, error: null });

        try {
          const response = await apiClient.put("/api/profile/name", {
            newName,
            password,
          });

          const updatedUser = response.data.user;

          if (!updatedUser) {
            throw new Error("Данные пользователя не получены от сервера");
          }

          set((state) => ({
            user: state.user ? { ...state.user, ...updatedUser } : null,
            loading: false,
            error: null,
          }));

          return {
            success: true,
            user: updatedUser,
            message: response.data.message || "Имя успешно обновлено",
          };
        } catch (error) {
          const errorMessage =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Ошибка обновления имени";

          set({ loading: false, error: errorMessage });

          return {
            success: false,
            error: errorMessage,
            details: error.response?.data?.details,
          };
        }
      },

      updateAvatar: async ({ emoji, color, imageUrl }) => {
        set({ loading: true, error: null });

        try {
          const requestData = {};
          if (emoji !== undefined) requestData.emoji = emoji;
          if (color !== undefined) requestData.color = color;
          if (imageUrl !== undefined) requestData.imageUrl = imageUrl;

          const response = await apiClient.patch(
            "/api/profile/avatar",
            requestData
          );

          const updatedUser = response.data.user;

          if (!updatedUser) {
            throw new Error("Данные пользователя не получены от сервера");
          }

          set((state) => {
            return {
              user: state.user
                ? {
                    ...state.user,
                    ...updatedUser,
                    avatarColor:
                      updatedUser.avatarColor !== undefined
                        ? updatedUser.avatarColor
                        : color !== undefined
                        ? color
                        : state.user.avatarColor,
                  }
                : updatedUser,
              loading: false,
              error: null,
            };
          });

          return {
            success: true,
            user: updatedUser,
            message: response.data.message,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          const errorMessage =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Ошибка обновления аватара";

          set({
            loading: false,
            error: errorMessage,
          });

          return {
            success: false,
            error: errorMessage,
            details: error.response?.data?.details,
            status: error.response?.status,
          };
        }
      },

      uploadAvatar: async (formData) => {
        set({ loading: true, error: null });

        try {
          const response = await apiClient.post(
            "/api/profile/upload-avatar",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          const updatedUser = response.data.user;

          if (!updatedUser) {
            throw new Error("Данные пользователя не получены от сервера");
          }

          set((state) => {
            return {
              user: state.user
                ? {
                    ...state.user,
                    ...updatedUser,
                    avatarColor: null,
                  }
                : {
                    ...updatedUser,
                    avatarColor: null,
                  },
              loading: false,
              error: null,
            };
          });

          return {
            success: true,
            user: updatedUser,
            message: response.data.message,
            avatarUrl: response.data.avatarUrl,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          const errorMessage =
            error.response?.data?.error ||
            error.message ||
            "Ошибка загрузки файла";

          set({
            loading: false,
            error: errorMessage,
          });

          return {
            success: false,
            error: errorMessage,
            details: error.response?.data?.details,
            status: error.response?.status,
          };
        }
      },

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
                  avatarColor: state.user.avatarColor,
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
          const errorMessage =
            error.response?.data?.error ||
            error.message ||
            "Ошибка изменения премиум статуса";

          set({
            loading: false,
            error: errorMessage,
          });

          return {
            success: false,
            error: errorMessage,
            details: error.response?.data?.details,
          };
        }
      },

      setLoading: (loading) => {
        set({ loading });
      },

      setError: (error) => {
        set({ error });
      },

      isLoggedIn: () => {
        const { token } = get();
        return !!token;
      },

      getCurrentUser: () => {
        const { user } = get();
        return user;
      },

      isOwner: (userId) => {
        const { user } = get();
        return user && user.id === userId;
      },

      updateUserData: (updates) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...updates,
              }
            : null,
        }));

        return { success: true };
      },

      checkAuth: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          return { isAuthenticated: false };
        }

        try {
          const response = await apiClient.get("/api/profile");
          const userData = response.data;

          set({
            user: userData,
            token: token,
            loading: false,
            error: null,
          });

          return { isAuthenticated: true, user: userData };
        } catch (error) {
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            set({ user: null, token: null });
          }

          return { isAuthenticated: false, error: error.message };
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setAvatarColor: (color) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                avatarColor: color,
                avatarUrl: null,
              }
            : null,
        }));
      },

      setAvatarEmoji: (emoji) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                avatarEmoji: emoji,
              }
            : null,
        }));
      },
    }),
    {
      name: "auth-storage",
      version: 1,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      migrate: (persistedState, version) => {
        if (version === 0) {
          return {
            ...persistedState,
            user: persistedState.user
              ? {
                  ...persistedState.user,
                  avatarColor: persistedState.user.avatarColor || null,
                }
              : null,
          };
        }
        return persistedState;
      },
    }
  )
);

export const authStore = useAuthStore;
