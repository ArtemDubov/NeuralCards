import React from "react";
import { useAppStore } from "../../../../shared/stores/appStore";

const AuthTabs = ({ isLoginForm, setIsLoginForm }) => {
  const { t } = useAppStore();
  return (
    <div className="nt-auth__tabs">
      <button
        className={`nt-auth__tab ${isLoginForm ? "nt-auth__tab--active" : ""}`}
        onClick={() => setIsLoginForm(true)}
      >
        {t("auth.login")}
      </button>
      <button
        className={`nt-auth__tab ${!isLoginForm ? "nt-auth__tab--active" : ""}`}
        onClick={() => setIsLoginForm(false)}
      >
        {t("auth.register")}
      </button>
    </div>
  );
};

export default AuthTabs;
