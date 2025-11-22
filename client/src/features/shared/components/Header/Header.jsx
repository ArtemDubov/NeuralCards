import React from "react";
import "./Header.css";
import ThemeSwitcher from "../ThemeSwitcher/ThemeSwitcher";

const Header = ({ user, onLogout }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-logo">
          <h1>Neural Trident 🌊</h1>
          <p className="welcome-text">Добро пожаловать, {user?.name}!</p>
        </div>

        <div className="header-actions">
          {/* Добавляем переключатель тем */}
          <ThemeSwitcher />

          {/* Кнопка выхода */}
          <button className="btn-tp2" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
