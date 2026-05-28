import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useLayout } from "../../../contexts/LayoutContext";

/**
 * Custom hook for Header logic
 * Manages sidebar/topbar modes, mobile state, navigation
 */
export function useHeaderLogic() {
  const { user, isAuthenticated, logout } = useAuth();
  const { mode, setMode } = useLayout();
  const navigate = useNavigate();

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // TopHeader state
  const [topbarMenuOpen, setTopbarMenuOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarCollapsed(false);
  }, [isMobile]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  const handleBack = useCallback((backTo) => navigate(backTo), [navigate]);

  const closeSidebarMobile = useCallback(() => setSidebarMobileOpen(false), []);

  const closeTopbarMenu = useCallback(() => setTopbarMenuOpen(false), []);

  const toggleLayout = useCallback(() => {
    setMode(mode === "header" ? "sidebar" : "header");
  }, [mode, setMode]);

  const toggleSidebarCollapse = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  return {
    // State
    mode,
    isMobile,
    sidebarCollapsed,
    sidebarMobileOpen,
    topbarMenuOpen,
    user,
    isAuthenticated,

    // Handlers
    handleLogout,
    handleBack,
    closeSidebarMobile,
    closeTopbarMenu,
    toggleLayout,
    toggleSidebarCollapse,
    setSidebarMobileOpen,
    setTopbarMenuOpen,
    setMode,
  };
}
