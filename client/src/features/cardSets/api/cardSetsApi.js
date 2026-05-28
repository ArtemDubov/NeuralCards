import axiosClient from "../../../shared/api/axiosClient";
import { API_ENDPOINTS } from "../../../shared/api/apiConfig";

export const cardSetsApi = {
  // Card Sets
  getCardSets: (includePublic = true) =>
    axiosClient.get(
      `${API_ENDPOINTS.CARD_SETS.LIST}?include_public=${includePublic}`,
    ),

  getOfficialSets: () => axiosClient.get(API_ENDPOINTS.CARD_SETS.OFFICIAL_LIST),

  getCardSet: (id) => axiosClient.get(API_ENDPOINTS.CARD_SETS.DETAIL(id)),

  createCardSet: (data) => axiosClient.post(API_ENDPOINTS.CARD_SETS.LIST, data),

  updateCardSet: (id, data) =>
    axiosClient.put(API_ENDPOINTS.CARD_SETS.DETAIL(id), data),

  deleteCardSet: (id) => axiosClient.delete(API_ENDPOINTS.CARD_SETS.DETAIL(id)),

  copyCardSet: (id, data = {}) =>
    axiosClient.post(`${API_ENDPOINTS.CARD_SETS.DETAIL(id)}/copy`, data),

  // Cards
  getCards: (setId) => axiosClient.get(API_ENDPOINTS.CARD_SETS.CARDS(setId)),

  createCard: (setId, data) => {
    // data может содержать: front, back, front_image, front_audio, front_video,
    // back_image, back_audio, back_video, auto_play_enabled, play_front, play_back
    return axiosClient.post(API_ENDPOINTS.CARD_SETS.CREATE_CARD(setId), data);
  },

  createCardsBatch: (setId, cards) =>
    axiosClient.post(API_ENDPOINTS.CARD_SETS.BATCH_CARDS(setId), cards),

  updateCard: (cardId, data) =>
    axiosClient.put(API_ENDPOINTS.CARD_SETS.UPDATE_CARD(cardId), data),

  deleteCard: (cardId) =>
    axiosClient.delete(API_ENDPOINTS.CARD_SETS.DELETE_CARD(cardId)),

  reorderCards: (setId, cardIds) =>
    axiosClient.post(`/api/card-sets/${setId}/cards/reorder`, {
      card_ids: cardIds,
    }),
};
