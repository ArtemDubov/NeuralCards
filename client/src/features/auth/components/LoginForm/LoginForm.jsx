import React from "react";
import { useAppStore } from "../../../../shared/stores/appStore";

const LoginForm = ({ email, setEmail, password, setPassword, handleLogin }) => {
  const { t } = useAppStore();
  return (
    <form onSubmit={handleLogin} className="nt-form">
      <div className="nt-form__group">
        <input
          type="email"
          placeholder={t("auth.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="nt-form__input"
          required
        />
      </div>
      <div className="nt-form__group">
        <input
          type="password"
          placeholder={t("auth.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="nt-form__input"
          required
        />
      </div>
      <button className="nt-btn nt-btn--primary nt-btn--full" type="submit">
        {t("auth.signin")}
      </button>
    </form>
  );
};

export default LoginForm;
