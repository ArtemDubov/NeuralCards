import { useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { DENSITY_SETTINGS } from "../contexts/themePresets";

/**
 * Хук для глобального применения настроек темы через CSS переменные.
 * Должен быть вызван в корневом компоненте приложения.
 */
export function useThemeStyles() {
  const { currentTheme, density } = useTheme();

  useEffect(() => {
    const root = document.documentElement;

    // Применяем цвета
    if (currentTheme.primary)
      root.style.setProperty("--nt-primary", currentTheme.primary);
    if (currentTheme.secondary)
      root.style.setProperty("--nt-secondary", currentTheme.secondary);
    if (currentTheme.accent)
      root.style.setProperty("--nt-accent", currentTheme.accent);

    // Фоны
    if (currentTheme.background)
      root.style.setProperty("--nt-background", currentTheme.background);
    if (currentTheme.backgroundSecondary)
      root.style.setProperty(
        "--nt-background-secondary",
        currentTheme.backgroundSecondary,
      );
    if (currentTheme.surface)
      root.style.setProperty("--nt-surface", currentTheme.surface);
    if (currentTheme.surfaceElevated)
      root.style.setProperty(
        "--nt-surface-elevated",
        currentTheme.surfaceElevated,
      );

    // Текст
    if (currentTheme.text)
      root.style.setProperty("--nt-text", currentTheme.text);
    if (currentTheme.textSecondary)
      root.style.setProperty("--nt-text-secondary", currentTheme.textSecondary);
    if (currentTheme.textMuted)
      root.style.setProperty("--nt-text-muted", currentTheme.textMuted);
    if (currentTheme.textInverse)
      root.style.setProperty("--nt-text-inverse", currentTheme.textInverse);

    // Границы
    if (currentTheme.border)
      root.style.setProperty("--nt-border", currentTheme.border);
    if (currentTheme.borderLight)
      root.style.setProperty("--nt-border-light", currentTheme.borderLight);
    if (currentTheme.borderDark)
      root.style.setProperty("--nt-border-dark", currentTheme.borderDark);

    // Семантические цвета
    if (currentTheme.success)
      root.style.setProperty("--nt-success", currentTheme.success);
    if (currentTheme.successLight)
      root.style.setProperty("--nt-success-light", currentTheme.successLight);
    if (currentTheme.error)
      root.style.setProperty("--nt-error", currentTheme.error);
    if (currentTheme.errorLight)
      root.style.setProperty("--nt-error-light", currentTheme.errorLight);
    if (currentTheme.warning)
      root.style.setProperty("--nt-warning", currentTheme.warning);
    if (currentTheme.warningLight)
      root.style.setProperty("--nt-warning-light", currentTheme.warningLight);
    if (currentTheme.info)
      root.style.setProperty("--nt-info", currentTheme.info);
    if (currentTheme.infoLight)
      root.style.setProperty("--nt-info-light", currentTheme.infoLight);

    // Компоненты
    if (currentTheme.headerBackground)
      root.style.setProperty(
        "--nt-header-background",
        currentTheme.headerBackground,
      );
    if (currentTheme.headerText)
      root.style.setProperty("--nt-header-text", currentTheme.headerText);
    if (currentTheme.buttonPrimaryBg)
      root.style.setProperty(
        "--nt-button-primary-bg",
        currentTheme.buttonPrimaryBg,
      );
    if (currentTheme.buttonPrimaryText)
      root.style.setProperty(
        "--nt-button-primary-text",
        currentTheme.buttonPrimaryText,
      );
    if (currentTheme.buttonSecondaryBg)
      root.style.setProperty(
        "--nt-button-secondary-bg",
        currentTheme.buttonSecondaryBg,
      );
    if (currentTheme.buttonSecondaryText)
      root.style.setProperty(
        "--nt-button-secondary-text",
        currentTheme.buttonSecondaryText,
      );
    if (currentTheme.cardBackground)
      root.style.setProperty(
        "--nt-card-background",
        currentTheme.cardBackground,
      );
    if (currentTheme.cardShadow)
      root.style.setProperty("--nt-card-shadow", currentTheme.cardShadow);
    if (currentTheme.linkColor)
      root.style.setProperty("--nt-link-color", currentTheme.linkColor);
    if (currentTheme.linkHover)
      root.style.setProperty("--nt-link-hover", currentTheme.linkHover);

    // Градиенты
    if (currentTheme.gradientStart)
      root.style.setProperty("--nt-gradient-start", currentTheme.gradientStart);
    if (currentTheme.gradientEnd)
      root.style.setProperty("--nt-gradient-end", currentTheme.gradientEnd);

    // Скроллбар
    if (currentTheme.scrollbarThumb)
      root.style.setProperty(
        "--nt-scrollbar-thumb",
        currentTheme.scrollbarThumb,
      );
    if (currentTheme.scrollbarTrack)
      root.style.setProperty(
        "--nt-scrollbar-track",
        currentTheme.scrollbarTrack,
      );

    // Шрифты
    if (currentTheme.fontFamily)
      root.style.setProperty("--nt-font-family", currentTheme.fontFamily);
    if (currentTheme.fontSizeBase)
      root.style.setProperty(
        "--nt-font-size-base",
        `${currentTheme.fontSizeBase}px`,
      );
    if (currentTheme.fontSizeSm)
      root.style.setProperty(
        "--nt-font-size-sm",
        `${currentTheme.fontSizeSm}px`,
      );
    if (currentTheme.fontSizeMd)
      root.style.setProperty(
        "--nt-font-size-md",
        `${currentTheme.fontSizeMd}px`,
      );
    if (currentTheme.fontSizeLg)
      root.style.setProperty(
        "--nt-font-size-lg",
        `${currentTheme.fontSizeLg}px`,
      );
    if (currentTheme.fontSizeXl)
      root.style.setProperty(
        "--nt-font-size-xl",
        `${currentTheme.fontSizeXl}px`,
      );
    if (currentTheme.fontSize2xl)
      root.style.setProperty(
        "--nt-font-size-2xl",
        `${currentTheme.fontSize2xl}px`,
      );
    if (currentTheme.fontWeightNormal)
      root.style.setProperty(
        "--nt-font-weight-normal",
        currentTheme.fontWeightNormal,
      );
    if (currentTheme.fontWeightMedium)
      root.style.setProperty(
        "--nt-font-weight-medium",
        currentTheme.fontWeightMedium,
      );
    if (currentTheme.fontWeightBold)
      root.style.setProperty(
        "--nt-font-weight-bold",
        currentTheme.fontWeightBold,
      );

    // Отступы (плотность) - используем density напрямую
    const densitySettings =
      DENSITY_SETTINGS[density] || DENSITY_SETTINGS.normal;
    if (densitySettings.spacingXs)
      root.style.setProperty(
        "--nt-spacing-xs",
        `${densitySettings.spacingXs}px`,
      );
    if (densitySettings.spacingSm)
      root.style.setProperty(
        "--nt-spacing-sm",
        `${densitySettings.spacingSm}px`,
      );
    if (densitySettings.spacingMd)
      root.style.setProperty(
        "--nt-spacing-md",
        `${densitySettings.spacingMd}px`,
      );
    if (densitySettings.spacingLg)
      root.style.setProperty(
        "--nt-spacing-lg",
        `${densitySettings.spacingLg}px`,
      );
    if (densitySettings.spacingXl)
      root.style.setProperty(
        "--nt-spacing-xl",
        `${densitySettings.spacingXl}px`,
      );
    if (densitySettings.spacing2xl)
      root.style.setProperty(
        "--nt-spacing-2xl",
        `${densitySettings.spacing2xl}px`,
      );
    if (densitySettings.spacing3xl)
      root.style.setProperty(
        "--nt-spacing-3xl",
        `${densitySettings.spacing3xl}px`,
      );
    if (densitySettings.componentPadding)
      root.style.setProperty(
        "--nt-component-padding",
        densitySettings.componentPadding,
      );
    if (densitySettings.cardPadding)
      root.style.setProperty("--nt-card-padding", densitySettings.cardPadding);
    if (densitySettings.sectionPadding)
      root.style.setProperty(
        "--nt-section-padding",
        densitySettings.sectionPadding,
      );

    // Радиусы и тени
    if (currentTheme.borderRadius)
      root.style.setProperty("--nt-border-radius", currentTheme.borderRadius);
    if (currentTheme.shadows)
      root.style.setProperty("--nt-shadows", currentTheme.shadows);
  }, [currentTheme, density]);
}

export default useThemeStyles;
