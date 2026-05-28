import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faBook,
  faGlobe,
  faTrophy,
  faStar,
  faBolt,
  faComments,
  faPalette,
  faChartLine,
} from "../../../utils/icons";

const navItems = [
  { to: "/dashboard", label: "Дашборд", icon: faChartBar },
  { to: "/card-sets", label: "Наборы", icon: faBook },
  { to: "/stats", label: "Статистика", icon: faChartLine },
  { to: "/leaderboard", label: "Лидеры", icon: faTrophy },
  { to: "/favorites", label: "Избранное", icon: faStar },
  { to: "/training/select", label: "Тренировка", icon: faBolt },
  { to: "/chat", label: "Чаты", icon: faComments },
  { to: "/settings/theme", label: "Интерфейс", icon: faPalette },
];

/**
 * Sidebar Navigation Component
 * Displays navigation menu items
 */
const SidebarNav = React.memo(function SidebarNav({
  collapsed,
  isMobile,
  onCloseMobile,
  // Theme props
  txt,
  muted,
  hover,
}) {
  return (
    <nav className="sidebar-nav" style={{ flex: 1, padding: "6px 0", overflowY: "auto" }}>
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={isMobile ? onCloseMobile : undefined}
          className="sidebar-nav-item"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            textDecoration: "none",
            padding: collapsed && !isMobile ? "12px 0" : "11px 16px",
            color: txt,
            justifyContent: collapsed && !isMobile ? "center" : "flex-start",
            margin: "2px 8px",
            borderRadius: 8,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
          title={collapsed && !isMobile ? item.label : undefined}
        >
          <FontAwesomeIcon
            icon={item.icon}
            className="sidebar-nav-icon"
            style={{
              fontSize: 17,
              width: 22,
              textAlign: "center",
              flexShrink: 0,
              color: muted,
            }}
          />
          {(!collapsed || isMobile) && (
            <span className="sidebar-nav-label" style={{
              fontSize: 13.5,
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}>
              {item.label}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
});

export default SidebarNav;
