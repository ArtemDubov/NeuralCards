import React from "react";
import { useThemeStyles } from "../../hooks/useThemeStyles";

/**
 * Компонент-обёртка для применения глобальных стилей темы.
 * Должен быть обёрнут вокруг всего приложения.
 */
export default function ThemeWrapper({ children }) {
  // Применяем хук для обновления CSS переменных
  useThemeStyles();

  return <>{children}</>;
}
