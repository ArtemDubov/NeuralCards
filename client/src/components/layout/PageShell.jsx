import React from "react";
import { useLayout } from "../../contexts/LayoutContext";
import Header from "./Header";

const SIDEBAR_W = 240;

// Отдельный компонент для контента страницы чтобы изолировать от изменений темы
const PageContent = React.memo(function PageContent({
  children,
  currentTheme,
  maxWidth,
}) {
  const { mode } = useLayout();
  const isSidebar = mode === "sidebar";

  return (
    <main
      style={{
        flex: 1,
        maxWidth: maxWidth,
        width: "100%",
        boxSizing: "border-box",
        paddingLeft: isSidebar ? SIDEBAR_W + 20 : 20,
        paddingRight: 20,
        paddingTop: 20,
        paddingBottom: 20,
        marginLeft: "auto",
        marginRight: "auto",
        background: "transparent",
      }}
    >
      {children}
    </main>
  );
});

export default function PageShell({
  children,
  showBackButton = false,
  backTo = "/dashboard",
  backText = "Назад",
  currentTheme,
  maxWidth = "1200px",
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        color: currentTheme?.text || "#333",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header
        showBackButton={showBackButton}
        backTo={backTo}
        backText={backText}
      />

      <PageContent
        currentTheme={currentTheme}
        maxWidth={maxWidth}
      >
        {children}
      </PageContent>
    </div>
  );
}