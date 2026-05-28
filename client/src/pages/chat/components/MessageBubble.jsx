import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCheckDouble } from "../../../utils/icons";

/**
 * Message Bubble Component
 * Displays a single message with styling based on sender
 */
const MessageBubble = React.memo(function MessageBubble({ 
  msg, 
  currentUserId, 
  isDark, 
  primary, 
  bgSec, 
  text, 
  txtMuted 
}) {
  const isMine = msg.sender_id === currentUserId;
  const [isNew, setIsNew] = useState(msg.is_temp || false);

  // Убираем анимацию через 300ms после появления
  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setIsNew(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  return (
    <div className={`chat-message-wrapper ${isNew ? 'message-new' : ''}`} style={{ 
      display: "flex", 
      justifyContent: isMine ? "flex-end" : "flex-start", 
      marginBottom: 8 
    }}>
      <div className={`chat-message-bubble ${isMine ? 'sent' : 'received'}`} style={{
        maxWidth: '70%',
        padding: "10px 14px",
        borderRadius: 16,
        borderTopRightRadius: isMine ? 4 : 16,
        borderTopLeftRadius: isMine ? 16 : 4,
        background: isMine ? primary : bgSec,
        color: isMine ? "#fff" : text,
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      }}>
        <div className="chat-message-text" style={{ fontSize: 14, lineHeight: 1.5 }}>
          {msg.content}
        </div>
        <div className="chat-message-time" style={{ 
          fontSize: 10, 
          marginTop: 4, 
          opacity: 0.7, 
          textAlign: "right",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 4
        }}>
          {new Date(msg.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
          {isMine && (
            <FontAwesomeIcon 
              icon={msg.is_read ? faCheckDouble : faCheck} 
              style={{ fontSize: 10 }} 
            />
          )}
        </div>
      </div>
    </div>
  );
});

export default MessageBubble;