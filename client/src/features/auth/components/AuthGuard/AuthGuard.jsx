// features/auth/components/AuthGuard/AuthGuard.jsx
import React, { useEffect, useState } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import LoginPage from "../LoginPage/LoginPage";

export function AuthGuard({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { initialize } = useAppStore();

  // Инициализация приложения
  useEffect(() => {
    const initApp = async () => {
      console.log("AuthGuard: Инициализация началась");
      await initialize();
      console.log("AuthGuard: Инициализация завершена");
      setIsInitialized(true);
    };

    if (!isInitialized) {
      initApp();
    }
  }, [initialize, isInitialized]);

  // Проверка авторизации
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  console.log("AuthGuard render:", { isInitialized, isAuthenticated });

  // Рендер состояний
  if (!isInitialized) {
    return (
      <div className="nt-auth__container">
        <div className="nt-loader">
          <div className="nt-loader__spinner"></div>
          <p>Загрузка приложения...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Авторизован и инициализирован - рендерим детей
  return <>{children}</>;
}
