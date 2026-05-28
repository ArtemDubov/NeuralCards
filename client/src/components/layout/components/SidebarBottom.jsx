import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faUser } from "../../../utils/icons";
import AvatarDisplay from "../../common/AvatarDisplay";

/**
 * Sidebar Bottom Component
 * Displays user profile or login button and logout
 */
const SidebarBottom = React.memo(function SidebarBottom({
  isAuthenticated,
  user,
  collapsed,
  isMobile,
  onCloseMobile,
  onLogout,
  // Theme props
  bdr,
  txt,
  muted,
  primary,
  secondary,
  hover,
}) {
  return (
    <div className="sidebar-bottom" style={{ padding: "8px 0", borderTop: `1px solid ${bdr}` }}>
      {isAuthenticated ? (
        <>
          <Link
            to="/profile"
            onClick={isMobile ? onCloseMobile : undefined}
            className="sidebar-profile-link"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              textDecoration: "none",
              margin: "2px 8px",
              borderRadius: 8,
              justifyContent: collapsed && !isMobile ? "center" : "flex-start",
            }}
          >
            <AvatarDisplay 
              user={user}
              profile={user?.profile}
              size={34}
            />
            {(!collapsed || isMobile) && (
              <span className="sidebar-username" style={{
                fontSize: 13,
                fontWeight: 600,
                color: txt,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {user?.name || "Профиль"}
              </span>
            )}
          </Link>
          <button
            onClick={() => {
              onLogout();
              if (isMobile) onCloseMobile();
            }}
            className="sidebar-logout-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: collapsed && !isMobile ? "10px 0" : "10px 16px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: muted,
              justifyContent: collapsed && !isMobile ? "center" : "flex-start",
              margin: "2px 8px",
              borderRadius: 8,
            }}
          >
            <FontAwesomeIcon
              icon={faRightFromBracket}
              className="sidebar-logout-icon"
              style={{
                fontSize: 16,
                width: 22,
                textAlign: "center",
                flexShrink: 0,
              }}
            />
            {(!collapsed || isMobile) && (
              <span className="sidebar-logout-text" style={{ fontSize: 13, fontWeight: 500 }}>Выйти</span>
            )}
          </button>
        </>
      ) : (
        <Link
          to="/login"
          onClick={isMobile ? onCloseMobile : undefined}
          className="sidebar-login-btn"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 16px",
            textDecoration: "none",
            margin: "4px 12px",
            borderRadius: 8,
            background: `linear-gradient(135deg, ${primary}, ${secondary || "var(--nt-secondary)"})`,
            color: "#fff",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          <FontAwesomeIcon icon={faUser} />
          {(!collapsed || isMobile) && "Войти"}
        </Link>
      )}
    </div>
  );
});

export default SidebarBottom;
