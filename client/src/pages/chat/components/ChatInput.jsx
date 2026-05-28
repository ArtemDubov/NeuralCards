import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSmile } from "../../../utils/icons";

const REACTION_EMOJIS = ["❤️", "😂", "👍", "😢", "🔥", "😮"];

/**
 * Chat Input Component
 * Handles message input with emoji picker
 */
const ChatInput = React.memo(function ChatInput({
  newMessage,
  setNewMessage,
  handleSend,
  handleKeyDown,
  showEmoji,
  setShowEmoji,
  insertEmoji,
  inputRef,
  // Theme props
  border,
  bgSec,
  text,
  primary,
  surface,
  txtMuted,
}) {
  return (
    <div className="chat-input-container" style={{ 
      padding: "16px 20px", 
      borderTop: `1px solid ${border}`, 
      position: "relative" 
    }}>
      <div className="chat-input-row" style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className="chat-emoji-toggle"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: txtMuted }}
        >
          <FontAwesomeIcon icon={faSmile} />
        </button>
        <textarea
          ref={inputRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите сообщение..."
          className="chat-input-textarea"
          style={{ 
            flex: 1, 
            padding: "10px 14px", 
            borderRadius: 20, 
            border: `1px solid ${border}`, 
            background: bgSec, 
            color: text, 
            fontSize: 14, 
            outline: "none", 
            resize: "none", 
            minHeight: 40,
            fontFamily: "inherit",
          }}
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim()}
          className="chat-send-button"
          style={{
            width: 40, 
            height: 40, 
            borderRadius: "50%", 
            border: "none", 
            background: primary, 
            color: "#fff", 
            cursor: newMessage.trim() ? "pointer" : "not-allowed",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            transition: "transform 0.15s, opacity 0.15s",
            opacity: newMessage.trim() ? 1 : 0.5,
            transform: newMessage.trim() ? "scale(1)" : "scale(0.95)",
          }}
          onMouseEnter={(e) => {
            if (newMessage.trim()) {
              e.currentTarget.style.transform = "scale(1.05)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = newMessage.trim() ? "scale(1)" : "scale(0.95)";
          }}
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="chat-emoji-picker" style={{ 
          position: "absolute", 
          bottom: 80, 
          left: 20, 
          background: surface, 
          border: `1px solid ${border}`, 
          borderRadius: 12, 
          padding: 12, 
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)", 
          display: "grid", 
          gridTemplateColumns: "repeat(6, 1fr)", 
          gap: 6, 
          zIndex: 100,
        }}>
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => insertEmoji(emoji)}
              className="chat-emoji-item"
              style={{ 
                fontSize: 20, 
                padding: 6, 
                background: "none", 
                border: "none", 
                cursor: "pointer", 
                borderRadius: 6 
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default ChatInput;
