import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClone, faBars, faXmark } from "../../../utils/icons";
import TopHeaderNav from "./TopHeaderNav";
import TopHeaderActions from "./TopHeaderActions";
import TopHeaderMobileMenu from "./TopHeaderMobileMenu";

/**
 * TopHeader Component
 * Top navigation bar for header layout mode
 */
const TopHeader = React.memo(function TopHeader({
  showBackButton,
  backTo,
  backText,
  menuOpen,
  isMobile,
  onToggleMenu,
  onBack,
  onToggleLayout,
  onLogout,
  isAuthenticated,
  user,
  // Theme props
  bg,
  txt,
  surface,
  bdr,
  primary,
  muted,
  hover,
}) {
  return (
    <>
      {/* Mobile overlay */}
      {isMobile && menuOpen && (
        <div
          className="topheader-mobile-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1499,
          }}
          onClick={onToggleMenu}
        />
      )}

      <header className="topheader" style={{
        position: "sticky",
        top: 0,
        zIndex: 1500,
        background: bg,
        borderBottom: `1px solid ${bdr || "rgba(255,255,255,0.1)"}`,
      }}>
        <div className="topheader-content" style={{
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          height: 56,
        }}>
          {/* Left: Logo & Mobile Burger */}
          <div className="topheader-left" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isMobile && (
              <button
                onClick={onToggleMenu}
                className="topheader-burger-btn"
                style={{
                  background: "transparent",
                  border: "none",
                  color: txt,
                  cursor: "pointer",
                  padding: "8px 10px",
                  borderRadius: 6,
                  fontSize: 18,
                }}
              >
                <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
              </button>
            )}
            
            <div className="topheader-logo" style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 10,
            }}>
              <FontAwesomeIcon
                icon={faClone}
                style={{ 
                  fontSize: 22, 
                  color: txt,
                  flexShrink: 0,
                }}
              />
              {!isMobile && (
                <span className="topheader-logo-text" style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: txt,
                  whiteSpace: "nowrap",
                }}>
                  NeuralCards
                </span>
              )}
            </div>
          </div>

          {/* Center: Desktop nav */}
          {!isMobile && (
            <TopHeaderNav
              txt={txt}
              muted={muted}
              hover={hover}
            />
          )}

          {/* Right: Actions */}
          <TopHeaderActions
            showBackButton={showBackButton}
            isMobile={isMobile}
            onBack={onBack}
            backText={backText}
            onToggleLayout={onToggleLayout}
            isAuthenticated={isAuthenticated}
            user={user}
            bdr={bdr}
            txt={txt}
            primary={primary}
            hover={hover}
          />
        </div>

        {/* Mobile menu */}
        {isMobile && menuOpen && (
          <TopHeaderMobileMenu
            onClose={onToggleMenu}
            onToggleLayout={onToggleLayout}
            isAuthenticated={isAuthenticated}
            onLogout={onLogout}
            surface={surface}
            bdr={bdr}
            txt={txt}
            textMuted={txt}
            primary={primary}
          />
        )}
      </header>
    </>
  );
});

export default TopHeader;
