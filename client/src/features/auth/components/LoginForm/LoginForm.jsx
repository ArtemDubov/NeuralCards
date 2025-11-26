import React from "react";
import "./LoginForm.css";
import { useLanguage } from "../../../../contexts/LanguageContext";

const LoginForm = ({ email, setEmail, password, setPassword, handleLogin }) => {
  const { t } = useLanguage();
  return (
    <form onSubmit={handleLogin} className="auth-form container-tp9">
      <div className="input-group">
        <input
          type="email"
          placeholder={t("auth.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
        />
      </div>
      <div className="input-group">
        <input
          type="password"
          placeholder={t("auth.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
        />
      </div>
      <button className="btn-tp1" type="submit">
        {t("auth.signin")}
      </button>
    </form>
  );
};

export default LoginForm;
