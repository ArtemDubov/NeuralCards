import React, { useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faRightFromBracket,
  faKey,
  faEnvelope,
  faSignature,
  faTrash,
  faEllipsisV,
} from "../../../utils/icons";

/**
 * Компонент верхней панели профиля с меню действий
 */
export default function ProfileTopbar({
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onDeleteAccount,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = useRef(null);

  // Закрытие меню при клике вне его
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="profile-dropdown" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="profile-menu-btn"
        title="Меню"
        style={{
          background: "none",
          border: "none",
          borderRadius: "8px",
          color: "var(--nt-text, #333)",
          cursor: "pointer",
          fontSize: "20px",
          height: "40px",
          transition: "all 0.2s",
          width: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>
      {menuOpen && (
        <div className="profile-dropdown-menu">
          <button
            onClick={() => {
              onNameChange();
              setMenuOpen(false);
            }}
            className="profile-dropdown-item"
          >
            <FontAwesomeIcon
              icon={faSignature}
              style={{ marginRight: "8px" }}
            />
            Сменить имя
          </button>
          <button
            onClick={() => {
              onEmailChange();
              setMenuOpen(false);
            }}
            className="profile-dropdown-item"
          >
            <FontAwesomeIcon
              icon={faEnvelope}
              style={{ marginRight: "8px" }}
            />
            Сменить email
          </button>
          <button
            onClick={() => {
              onPasswordChange();
              setMenuOpen(false);
            }}
            className="profile-dropdown-item"
          >
            <FontAwesomeIcon
              icon={faKey}
              style={{ marginRight: "8px" }}
            />
            Сменить пароль
          </button>
          <hr className="profile-dropdown-divider" />
          <button
            onClick={() => {
              onDeleteAccount();
              setMenuOpen(false);
            }}
            className="profile-dropdown-item-danger"
          >
            <FontAwesomeIcon
              icon={faTrash}
              style={{ marginRight: "8px" }}
            />
            Удалить аккаунт
          </button>
          <button
            onClick={() => {
              onLogout();
              setMenuOpen(false);
            }}
            className="profile-dropdown-item-danger"
          >
            <FontAwesomeIcon
              icon={faRightFromBracket}
              style={{ marginRight: "8px" }}
            />
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}