import React, { useState } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useAuthStore } from "../../../../shared/stores/authStore";
import ChangeEmailForm from "./ChangeEmailForm";
import ChangePasswordForm from "./ChangePasswordForm";
import ChangeNameForm from "./ChangeNameForm";

const SecuritySettings = () => {
  const { t } = useAppStore();
  const [activeTab, setActiveTab] = useState("name");
  const { user } = useAuthStore();

  return (
    <div className="nt-content__card nt-util__mt-lg">
      {/* Табы */}
      <div className="nt-util__flex nt-util__gap-md nt-util__mb-xl nt-util__border-b">
        <button
          className={`nt-btn ${
            activeTab === "name" ? "nt-btn--primary" : "nt-btn--outline"
          } nt-util__flex-1`}
          onClick={() => setActiveTab("name")}
        >
          <i className="fas fa-user nt-util__mr-sm"></i>
          {t("profile.security.changeName")}
        </button>
        <button
          className={`nt-btn ${
            activeTab === "email" ? "nt-btn--primary" : "nt-btn--outline"
          } nt-util__flex-1`}
          onClick={() => setActiveTab("email")}
        >
          <i className="fas fa-envelope nt-util__mr-sm"></i>
          {t("profile.security.changeEmail")}
        </button>
        <button
          className={`nt-btn ${
            activeTab === "password" ? "nt-btn--primary" : "nt-btn--outline"
          } nt-util__flex-1`}
          onClick={() => setActiveTab("password")}
        >
          <i className="fas fa-key nt-util__mr-sm"></i>
          {t("profile.security.changePassword")}
        </button>
      </div>

      {/* Контент */}
      <div className="nt-util__mt-lg">
        {activeTab === "name" && <ChangeNameForm currentName={user?.name} />}
        {activeTab === "email" && (
          <ChangeEmailForm currentEmail={user?.email} />
        )}
        {activeTab === "password" && <ChangePasswordForm />}
      </div>
    </div>
  );
};

export default SecuritySettings;
