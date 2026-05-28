import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useHeaderLogic } from "./hooks/useHeaderLogic";
import { Sidebar, TopHeader } from "./components";

/**
 * Header Component - Refactored
 * Main component that orchestrates sidebar and top header modes
 */
export default React.memo(function Header({
  showBackButton = false,
  backTo = "/dashboard",
  backText = "Назад",
}) {
  const { currentTheme } = useTheme();
  
  // All logic extracted to custom hook
  const {
    mode,
    isMobile,
    sidebarCollapsed,
    sidebarMobileOpen,
    topbarMenuOpen,
    user,
    isAuthenticated,
    handleLogout,
    handleBack,
    closeSidebarMobile,
    closeTopbarMenu,
    toggleLayout,
    setSidebarMobileOpen,
    setTopbarMenuOpen,
  } = useHeaderLogic();

  // Theme values
  const bg = currentTheme?.surface || (currentTheme?.mode === "dark" ? "#1a1a2e" : "#ffffff");
  const bdr = currentTheme?.border || (currentTheme?.mode === "dark" ? "#2a2a3e" : "#e8e8e8");
  const txt = currentTheme?.text || (currentTheme?.mode === "dark" ? "#fff" : "#1a1a2e");
  const muted = currentTheme?.textMuted || (currentTheme?.mode === "dark" ? "#888" : "#666");
  const primary = currentTheme?.primary || "#667eea";
  const secondary = currentTheme?.secondary || "#764ba2";
  const hover = currentTheme?.mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)";
  
  const surface = currentTheme?.surface || (currentTheme?.mode === "dark" ? "#1e1e2f" : "#fff");

  return mode === "sidebar" ? (
    <Sidebar
      showBackButton={showBackButton}
      backTo={backTo}
      backText={backText}
      collapsed={sidebarCollapsed}
      isMobile={isMobile}
      mobileOpen={sidebarMobileOpen}
      onToggleLayout={toggleLayout}
      onCloseMobile={closeSidebarMobile}
      onBack={() => handleBack(backTo)}
      onLogout={handleLogout}
      isAuthenticated={isAuthenticated}
      user={user}
      bg={bg}
      bdr={bdr}
      txt={txt}
      muted={muted}
      primary={primary}
      secondary={secondary}
      hover={hover}
    />
  ) : (
    <TopHeader
      showBackButton={showBackButton}
      backTo={backTo}
      backText={backText}
      menuOpen={topbarMenuOpen}
      isMobile={isMobile}
      onToggleMenu={() => setTopbarMenuOpen(!topbarMenuOpen)}
      onBack={() => handleBack(backTo)}
      onToggleLayout={toggleLayout}
      onLogout={handleLogout}
      isAuthenticated={isAuthenticated}
      user={user}
      bg={surface}
      txt={txt}
      surface={surface}
      bdr={bdr}
      primary={primary}
      muted={muted}
      hover={hover}
    />
  );
});
