import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "../../contexts/ThemeContext";
import ToggleSwitch from "../../components/common/ToggleSwitch";

import ColorPreviewWindow from "../../components/common/ColorPreviewWindow";
import PageShell from "../../components/layout/PageShell";
import {
  faSliders,
  faRotateRight,
  faFont,
  faMoon,
  faSun,
  faEye,
  faPalette,
} from "../../utils/icons";

// Компонент предосмотра цвета
function ColorPreviewExample({ colorType, colorValue, currentTheme }) {
  const previewStyles = {
    primary: (
      <button
        style={{
          padding: "8px 16px",
          background: colorValue,
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontSize: "12px",
        }}
      >
        Кнопка
      </button>
    ),
    secondary: (
      <button
        style={{
          padding: "8px 16px",
          background: colorValue,
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontSize: "12px",
        }}
      >
        Кнопка
      </button>
    ),
    accent: (
      <span style={{ color: colorValue, fontSize: "14px", fontWeight: "bold" }}>
        Акцент
      </span>
    ),
    background: (
      <div
        style={{
          width: "100%",
          height: "40px",
          background: colorValue,
          borderRadius: "6px",
        }}
      />
    ),
    surface: (
      <div
        style={{
          width: "100%",
          height: "40px",
          background: colorValue,
          borderRadius: "6px",
          border: `1px solid ${currentTheme.border}`,
        }}
      />
    ),
    text: (
      <span style={{ color: colorValue, fontSize: "14px" }}>Пример текста</span>
    ),
    textSecondary: (
      <span style={{ color: colorValue, fontSize: "12px" }}>
        Вторичный текст
      </span>
    ),
    textMuted: (
      <span style={{ color: colorValue, fontSize: "12px" }}>Приглушённый</span>
    ),
    border: (
      <div
        style={{
          width: "100%",
          height: "40px",
          border: `2px solid ${colorValue}`,
          borderRadius: "6px",
        }}
      />
    ),
    success: (
      <span
        style={{
          padding: "4px 8px",
          background: `${colorValue}20`,
          color: colorValue,
          borderRadius: "4px",
          fontSize: "12px",
        }}
      >
        ✓ Успех
      </span>
    ),
    error: (
      <span
        style={{
          padding: "4px 8px",
          background: `${colorValue}20`,
          color: colorValue,
          borderRadius: "4px",
          fontSize: "12px",
        }}
      >
        ✕ Ошибка
      </span>
    ),
    warning: (
      <span
        style={{
          padding: "4px 8px",
          background: `${colorValue}20`,
          color: colorValue,
          borderRadius: "4px",
          fontSize: "12px",
        }}
      >
        ⚠ Внимание
      </span>
    ),
    info: (
      <span
        style={{
          padding: "4px 8px",
          background: `${colorValue}20`,
          color: colorValue,
          borderRadius: "4px",
          fontSize: "12px",
        }}
      >
        ℹ Инфо
      </span>
    ),
    gradientStart: (
      <div
        style={{
          width: "100%",
          height: "40px",
          background: `linear-gradient(90deg, ${colorValue}, ${currentTheme.gradientEnd})`,
          borderRadius: "6px",
        }}
      />
    ),
    gradientEnd: (
      <div
        style={{
          width: "100%",
          height: "40px",
          background: `linear-gradient(90deg, ${currentTheme.gradientStart}, ${colorValue})`,
          borderRadius: "6px",
        }}
      />
    ),
    default: (
      <div
        style={{
          width: "100%",
          height: "40px",
          background: colorValue,
          borderRadius: "6px",
        }}
      />
    ),
  };

  return previewStyles[colorType] || previewStyles.default;
}

// CSS стили для toggle switch
const toggleStyles = `
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .switch input:checked + .slider {
    background-color: #667eea;
  }
  .switch input:checked + .slider:before {
    transform: translateX(24px);
  }
  .switch .slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
`;

