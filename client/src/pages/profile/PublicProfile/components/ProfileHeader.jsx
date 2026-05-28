import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faUserCheck, faCalendar } from "../../../../utils/icons";
import AvatarDisplay from "../../../../components/common/AvatarDisplay";
import { normalizeAvatarData } from "../../../../utils/avatarUtils";

export default function ProfileHeader({ 
  user, 
  friendshipStatus, 
  sendingRequest, 
  onAddFriend, 
  currentTheme 
}) {
  // Нормализуем данные пользователя перед передачей в AvatarDisplay
  const userData = normalizeAvatarData(user);

  return (
    <div className="public-profile-card">
      <div className="public-profile-header">
        <AvatarDisplay 
          user={userData}
          size={80}
        />
        <div className="public-profile-info">
          <h1 className="public-profile-name">{user.name}</h1>
          {user.bio && <p className="public-profile-bio">{user.bio}</p>}
          <div className="profile-user-meta">
            <span className="profile-meta-item">
              <FontAwesomeIcon icon={faCalendar} style={{ marginRight: "4px" }} />
              На платформе с {user.joined_date || "—"}
            </span>
          </div>
        </div>
        {friendshipStatus !== null && (
          <div className="profile-friend-action">
            {friendshipStatus === "friends" && (
              <span className="profile-friends-badge">
                <FontAwesomeIcon icon={faUserCheck} style={{ marginRight: "6px" }} />
                В друзьях
              </span>
            )}
            {friendshipStatus === "pending" && (
              <span className="profile-pending-badge">Запрос отправлен</span>
            )}
            {friendshipStatus === "none" && (
              <button
                onClick={onAddFriend}
                disabled={sendingRequest}
                style={{
                  padding: "10px 20px",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: sendingRequest ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  background: currentTheme?.success || "var(--nt-success)",
                  opacity: sendingRequest ? 0.6 : 1,
                }}
              >
                <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: "6px" }} />
                {sendingRequest ? "..." : "Добавить в друзья"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
