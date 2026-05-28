import React, { useEffect } from "react";
import { EMOJI_OPTIONS } from "../utils/avatarConstants";

/**
 * Модальное окно для выбора эмодзи аватара
 */
export default function EmojiModal({ 
  onClose, 
  onSelect, 
  currentEmoji
}) {
  // Блокируем прокрутку при открытой модалке
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn">✕</button>
        
        <h2 className="modal-title">
          <span style={{ marginRight: "8px" }}>😊</span>
          Выберите эмодзи
        </h2>

        <div className="emoji-grid">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onSelect(emoji);
                onClose();
              }}
              className="emoji-button"
              style={{
                borderColor: currentEmoji === emoji ? "var(--nt-primary)" : undefined,
                background: currentEmoji === emoji ? "rgba(102,126,234,0.1)" : undefined,
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