// Описания для каждого цвета
const COLOR_DESCRIPTIONS = {
  // Основные цвета
  primary: {
    name: "Основной цвет",
    description: "Кнопки, ссылки, акценты, хедер",
    preview: "primary",
  },
  secondary: {
    name: "Вторичный цвет",
    description: "Градиенты, ховеры, дополнительные элементы",
    preview: "secondary",
  },
  accent: {
    name: "Акцентный цвет",
    description: "Яркие акценты, уведомления, бейджи",
    preview: "accent",
  },
  // Фоны
  background: {
    name: "Фон страницы",
    description: "Основной фон всей страницы",
    preview: "background",
  },
  backgroundSecondary: {
    name: "Вторичный фон",
    description: "Фон для карточек статистики, вторичных элементов",
    preview: "backgroundSecondary",
  },
  surface: {
    name: "Фон карточек",
    description: "Фон карточек, панелей, модальных окон",
    preview: "surface",
  },
  surfaceElevated: {
    name: "Приподнятый фон",
    description: "Фон для выпадающих меню, тултипов",
    preview: "surfaceElevated",
  },
  // Текст
  text: {
    name: "Основной текст",
    description: "Заголовки, основной текст контента",
    preview: "text",
  },
  textSecondary: {
    name: "Вторичный текст",
    description: "Описания, подписи, мета-информация",
    preview: "textSecondary",
  },
  textMuted: {
    name: "Приглушённый текст",
    description: "Неактивный текст, плейсхолдеры",
    preview: "textMuted",
  },
  // Границы
  border: {
    name: "Основная граница",
    description: "Границы полей ввода, карточек, кнопок",
    preview: "border",
  },
  borderLight: {
    name: "Светлая граница",
    description: "Лёгкие разделители, ховеры",
    preview: "borderLight",
  },
  borderDark: {
    name: "Тёмная граница",
    description: "Акцентные границы, активные элементы",
    preview: "borderDark",
  },
  // Семантика
  success: {
    name: "Успех",
    description: "Зелёный цвет для успешных действий",
    preview: "success",
  },
  successLight: {
    name: "Успех (светлый)",
    description: "Фон для уведомлений об успехе",
    preview: "successLight",
  },
  error: {
    name: "Ошибка",
    description: "Красный цвет для ошибок, удаления",
    preview: "error",
  },
  errorLight: {
    name: "Ошибка (светлый)",
    description: "Фон для уведомлений об ошибках",
    preview: "errorLight",
  },
  warning: {
    name: "Предупреждение",
    description: "Оранжевый цвет для предупреждений",
    preview: "warning",
  },
  warningLight: {
    name: "Предупреждение (светлый)",
    description: "Фон для предупреждений",
    preview: "warningLight",
  },
  info: {
    name: "Информация",
    description: "Синий цвет для информационных сообщений",
    preview: "info",
  },
  infoLight: {
    name: "Информация (светлый)",
    description: "Фон для информационных сообщений",
    preview: "infoLight",
  },
  // Компоненты
  headerBackground: {
    name: "Фон хедера",
    description: "Фон верхней панели навигации",
    preview: "headerBackground",
  },
  headerText: {
    name: "Текст хедера",
    description: "Текст в верхней панели",
    preview: "headerText",
  },
  buttonPrimaryBg: {
    name: "Фон основной кнопки",
    description: "Фон для главных кнопок действия",
    preview: "buttonPrimaryBg",
  },
  buttonPrimaryText: {
    name: "Текст основной кнопки",
    description: "Текст на главных кнопках",
    preview: "buttonPrimaryText",
  },
  buttonSecondaryBg: {
    name: "Фон вторичной кнопки",
    description: "Фон для второстепенных кнопок",
    preview: "buttonSecondaryBg",
  },
  buttonSecondaryText: {
    name: "Текст вторичной кнопки",
    description: "Текст на второстепенных кнопках",
    preview: "buttonSecondaryText",
  },
  cardBackground: {
    name: "Фон карточки",
    description: "Фон для карточек контента",
    preview: "cardBackground",
  },
  linkColor: {
    name: "Цвет ссылки",
    description: "Цвет ссылок по умолчанию",
    preview: "linkColor",
  },
  linkHover: {
    name: "Цвет ссылки (ховер)",
    description: "Цвет ссылок при наведении",
    preview: "linkHover",
  },
  // Градиенты
  gradientStart: {
    name: "Начало градиента",
    description: "Начальный цвет для градиентов",
    preview: "gradientStart",
  },
  gradientEnd: {
    name: "Конец градиента",
    description: "Конечный цвет для градиентов",
    preview: "gradientEnd",
  },
  // Скроллбар
  scrollbarThumb: {
    name: "Ползунок скролла",
    description: "Цвет ползунка полосы прокрутки",
    preview: "scrollbarThumb",
  },
  scrollbarTrack: {
    name: "Дорожка скролла",
    description: "Цвет дорожки полосы прокрутки",
    preview: "scrollbarTrack",
  },
  // Эффекты
  cardShadow: {
    name: "Тень карточки",
    description: "Цвет и прозрачность тени карточек",
    preview: "cardShadow",
  },
};

