import axiosClient from "../../../shared/api/axiosClient";

export const profileApi = {
  getProfile: () => axiosClient.get("/api/profile"),

  updateProfile: (data) => axiosClient.put("/api/profile", data),

  getStats: () => axiosClient.get("/api/profile/stats"),

  getProgress: (days = 7) =>
    axiosClient.get(`/api/profile/progress?days=${days}`),

  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post("/api/profile/upload-avatar", formData, {
      headers: {
        "Content-Type": undefined, // Позволяем браузеру установить правильный Content-Type с boundary
      },
    });
  },

  removeAvatarPhoto: () => axiosClient.delete("/api/profile/avatar"),

  deleteAccount: (password) => 
    axiosClient.post("/api/profile/delete-account", { password }),
};
