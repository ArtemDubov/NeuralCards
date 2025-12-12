import React, { useEffect, useState } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import LoginPage from "../LoginPage/LoginPage";

export function AuthGuard({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { initialize, t } = useAppStore();

  useEffect(() => {
    const initApp = async () => {
      await initialize();
      setIsInitialized(true);
    };

    if (!isInitialized) {
      initApp();
    }
  }, [initialize, isInitialized]);

  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  if (!isInitialized) {
    return (
      <div className="nt-auth__container">
        <div className="nt-loader">
          <div className="nt-loader__spinner"></div>
          <p>{t("loading.app")}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
