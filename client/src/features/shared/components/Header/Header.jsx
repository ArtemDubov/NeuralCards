import React from "react";
import "./Header.css";

const Header = ({ user, onLogout }) => {
  return (
    <header className="app-header">
      <h1>Neural Trident 🌊</h1>
      <p className="welcome-text">Добро пожаловать, {user?.name}!</p>
      <button className="logout-button" onClick={onLogout}>
        Выйти
      </button>
    </header>
  );
};

export default Header;
