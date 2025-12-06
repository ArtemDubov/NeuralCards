// App.js - УПРОЩЕННАЯ ВЕРСИЯ
import React from "react";
import { AuthGuard } from "./features/auth/components/AuthGuard/AuthGuard";
import { MainLayout } from "./layouts/MainLayout/MainLayout";
import "./styles/main.css";

function App() {
  return (
    <AuthGuard>
      <MainLayout />
    </AuthGuard>
  );
}

export default App;
