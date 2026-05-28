import axiosClient from "../../../shared/api/axiosClient";

export const publicProfileApi = {
  getPublicProfile: (userId) =>
    axiosClient.get(`/api/profile/public/${userId}`),
};
