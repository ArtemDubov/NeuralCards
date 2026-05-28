import React, { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faChevronRight } from "../../utils/icons";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Компонент хлебных крошек для навигации
 */
export default function Breadcrumbs() {
  const location = useLocation();
  const { currentTheme } = useTheme();

  const getPathName = (path) => {
    const names = {
      "": "Главная",
      dashboard: "Дашборд",
      "card-sets": "Наборы",
      training: "Тренировки",
      profile: "Профиль",
      "settings/theme": "Настройки темы",
      chat: "Чаты",
      guest: "Гостевой режим",
      login: "Вход",
      register: "Регистрация",
    };

    // Проверяем точное совпадение
    if (names[path]) return names[path];

    // Проверяем частичное совпадение
    for (const key of Object.keys(names)) {
      if (path.startsWith(key)) return names[key];
    }

    // Если не нашли, возвращаем часть пути
    const lastSegment = path.split("/").pop();
    return lastSegment || "Главная";
  };

  const paths = location.pathname.split("/").filter(Boolean);

  // Не показываем на главной
  if (paths.length === 0) return null;

  return (
    <nav
      style={{
        ...styles.container,
        background: currentTheme.surface,
        borderBottom: `1px solid ${currentTheme.border}`,
      }}
    >
      <div style={styles.content}>
        {/* Главная - всегда первая */}
        <Link to="/dashboard" style={styles.link}>
          <FontAwesomeIcon icon={faHome} />
        </Link>

        {/* Остальные пути */}
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          const fullPath = "/" + paths.slice(0, index + 1).join("/");
          const name = getPathName(path);

          return (
            <Fragment key={fullPath}>
              <FontAwesomeIcon icon={faChevronRight} style={styles.chevron} />
              {isLast ? (
                <span
                  style={{
                    ...styles.current,
                    color: currentTheme.text,
                  }}
                >
                  {name}
                </span>
              ) : (
                <Link
                  to={fullPath}
                  style={{
                    ...styles.link,
                    color: currentTheme.linkColor,
                  }}
                >
                  {name}
                </Link>
              )}
            </Fragment>
          );
        })}
      </div>
    </nav>
  );
}

const styles = {
  container: {
    padding: "8px 20px",
    fontSize: "14px",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  link: {
    textDecoration: "none",
    transition: "color 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  chevron: {
    fontSize: "12px",
    opacity: 0.5,
  },
  current: {
    fontWeight: "500",
  },
};
