/**
 * Utility функция для нормализации данных пользователя перед передачей в AvatarDisplay
 * Гарантирует наличие всех необходимых полей с безопасными fallback значениями
 * 
 * @param {Object} user - Объект пользователя (может быть из разных источников)
 * @returns {Object} Нормализованный объект пользователя
 * 
 * Пример использования:
 * const normalizedUser = normalizeAvatarData(user);
 * <AvatarDisplay user={normalizedUser} size={42} />
 */
export function normalizeAvatarData(user) {
  if (!user || typeof user !== "object") {
    return {
      id: null,
      name: "Unknown",
      avatar_type: "letter",
      avatar_emoji: "👤",
      avatar_color: "#667eea",
      avatar_url: null,
    };
  }

  // Нормализуем avatar_type
  const rawType = user.avatar_type;
  const avatarType = (rawType && typeof rawType === "string" && ["letter", "emoji", "url"].includes(rawType.toLowerCase()))
    ? rawType.toLowerCase()
    : "letter";

  // Нормализуем avatar_emoji
  const rawEmoji = user.avatar_emoji;
  const avatarEmoji = (rawEmoji && typeof rawEmoji === "string" && rawEmoji.trim() !== "")
    ? rawEmoji
    : "👤";

  // Нормализуем avatar_color
  const rawColor = user.avatar_color;
  const avatarColor = (rawColor && typeof rawColor === "string" && rawColor.trim() !== "")
    ? rawColor
    : "#667eea";

  // Нормализуем avatar_url
  const rawUrl = user.avatar_url;
  const avatarUrl = (rawUrl && typeof rawUrl === "string" && rawUrl.trim() !== "")
    ? rawUrl
    : null;

  return {
    id: user.id || null,
    name: (typeof user.name === "string" && user.name.trim() !== "") ? user.name : "Unknown",
    avatar_type: avatarType,
    avatar_emoji: avatarEmoji,
    avatar_color: avatarColor,
    avatar_url: avatarUrl,
  };
}

/**
 * Утилита для нормализации данных из заявок в друзья (incoming/sent requests)
 * Преобразует формат бэкенда в формат AvatarDisplay
 * 
 * @param {Object} request - Объект заявки
 * @param {string} prefix - Префикс полей ('requester' или 'target')
 * @returns {Object} Нормализованный объект пользователя
 */
export function normalizeRequestData(request, prefix = "requester") {
  if (!request || typeof request !== "object") {
    return normalizeAvatarData({});
  }

  return normalizeAvatarData({
    id: request[`${prefix}_id`],
    name: request[`${prefix}_name`],
    avatar_type: request[`${prefix}_avatar_type`],
    avatar_emoji: request[`${prefix}_avatar_emoji`],
    avatar_color: request[`${prefix}_avatar_color`],
    avatar_url: request[`${prefix}_avatar_url`],
  });
}
