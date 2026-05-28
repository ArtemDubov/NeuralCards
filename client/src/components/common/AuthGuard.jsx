import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Если авторизован — рендерит children.
 * Если нет — редиректит на главную (/).
 */
export function AuthGuard({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return null;
  
  // Проверяем либо isAuthenticated, либо наличие user (для случаев быстрой навигации после логина)
  const hasToken = !!localStorage.getItem("access_token");
  if (!isAuthenticated && !user && !hasToken) return <Navigate to="/" replace />;

  return children;
}

/**
 * Если НЕ авторизован — редиректит на /.
 * Если авторизован — рендерит children (для страниц login/register).
 */
export function RedirectIfAuthed({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return children;
}
