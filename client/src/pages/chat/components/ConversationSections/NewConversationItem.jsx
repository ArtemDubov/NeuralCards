import React from "react";
import AvatarDisplay from "../../../../components/common/AvatarDisplay";
import { normalizeAvatarData } from "../../../../utils/avatarUtils";

/**
 * New Conversation Item Component
 * Displays a friend without conversation history
 */
const NewConversationItem = React.memo(function NewConversationItem({
  friend,
  selectedPartner,
  handleStartChatWithFriend,
  // Theme props
  border,
  txtMuted,
  text,
  primary,
}) {
  // Нормализуем данные друга перед передачей в AvatarDisplay
  const normalizedFriend = normalizeAvatarData(friend);

  return (
    <div
      onClick={() => handleStartChatWithFriend(friend)}
      className="chat-conversation-item"
      style={{
        padding: "12px 16px",
        borderBottom: `1px solid ${border}`,
        cursor: "pointer",
        transition: "all 0.15s",
        background: selectedPartner?.id === friend.id ? `${primary}15` : "transparent",
        borderLeft: selectedPartner?.id === friend.id ? `3px solid ${primary}` : "3px solid transparent",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = `${primary}08`)}
      onMouseLeave={(e) => (e.currentTarget.style.background = selectedPartner?.id === friend.id ? `${primary}15` : "transparent")}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <AvatarDisplay 
          user={normalizedFriend}
          size={42}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: text }}>
            {friend.name}
          </span>
          <div style={{ 
            fontSize: 12, 
            color: txtMuted,
            marginTop: 2
          }}>
            Нажмите, чтобы начать чат
          </div>
        </div>
      </div>
    </div>
  );
});

export default NewConversationItem;
