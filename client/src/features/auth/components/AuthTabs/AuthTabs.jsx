import React from "react";
import "./AuthTabs.css";
import { useLanguage } from "../../../../contexts/LanguageContext";

const AuthTabs = ({ isLoginForm, setIsLoginForm }) => {
  const { t } = useLanguage();
  return (
    <div className="auth-tabs">
      <button
        className={`btn-tp5 ${isLoginForm ? "active" : ""}`}
        onClick={() => setIsLoginForm(true)}
      >
        {t("auth.login")}
      </button>
      <button
        className={`btn-tp5 ${!isLoginForm ? "active" : ""}`}
        onClick={() => setIsLoginForm(false)}
      >
        {t("auth.register")}
      </button>
    </div>
  );
};

export default AuthTabs;
