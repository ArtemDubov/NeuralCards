import React from "react";
import { Link } from "react-router-dom";
import AvatarDisplay from "../../../components/common/AvatarDisplay";
import { normalizeAvatarData } from "../../../utils/avatarUtils";

/**
 * Chat Header Component
 * Displays selected chat partner info
 */
const ChatHeader = React.memo(function ChatHeader({
  selectedPartner,
  // Theme props
  isDark,
  border,
  text,
  primary,
}) {
  if (!selectedPartner) return null;

  // Нормализуем данные партнёра перед передачей в AvatarDisplay
  const userData = normalizeAvatarData(selectedPartner);

  return (
    <div className="chat-header" style={{ 
      padding: "16px 20px", 
      display: "flex", 
      alignItems: "center", 
      gap: 12, 
      borderBottom: `1px solid ${border}`,
      background: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)"
    }}>
      <Link to={`/profile/${selectedPartner.id}`} style={{ textDecoration: "none" }}>
        <AvatarDisplay 
          user={userData}
          size={42}
        />
      </Link>
      <div style={{ flex: 1 }}>
        <Link to={`/profile/${selectedPartner.id}`} style={{ textDecoration: "none" }}>
          <div 
            className="chat-partner-name"
            style={{ 
              color: text, 
              fontWeight: 600, 
              fontSize: 15,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = primary}
            onMouseLeave={(e) => e.currentTarget.style.color = text}
          >
            {selectedPartner.name || "Пользователь"}
          </div>
        </Link>
      </div>
    </div>
  );
});

export default ChatHeader;
