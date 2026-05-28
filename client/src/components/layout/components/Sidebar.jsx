import React from "react";
import SidebarLogo from "./SidebarLogo";
import SidebarBackButton from "./SidebarBackButton";
import SidebarNav from "./SidebarNav";
import SidebarBottom from "./SidebarBottom";

const SIDEBAR_W = 240;
const COLLAPSED_W = 68;

/**
 * Sidebar Component
 * Full sidebar with logo, navigation, and user section
 */
const Sidebar = React.memo(function Sidebar({
  showBackButton,
  backTo,
  backText,
  collapsed,
  isMobile,
  mobileOpen,
  onToggleLayout,
  onCloseMobile,
  onBack,
  onLogout,
  isAuthenticated,
  user,
  // Theme props
  bg,
  bdr,
  txt,
  muted,
  primary,
  secondary,
  hover,
}) {
  const w = isMobile ? 280 : collapsed ? COLLAPSED_W : SIDEBAR_W;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="sidebar-mobile-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 999,
          }}
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile top bar */}
      {isMobile && (
        <div className="sidebar-mobile-topbar" style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 54,
          background: bg,
          borderBottom: `1px solid ${bdr}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 14px",
          zIndex: 90,
        }}>
          <button
            onClick={() => {}}
            className="sidebar-mobile-menu-btn"
            style={{
              background: "transparent",
              border: "none",
              color: txt,
              cursor: "pointer",
              padding: "6px 8px",
              borderRadius: 6,
              fontSize: 20,
            }}
          >
            {/* Burger icon handled by parent */}
          </button>
          {/* Logo handled by parent */}
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar" style={{
        position: "fixed",
        top: isMobile ? 0 : 0,
        left: 0,
        bottom: 0,
        width: isMobile ? 280 : w,
        minWidth: isMobile ? 280 : w,
        background: bg,
        borderRight: isMobile ? "none" : `1px solid ${bdr}`,
        display: "flex",
        flexDirection: "column",
        transform: isMobile
          ? mobileOpen
            ? "translateX(0)"
            : "translateX(-100%)"
          : "none",
        zIndex: isMobile ? 1000 : 100,
        overflow: "hidden",
      }}>
        {/* Logo */}
        <SidebarLogo
          collapsed={collapsed}
          isMobile={isMobile}
          onToggleLayout={onToggleLayout}
          onCloseMobile={onCloseMobile}
          bg={bg}
          bdr={bdr}
          txt={txt}
          muted={muted}
          hover={hover}
        />

        {/* Back button */}
        <SidebarBackButton
          showBackButton={showBackButton}
          collapsed={collapsed}
          isMobile={isMobile}
          onBack={onBack}
          backText={backText}
          bdr={bdr}
          muted={muted}
        />

        {/* Navigation */}
        <SidebarNav
          collapsed={collapsed}
          isMobile={isMobile}
          onCloseMobile={onCloseMobile}
          txt={txt}
          muted={muted}
          hover={hover}
        />

        {/* Bottom section */}
        <SidebarBottom
          isAuthenticated={isAuthenticated}
          user={user}
          collapsed={collapsed}
          isMobile={isMobile}
          onCloseMobile={onCloseMobile}
          onLogout={onLogout}
          bdr={bdr}
          txt={txt}
          muted={muted}
          primary={primary}
          secondary={secondary}
          hover={hover}
        />
      </aside>
    </>
  );
});

export default Sidebar;
