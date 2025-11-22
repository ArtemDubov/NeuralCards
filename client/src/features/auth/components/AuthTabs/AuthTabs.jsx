import React from "react";
import "./AuthTabs.css";

const AuthTabs = ({ isLoginForm, setIsLoginForm }) => {
  return (
    <div className="auth-tabs">
      <button
        className={`btn-tp5 ${isLoginForm ? "active" : ""}`}
        onClick={() => setIsLoginForm(true)}
      >
        Вход
      </button>
      <button
        className={`btn-tp5 ${isLoginForm ? "active" : ""}`}
        onClick={() => setIsLoginForm(false)}
      >
        Регистрация
      </button>
    </div>
  );
};

export default AuthTabs;