export default function ThemeSettingsPage() {
  const {
    selectedPreset,
    presets = [],
    currentTheme,
    customColors,
    customFonts,
    density,
    densities = [],
    darkMode,
    colorGroups,
    fontPresets = [],
    loading,
    updatePreset,
    updateColor,
    updateFont,
    updateDensity,
    toggleDarkMode,
    resetCustomColors,
    resetCustomFonts,
  } = useTheme();

  const [expandedGroup, setExpandedGroup] = useState("main");
  const [hoveredColor, setHoveredColor] = useState(null);

  const colorLabels = {
    primary: "Основной",
    secondary: "Вторичный",
    accent: "Акцент",
    background: "Фон страницы",
    backgroundSecondary: "Фон вторичный",
    surface: "Фон карточек",
    surfaceElevated: "Фон приподнятый",
    text: "Текст основной",
    textSecondary: "Текст вторичный",
    textMuted: "Текст приглушённый",
    border: "Граница",
    borderLight: "Граница светлая",
    borderDark: "Граница тёмная",
    success: "Успех",
    successLight: "Успех светлый",
    error: "Ошибка",
    errorLight: "Ошибка светлая",
    warning: "Предупреждение",
    warningLight: "Предупреждение светлое",
    info: "Инфо",
    infoLight: "Инфо светлое",
    headerBackground: "Хедер фон",
    headerText: "Хедер текст",
    buttonPrimaryBg: "Кнопка основная фон",
    buttonPrimaryText: "Кнопка основная текст",
    buttonSecondaryBg: "Кнопка вторичная фон",
    buttonSecondaryText: "Кнопка вторичная текст",
    cardBackground: "Карточка фон",
    linkColor: "Ссылка цвет",
    linkHover: "Ссылка при наведении",
    gradientStart: "Градиент начало",
    gradientEnd: "Градиент конец",
    scrollbarThumb: "Скролл ползунок",
    scrollbarTrack: "Скролл дорожка",
    cardShadow: "Тень карточки",
  };

  if (loading) {
    return (
      <div className="theme-settings-loading-container">
        <div className="theme-settings-loading">Загрузка настроек...</div>
      </div>
    );
  }

  return (
    <PageShell currentTheme={currentTheme}>
      <style>{toggleStyles.replace("#667eea", currentTheme.primary)}</style>
      
      {/* Заголовок страницы */}
      <div className="page-header-section" style={{ marginBottom: "24px" }}>
        <h1 className="page-title" style={{ color: currentTheme.text }}>
          <FontAwesomeIcon icon={faPalette} style={{ marginRight: "8px", color: currentTheme.primary }} />
          Настройки темы
        </h1>
      </div>

      <div className="theme-settings-container">
        <div className="theme-settings-content">
          {/* Левая колонка - Настройки */}
          <div className="theme-settings-column">
            {/* Секция 1: Пресеты тем */}
            <section className="theme-section">
              <div className="theme-section-header">
                <h2 className="theme-section-title">
                  <FontAwesomeIcon icon={faSliders} style={{ marginRight: "8px" }} />
                  Готовые пресеты
                </h2>
                <button
                  onClick={toggleDarkMode}
                  className="theme-dark-mode-toggle"
                  title={darkMode ? "Включить светлую тему" : "Включить тёмную тему"}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'transparent',
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '20px',
                    padding: '4px 12px',
                    cursor: 'pointer',
                    color: currentTheme.text,
                    fontSize: '14px'
                  }}
                >
                  <FontAwesomeIcon 
                    icon={darkMode ? faMoon : faSun} 
                    style={{ marginRight: '6px' }}
                  />
                  <div 
                    className={`theme-toggle-switch`}
                    style={{
                      width: '36px',
                      height: '20px',
                      background: darkMode ? currentTheme.primary : currentTheme.border,
                      borderRadius: '10px',
                      position: 'relative',
                      transition: 'background 0.3s'
                    }}
                  >
                    <div 
                      className="theme-toggle-ball"
                      style={{
                        width: '16px',
                        height: '16px',
                        background: '#fff',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        left: darkMode ? '18px' : '2px',
                        transition: 'left 0.3s'
                      }}
                    ></div>
                  </div>
                </button>
              </div>
              
              <div className="theme-presets-grid theme-presets-grid-compact">
                {presets && typeof presets === 'object' && Object.entries(presets).map(([key, preset]) => (
                  <div
                    key={key}
                    className={`theme-preset-card ${selectedPreset === key ? 'active' : ''}`}
                    onClick={() => updatePreset(key)}
                  >
                    <div 
                      className="theme-preset-preview"
                      style={{
                        background: `linear-gradient(135deg, ${preset.colors.primary}, ${preset.colors.secondary})`
                      }}
                    />
                    <h3 className="theme-preset-name">{preset.name || key}</h3>
                  </div>
                ))}
              </div>
            </section>
          </div>
          
          {/* Правая колонка - Предпросмотр */}
          <div className="theme-preview-column">
            <ColorPreviewWindow />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
