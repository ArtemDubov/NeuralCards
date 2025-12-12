import React, { useState } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";

const EmojiPicker = ({ currentEmoji, onSelect, onClose }) => {
  const { t } = useAppStore();
  const [search, setSearch] = useState("");

  // Популярные эмодзи для профиля
  const popularEmojis = [
    "😀",
    "😎",
    "🤓",
    "🧠",
    "🎓",
    "📚",
    "✏️",
    "🌟",
    "⭐",
    "⚡",
    "🔥",
    "💎",
    "👑",
    "🎭",
    "🎨",
    "🎵",
    "🚀",
    "🌈",
    "🌊",
    "🌙",
    "🌲",
    "🌅",
    "☀️",
    "🐱",
    "🦊",
    "🐶",
    "🦉",
    "🦋",
    "🌸",
    "🍎",
    "⚽",
    "🎮",
    "🎸",
    "🎬",
    "💻",
    "📱",
    "🔒",
    "🔑",
    "💡",
    "❤️",
    "💙",
    "💚",
    "💛",
    "💜",
    "🖤",
    "🤍",
    "👍",
    "👋",
    "🙏",
    "🎯",
  ];

  const filteredEmojis = popularEmojis.filter(
    (emoji) =>
      emoji.includes(search) ||
      emoji.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="nt-emoji-picker">
      <div className="nt-emoji-picker__header">
        <h3>{t("profile.avatar.select_emoji")}</h3>
        <button className="nt-btn nt-btn--text" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="nt-emoji-picker__search">
        <input
          type="text"
          placeholder={t("profile.avatar.search_placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="nt-form__input"
        />
      </div>

      <div className="nt-emoji-picker__grid">
        {/* Кнопка "Удалить аватар" */}
        <button
          className="nt-emoji-picker__item nt-emoji-picker__item--remove"
          onClick={() => onSelect(null)}
          title={t("profile.avatar.remove")}
        >
          ❌
          <span className="nt-emoji-picker__label">
            {t("profile.avatar.remove")}
          </span>
        </button>

        {/* Список эмодзи */}
        {filteredEmojis.map((emoji, index) => (
          <button
            key={index}
            className={`nt-emoji-picker__item ${
              currentEmoji === emoji ? "nt-emoji-picker__item--selected" : ""
            }`}
            onClick={() => onSelect(emoji)}
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
