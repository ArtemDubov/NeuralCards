import React from "react";
import AvatarDisplay from "../../../components/common/AvatarDisplay";
import { normalizeAvatarData } from "../../../utils/avatarUtils";

/**
 * Friend List Component
 * Displays all friends (no online status)
 */
const FriendList = React.memo(function FriendList({
  friends,
  handleSelectFriend,
  // Theme props
  surface,
  border,
  txtMuted,
  text,
}) {
  if (friends.length === 0) return null;

  return (
    <div className="chat-friends-section" style={{ borderBottom: `2px solid ${border}` }}>
      <div className="chat-section-header" style={{ 
        padding: "12px 16px 8px", 
        fontSize: 11, 
        fontWeight: 700, 
        color: txtMuted, 
        textTransform: "uppercase", 
        letterSpacing: 0.5 
      }}>
        Друзья
      </div>
      <div className="chat-friends-list" style={{ 
        display: "flex", 
        flexDirection: "column",
        gap: 0,
        padding: 0
      }}>
        {friends.map((friend) => {
          // Нормализуем данные друга перед передачей в AvatarDisplay
          const normalizedFriend = normalizeAvatarData(friend);
          
          return (
          <button
            key={friend.id}
            onClick={() => handleSelectFriend(friend)}
            className="chat-friend-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "none",
              border: "none",
              borderBottom: `1px solid ${border}`,
              cursor: "pointer",
              padding: "12px 16px",
              width: "100%",
              textAlign: "left",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `var(--nt-background-secondary)` }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none" }}
          >
            <AvatarDisplay 
              user={normalizedFriend}
              size={42}
            />
            <span className="chat-friend-name" style={{ 
              fontSize: 14, 
              color: text,
              fontWeight: 500
            }}>
              {friend.name}
            </span>
          </button>
        );})}
      </div>
    </div>
  );
});

export default FriendList;
