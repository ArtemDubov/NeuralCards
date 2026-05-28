import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClone, faDesktop, faXmark } from "../../../utils/icons";

/**
 * Sidebar Logo Component
 * Displays logo with toggle buttons
 */
const SidebarLogo = React.memo(function SidebarLogo({
  collapsed,
  isMobile,
  onToggleLayout,
  onCloseMobile,
  // Theme props
  bg,
  bdr,
  txt,
  muted,
  hover,
}) {
  return (
    <div className="sidebar-logo-row" style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 12px",
      borderBottom: `1px solid ${bdr}`,
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        overflow: "hidden",
      }}>
        <FontAwesomeIcon
          icon={faClone}
          style={{ 
            fontSize: 22, 
            color: txt,
            flexShrink: 0,
          }}
        />
        {(!collapsed || isMobile) && (
          <span className="sidebar-logo-text" style={{
            fontSize: 15,
            fontWeight: 700,
            color: txt,
            whiteSpace: "nowrap",
          }}>
            NeuralCards
          </span>
        )}
      </div>
      
      {!isMobile ? (
        <button
          onClick={onToggleLayout}
          className="sidebar-toggle-btn"
          style={{
            background: hover,
            border: "none",
            cursor: "pointer",
            padding: "5px 7px",
            borderRadius: 6,
            color: muted,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
          }}
          title="Переключить на хедер"
        >
          <FontAwesomeIcon icon={faDesktop} style={{ fontSize: 14 }} />
        </button>
      ) : (
        <button
          onClick={onCloseMobile}
          className="sidebar-close-btn"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "5px 7px",
            borderRadius: 6,
            color: muted,
            fontSize: 16,
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      )}
    </div>
  );
});

export default SidebarLogo;
