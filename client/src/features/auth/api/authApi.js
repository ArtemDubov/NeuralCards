import axiosClient from "../../../shared/api/axiosClient";
import { API_ENDPOINTS } from "../../../shared/api/apiConfig";

export const authApi = {
  register: (data) => axiosClient.post(API_ENDPOINTS.AUTH.REGISTER, data),
  login: (data) => axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, data),
  logout: () => axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT),
  refreshToken: (refreshToken) =>
    axiosClient.post(API_ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken,
    }),
  getMe: () => axiosClient.get(API_ENDPOINTS.AUTH.ME),
};
