export const API_ENDPOINTS = {
  // Аутентификация
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    REFRESH: "/api/auth/refresh",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },

  // Наборы карточек
  CARD_SETS: {
    LIST: "/api/card-sets",
    OFFICIAL_LIST: "/api/card-sets/official/list",
    DETAIL: (id) => `/api/card-sets/${id}`,
    CARDS: (setId) => `/api/card-sets/${setId}/cards`,
    CREATE_CARD: (setId) => `/api/card-sets/${setId}/cards`,
    BATCH_CARDS: (setId) => `/api/card-sets/${setId}/cards/batch`,
    UPDATE_CARD: (cardId) => `/api/card-sets/cards/${cardId}`,
    DELETE_CARD: (cardId) => `/api/card-sets/cards/${cardId}`,
  },

  // Тренировки
  TRAINING: {
    CREATE_SESSION: "/api/training/sessions",
    SESSION: (id) => `/api/training/sessions/${id}`,
    ANSWER: (id) => `/api/training/sessions/${id}/answer`,
    COMPLETE: (id) => `/api/training/sessions/${id}/complete`,
  },

  // Гость
  GUEST: {
    SETS: "/api/guest/sets",
    SET_DETAIL: (id) => `/api/guest/sets/${id}`,
    CREATE_SESSION: "/api/guest/sessions",
    COMPLETE_SESSION: (id) => `/api/guest/sessions/${id}/complete`,
  },

  // Марафон
  MARATHON_CREATE: "/api/training/marathon/sessions",
  MARATHON_ANSWER: (id) => `/api/training/marathon/${id}/answer`,
  MARATHON_COMPLETE: (id) => `/api/training/marathon/${id}/complete`,

  // Диктант
  DICTATION_CREATE: "/api/training/dictation/sessions",
  DICTATION_ANSWER: (id) => `/api/training/dictation/${id}/answer`,
  DICTATION_COMPLETE: (id) => `/api/training/dictation/${id}/complete`,

  // Соответствие (Matching)
  MATCHING_CREATE: "/api/training/matching/sessions",
  MATCHING_ANSWER: (id) => `/api/training/matching/${id}/answer`,

  // Статистика
  STATS: {
    LEADERBOARD: "/api/stats/leaderboard",
    WEEKLY_REPORT: "/api/stats/weekly-report",
    HOURLY_HEATMAP: "/api/stats/hourly-heatmap",
    FORECAST: "/api/stats/forecast",
    EXPORT: "/api/stats/export",
  },

  // Чат
  CHAT: {
    SEND: "/api/chat",
    REACTION: "/api/chat/reaction",
    PIN: (id) => `/api/chat/pin/${id}`,
    PINNED: "/api/chat/pinned",
    CONVERSATIONS: "/api/chat/conversations",
    MESSAGES: (partnerId) => `/api/chat/${partnerId}`,
    MARK_READ: (partnerId) => `/api/chat/${partnerId}/read`,
    UNREAD_COUNT: "/api/chat/unread/count",
  },
};
