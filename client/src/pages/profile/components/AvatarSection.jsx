import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "../../../utils/icons";
import AvatarDisplay from "../../../components/common/AvatarDisplay";
import ProfileTopbar from "./ProfileTopbar";

/**
 * Компонент секции аватара - всегда кликабельный
 */
export default function AvatarSection({
  user,
  profile,
  formData,
  onAvatarClick,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onDeleteAccount,
  onLogout,
}) {
  const avatarUrl = profile?.profile?.avatar_url || formData.avatar_url;
  const displayAvatarType = profile?.profile?.avatar_type || formData.avatar_type || "letter";
  const displayAvatarEmoji = profile?.profile?.avatar_emoji || formData.avatar_emoji;
  const displayAvatarColor = profile?.profile?.avatar_color || formData.avatar_color || "var(--nt-primary)";

  // Создаём объект пользователя для AvatarDisplay
  const avatarUserData = {
    id: user?.id,
    name: user?.name,
    avatar_type: displayAvatarType,
    avatar_emoji: displayAvatarEmoji,
    avatar_color: displayAvatarColor,
    avatar_url: avatarUrl,
  };

  return (
    <section className="profile-section">
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "16px"
      }}>
        <h2 style={{ margin: 0 }}>Аватар</h2>
        {/* Кнопка меню в том же контейнере что и аватар */}
        <ProfileTopbar
          onNameChange={onNameChange}
          onEmailChange={onEmailChange}
          onPasswordChange={onPasswordChange}
          onDeleteAccount={onDeleteAccount}
          onLogout={onLogout}
        />
      </div>
      
      <div className="profile-avatar-section" style={{
        background: "transparent",
        border: "none",
        padding: 0
      }}>
        {/* Кликабельная аватарка - всегда доступна */}
        <div 
          className="profile-avatar-clickable"
          onClick={onAvatarClick}
          style={{ 
            position: "relative",
            cursor: "pointer",
            transition: "transform 0.2s",
            margin: "0 auto",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            const overlay = e.currentTarget.querySelector('.profile-avatar-edit-overlay');
            if (overlay) overlay.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            const overlay = e.currentTarget.querySelector('.profile-avatar-edit-overlay');
            if (overlay) overlay.style.opacity = "0";
          }}
        >
          <AvatarDisplay
            user={avatarUserData}
            size={100}
          />
          {/* Оверлей с иконкой редактирования */}
          <div className="profile-avatar-edit-overlay" style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "50%",
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "24px",
            opacity: 0,
            transition: "opacity 0.2s",
            pointerEvents: "none",
          }}>
            <FontAwesomeIcon icon={faPen} />
          </div>
        </div>
        
        <p className="profile-avatar-hint" style={{
          textAlign: "center",
          marginTop: "12px",
          fontSize: "14px",
          color: "var(--nt-text-secondary, #666)"
        }}>
          Нажмите на аватар для изменения
        </p>
      </div>
    </section>
  );
}