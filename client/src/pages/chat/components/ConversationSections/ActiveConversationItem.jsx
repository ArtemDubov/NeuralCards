import React from "react";
import AvatarDisplay from "../../../../components/common/AvatarDisplay";
import { normalizeAvatarData } from "../../../../utils/avatarUtils";

/**
 * Active Conversation Item Component
 * Displays a conversation with message history
 */
const ActiveConversationItem = React.memo(function ActiveConversationItem({
  conv,
  selectedPartner,
  handleSelectConversation,
  // Theme props
  border,
  txtMuted,
  text,
  primary,
}) {
  // Нормализуем данные пользователя перед передачей в AvatarDisplay
  const userData = normalizeAvatarData({
    id: conv.partner_id || conv.user_id,
    name: conv.partner_name || conv.user_name,
    avatar_type: conv.avatar_type,
    avatar_emoji: conv.avatar_emoji,
    avatar_color: conv.avatar_color,
    avatar_url: conv.avatar_url,
  });

  return (
    <div
      onClick={() => handleSelectConversation(conv)}
      className="chat-conversation-item"
      style={{
        padding: "12px 16px",
        borderBottom: `1px solid ${border}`,
        cursor: "pointer",
        transition: "all 0.15s",
        background: selectedPartner?.id === (conv.partner_id || conv.user_id) ? `${primary}15` : "transparent",
        borderLeft: selectedPartner?.id === (conv.partner_id || conv.user_id) ? `3px solid ${primary}` : "3px solid transparent",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = `${primary}08`)}
      onMouseLeave={(e) => (e.currentTarget.style.background = selectedPartner?.id === (conv.partner_id || conv.user_id) ? `${primary}15` : "transparent")}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <AvatarDisplay 
          user={userData}
          size={42}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: text }}>
              {conv.partner_name || conv.user_name}
            </span>
            {conv.unread_count > 0 && (
              <span className="chat-unread-badge" style={{ 
                background: primary, 
                color: "#fff", 
                borderRadius: 10, 
                padding: "2px 8px", 
                fontSize: 11, 
                fontWeight: 600 
              }}>
                {conv.unread_count}
              </span>
            )}
          </div>
          <div className="chat-last-message" style={{ 
            fontSize: 13, 
            color: txtMuted, 
            whiteSpace: "nowrap", 
            overflow: "hidden", 
            textOverflow: "ellipsis",
            lineHeight: 1.4
          }}>
            {conv.last_message || "Нет сообщений"}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ActiveConversationItem;
