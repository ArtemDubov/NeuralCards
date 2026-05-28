import axiosClient from "../../../shared/api/axiosClient";
import { API_ENDPOINTS } from "../../../shared/api/apiConfig";

export const guestApi = {
  getSets: () => axiosClient.get(API_ENDPOINTS.GUEST.SETS),
  getSet: (id) => axiosClient.get(API_ENDPOINTS.GUEST.SET_DETAIL(id)),
  getSetCards: (id) => axiosClient.get(API_ENDPOINTS.GUEST.SET_DETAIL(id)),
  createSession: (data) =>
    axiosClient.post(API_ENDPOINTS.GUEST.CREATE_SESSION, data),
  completeSession: (id, score) =>
    axiosClient.post(API_ENDPOINTS.GUEST.COMPLETE_SESSION(id), null, {
      params: { score },
    }),
};
