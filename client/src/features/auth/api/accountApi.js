import axiosClient from "../../../shared/api/axiosClient";

export const accountApi = {
  // Смена email
  changeEmail: (data) => axiosClient.put("/api/auth/change-email", data),

  // Смена пароля
  changePassword: (data) => axiosClient.put("/api/auth/change-password", data),

  // Проверка сложности пароля (опционально, можно на клиенте)
  checkPasswordStrength: (password) => 
    axiosClient.get(`/api/auth/check-password-strength?password=${encodeURIComponent(password)}`),

  // Удаление аккаунта
  deleteAccount: (data) => axiosClient.post("/api/profile/delete-account", data),
};
