import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const LayoutContext = createContext(null);
const STORAGE_KEY = "nt-layout-mode";

export function LayoutProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || "header"; } catch { return "header"; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, mode); } catch {}
  }, [mode]);

  const toggle = useCallback(() => setMode((m) => (m === "header" ? "sidebar" : "header")), []);

  const value = useMemo(() => ({ mode, setMode, toggle }), [mode, setMode, toggle]);
  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used within LayoutProvider");
  return ctx;
}
