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
 * TopHeader Navigation Component
 * Desktop navigation in top header
 */
const TopHeaderNav = React.memo(function TopHeaderNav({
  // Theme props
  txt,
  muted,
  hover,
}) {
  return (
    <nav className="topheader-nav" style={{
      display: "flex",
      gap: 4,
      alignItems: "center",
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
    }}>
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="topheader-nav-item"
          style={{
            textDecoration: "none",
            padding: "8px 12px",
            borderRadius: 6,
            color: txt,
            fontWeight: 500,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <FontAwesomeIcon icon={item.icon} className="topheader-nav-icon" style={{ fontSize: 15, color: muted }} />
          <span className="topheader-nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
});

export default TopHeaderNav;
