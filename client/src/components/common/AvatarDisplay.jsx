import React from "react";

/**
 * Универсальный компонент для отображения аватара
 * Логика приоритета: фото → буква+цвет → эмодзи+цвет
 * Поддерживает два формата данных:
 * 1. С profile: { user, profile: { avatar_type, avatar_emoji, avatar_color, avatar_url } }
 * 2. Плоский: { user: { avatar_type, avatar_emoji, avatar_color, avatar_url } }
 */
export default function AvatarDisplay({ 
  user, 
  profile, 
  size = 40,
  className = "",
  style = {},
}) {
  // Извлекаем данные - поддерживаем оба формата с защитой от null/undefined
  let avatarUrl = profile?.avatar_url || user?.avatar_url;
  
  // Строгая защита от null, undefined и пустых строк
  const rawAvatarType = profile?.avatar_type || user?.avatar_type;
  const avatarType = (rawAvatarType && typeof rawAvatarType === "string" && rawAvatarType.trim() !== "") 
    ? rawAvatarType.toLowerCase() 
    : "letter";
  
  const rawAvatarEmoji = profile?.avatar_emoji || user?.avatar_emoji;
  const avatarEmoji = (rawAvatarEmoji && typeof rawAvatarEmoji === "string" && rawAvatarEmoji.trim() !== "") 
    ? rawAvatarEmoji 
    : "👤";
  
  const rawAvatarColor = profile?.avatar_color || user?.avatar_color;
  const avatarColor = (rawAvatarColor && typeof rawAvatarColor === "string" && rawAvatarColor.trim() !== "") 
    ? rawAvatarColor 
    : "#667eea";
  
  // Преобразуем относительный URL в абсолютный для статических файлов
  if (avatarUrl && typeof avatarUrl === "string" && avatarUrl.startsWith("/static/")) {
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8081";
    avatarUrl = `${API_URL}${avatarUrl}`;
  }
  
  // Проверяем что avatarUrl не пустая строка после преобразования
  if (avatarUrl && typeof avatarUrl === "string" && avatarUrl.trim() === "") {
    avatarUrl = null;
  }

  // Получаем первую букву имени с защитой от null/undefined
  const firstLetter = (typeof user?.name === "string" && user.name.length > 0)
    ? user.name[0].toUpperCase()
    : "?";

  const baseStyle = {
    width: size,
    height: size,
    borderRadius: "50%",
    background: avatarColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: size * 0.4,
    flexShrink: 0,
    overflow: "hidden",
    ...style,
  };

  // Приоритет 1: Фото (строгая проверка типа и наличия URL)
  if (avatarType === "url" && avatarUrl && typeof avatarUrl === "string") {
    return (
      <div className={`avatar-display ${className}`} style={baseStyle}>
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          onError={(e) => {
            // Если фото не загрузилось, показываем fallback
            e.target.style.display = "none";
            e.target.parentElement.innerHTML = firstLetter;
          }}
        />
      </div>
    );
  }

  // Приоритет 2: Эмодзи (строгая проверка типа)
  if (avatarType === "emoji") {
    return (
      <div className={`avatar-display ${className}`} style={baseStyle}>
        <span style={{ fontSize: size * 0.6 }}>{avatarEmoji}</span>
      </div>
    );
  }

  // Приоритет 3: Буква (по умолчанию)
  return (
    <div className={`avatar-display ${className}`} style={baseStyle}>
      {firstLetter}
    </div>
  );
}