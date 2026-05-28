import axiosClient from "../../../shared/api/axiosClient";
import { API_ENDPOINTS } from "../../../shared/api/apiConfig";

export const chatApi = {
  sendMessage: (receiverId, content, params = {}) =>
    axiosClient.post(
      API_ENDPOINTS.CHAT.SEND,
      { receiver_id: receiverId, content },
      { params },
    ),

  addReaction: (messageId, emoji) =>
    axiosClient.post(API_ENDPOINTS.CHAT.REACTION, null, {
      params: { message_id: messageId, emoji },
    }),

  pinMessage: (messageId, partnerId) =>
    axiosClient.post(API_ENDPOINTS.CHAT.PIN(messageId), null, {
      params: { partner_id: partnerId },
    }),

  getPinned: (partnerId) =>
    axiosClient.get(API_ENDPOINTS.CHAT.PINNED, {
      params: { partner_id: partnerId },
    }),

  getConversations: () => axiosClient.get(API_ENDPOINTS.CHAT.CONVERSATIONS),

  getMessages: (partnerId, limit = 100) =>
    axiosClient.get(API_ENDPOINTS.CHAT.MESSAGES(partnerId), {
      params: { limit },
    }),

  markAllRead: (partnerId) =>
    axiosClient.post(API_ENDPOINTS.CHAT.MARK_READ(partnerId)),

  getUnreadCount: () => axiosClient.get(API_ENDPOINTS.CHAT.UNREAD_COUNT),

  guestPractice: (cardSetId) =>
    axiosClient.post("/api/guest/practice", { card_set_id: cardSetId }),

  // Friends API functions (moved from features/friends)
  getFriends: () => axiosClient.get('/api/friends'),
  
  getFriendRequests: () => axiosClient.get('/api/friends/requests'),
  
  getSentRequests: () => axiosClient.get('/api/friends/requests/sent'),
  
  sendFriendRequest: (addresseeId) => 
    axiosClient.post('/api/friends/request', { addressee_id: addresseeId }),
  
  acceptFriendRequest: (friendshipId) => 
    axiosClient.post(`/api/friends/request/${friendshipId}/accept`),
  
  rejectFriendRequest: (friendshipId) => 
    axiosClient.post(`/api/friends/request/${friendshipId}/reject`),
  
  cancelFriendRequest: (friendshipId) => 
    axiosClient.post(`/api/friends/request/${friendshipId}/cancel`),
  
  removeFriend: (friendId) => 
    axiosClient.delete(`/api/friends/${friendId}`),
  
  checkFriendship: (userId) => 
    axiosClient.get(`/api/friends/check/${userId}`),
  
  searchUsers: (query, limit = 20) => 
    axiosClient.get('/api/friends/search', { params: { q: query, limit } }),
};
