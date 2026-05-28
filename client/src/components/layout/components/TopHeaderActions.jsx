import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTableColumns } from "../../../utils/icons";
import AvatarDisplay from "../../common/AvatarDisplay";

/**
 * TopHeader Actions Component
 * Right side actions (back button, layout toggle, profile)
 */
const TopHeaderActions = React.memo(function TopHeaderActions({
  showBackButton,
  isMobile,
  onBack,
  backText,
  onToggleLayout,
  isAuthenticated,
  user,
  // Theme props
  bdr,
  txt,
  primary,
  hover,
}) {
  return (
    <div className="topheader-actions" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
      {/* Back button */}
      {showBackButton && (
        <button
          onClick={onBack}
          className="topheader-back-btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            background: "transparent",
            color: txt,
            border: `1px solid ${bdr}`,
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          {!isMobile && backText}
        </button>
      )}

      {/* Layout toggle */}
      {!isMobile && (
        <button
          onClick={onToggleLayout}
          className="topheader-layout-btn"
          style={{
            background: "transparent",
            border: "none",
            color: txt,
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: 6,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
          title="Переключить на боковую панель"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <FontAwesomeIcon icon={faTableColumns} style={{ fontSize: 15 }} />
        </button>
      )}

      {/* Profile / Login */}
      {isAuthenticated ? (
        <Link
          to="/profile"
          className="topheader-profile-link"
          style={{
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <AvatarDisplay 
            user={user}
            profile={user?.profile}
            size={36}
          />
        </Link>
      ) : (
        <Link
          to="/login"
          className="topheader-login-btn"
          style={{
            padding: "7px 18px",
            borderRadius: 6,
            border: `1px solid ${primary}`,
            background: "transparent",
            color: txt,
            fontWeight: 600,
            fontSize: 13,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          Войти
        </Link>
      )}
    </div>
  );
});

export default TopHeaderActions;
