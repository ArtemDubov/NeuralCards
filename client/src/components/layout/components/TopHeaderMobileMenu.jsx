import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTableColumns, faRightFromBracket } from "../../../utils/icons";
import {
  faChartBar,
  faBook,
  faGlobe,
  faTrophy,
  faStar,
  faBolt,
  faComments,
  faPalette,
} from "../../../utils/icons";

const navItems = [
  { to: "/dashboard", label: "Дашборд", icon: faChartBar },
  { to: "/card-sets", label: "Наборы", icon: faBook },
  { to: "/leaderboard", label: "Лидеры", icon: faTrophy },
  { to: "/favorites", label: "Избранное", icon: faStar },
  { to: "/training/select", label: "Тренировка", icon: faBolt },
  { to: "/chat", label: "Чаты", icon: faComments },
  { to: "/settings/theme", label: "Интерфейс", icon: faPalette },
];

/**
 * TopHeader Mobile Menu Component
 * Full-screen mobile menu for top header mode
 */
const TopHeaderMobileMenu = React.memo(function TopHeaderMobileMenu({
  onClose,
  onToggleLayout,
  isAuthenticated,
  onLogout,
  // Theme props
  surface,
  bdr,
  txt,
  textMuted,
  primary,
}) {
  return (
    <nav className="topheader-mobile-menu" style={{
      position: "fixed",
      top: 56,
      left: 0,
      right: 0,
      bottom: 0,
      background: surface,
      zIndex: 1500,
      padding: "8px 0",
      overflowY: "auto",
    }}>
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onClose}
          className="topheader-mobile-item"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 20px",
            textDecoration: "none",
            color: txt || "#333",
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          <FontAwesomeIcon
            icon={item.icon}
            className="topheader-mobile-icon"
            style={{ width: 22, textAlign: "center", color: primary }}
          />
          {item.label}
        </Link>
      ))}
      
      <div className="topheader-mobile-footer" style={{
        borderTop: `1px solid ${bdr}`,
        marginTop: 8,
        paddingTop: 8,
      }}>
        <button
          onClick={() => {
            onToggleLayout();
            onClose();
          }}
          className="topheader-mobile-layout-btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
            padding: "14px 20px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: txt || "#333",
            fontSize: 15,
          }}
        >
          <FontAwesomeIcon
            icon={faTableColumns}
            className="topheader-mobile-layout-icon"
            style={{ width: 22, textAlign: "center", color: primary }}
          />
          Боковая панель
        </button>
        
        {isAuthenticated && (
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="topheader-mobile-logout-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "14px 20px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: textMuted || "#888",
              fontSize: 15,
            }}
          >
            <FontAwesomeIcon
              icon={faRightFromBracket}
              className="topheader-mobile-logout-icon"
              style={{ width: 22, textAlign: "center" }}
            />
            Выйти
          </button>
        )}
      </div>
    </nav>
  );
});

export default TopHeaderMobileMenu;
