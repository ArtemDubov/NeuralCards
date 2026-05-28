import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import PageShell from "../../components/layout/PageShell";
import Dashboard from "../../components/common/Dashboard";

export default function DashboardPage() {
  const { currentTheme } = useTheme();

  return (
    <PageShell currentTheme={currentTheme}>
      <Dashboard currentTheme={currentTheme} />
    </PageShell>
  );
}