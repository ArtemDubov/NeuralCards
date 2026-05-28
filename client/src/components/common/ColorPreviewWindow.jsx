import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "../../contexts/ThemeContext";
import {
  faGraduationCap,
  faUser,
  faBullseye,
  faBook,
  faRotateRight,
  faFire,
  faPalette,
  faCheck,
  faXmark,
  faTriangleExclamation,
  faCircleInfo,
  faEye,
} from "../../utils/icons";

// Описания для каждого цвета (импортируем из ThemeSettingsPage или создаём здесь)
const COLOR_DESCRIPTIONS = {
  // Основные цвета
  primary: { name: "Основной цвет", description: "Кнопки, ссылки, акценты, хедер" },
  secondary: { name: "Вторичный цвет", description: "Градиенты, ховеры, дополнительные элементы" },
  accent: { name: "Акцентный цвет", description: "Яркие акценты, уведомления, бейджи" },
  // Фоны
  background: { name: "Фон страницы", description: "Основной фон всей страницы" },
  backgroundSecondary: { name: "Вторичный фон", description: "Фон для карточек статистики" },
  surface: { name: "Фон карточек", description: "Фон карточек, панелей, модальных окон" },
  surfaceElevated: { name: "Приподнятый фон", description: "Фон для выпадающих меню, тултипов" },
  // Текст
  text: { name: "Основной текст", description: "Заголовки, основной текст контента" },
  textSecondary: { name: "Вторичный текст", description: "Описания, подписи, мета-информация" },
  textMuted: { name: "Приглушённый текст", description: "Неактивный текст, плейсхолдеры" },
  // Границы
  border: { name: "Основная граница", description: "Границы полей ввода, карточек, кнопок" },
  borderLight: { name: "Светлая граница", description: "Лёгкие разделители, ховеры" },
  borderDark: { name: "Тёмная граница", description: "Акцентные границы, активные элементы" },
  // Семантика
  success: { name: "Успех", description: "Зелёный цвет для успешных действий" },
  error: { name: "Ошибка", description: "Красный цвет для ошибок, удаления" },
  warning: { name: "Предупреждение", description: "Оранжевый цвет для предупреждений" },
  info: { name: "Информация", description: "Синий цвет для информационных сообщений" },
  // Компоненты
  headerBackground: { name: "Фон хедера", description: "Фон верхней панели навигации" },
  headerText: { name: "Текст хедера", description: "Текст в верхней панели" },
  buttonPrimaryBg: { name: "Фон основной кнопки", description: "Фон для главных кнопок действия" },
  buttonPrimaryText: { name: "Текст основной кнопки", description: "Текст на главных кнопках" },
  buttonSecondaryBg: { name: "Фон вторичной кнопки", description: "Фон для второстепенных кнопок" },
  buttonSecondaryText: { name: "Текст вторичной кнопки", description: "Текст на второстепенных кнопках" },
  cardBackground: { name: "Фон карточки", description: "Фон для карточек контента" },
  linkColor: { name: "Цвет ссылки", description: "Цвет ссылок по умолчанию" },
  linkHover: { name: "Цвет ссылки (ховер)", description: "Цвет ссылок при наведении" },
  gradientStart: { name: "Начало градиента", description: "Начальный цвет для градиентов" },
  gradientEnd: { name: "Конец градиента", description: "Конечный цвет для градиентов" },
  scrollbarThumb: { name: "Ползунок скролла", description: "Цвет ползунка полосы прокрутки" },
  scrollbarTrack: { name: "Дорожка скролла", description: "Цвет дорожки полосы прокрутки" },
  cardShadow: { name: "Тень карточки", description: "Цвет и прозрачность тени карточек" },
};

/**
 * Окно предпросмотра темы в реальном времени.
 * Показывает миниатюру интерфейса с текущими цветами.
 */
export default function ColorPreviewWindow() {
  const { currentTheme, updateColor } = useTheme();
  const [selectedColorKey, setSelectedColorKey] = useState(null);
  const [hoveredSwatch, setHoveredSwatch] = useState(null);

  return (
    <div
      style={{
        ...styles.previewContainer,
        background: currentTheme.background,
      }}
    >
      <div style={styles.previewHeader}>
        <p style={{ ...styles.previewTitle, color: currentTheme.text }}>
          <FontAwesomeIcon icon={faEye} style={{ marginRight: '8px' }} />
          Предпросмотр
        </p>
      </div>

      {/* Миниатюра хедера */}
      <div
        style={{
          ...styles.previewHeaderBar,
          background: `linear-gradient(135deg, ${currentTheme.gradientStart}, ${currentTheme.gradientEnd})`,
        }}
      >
        <div style={styles.previewLogo}>
          <FontAwesomeIcon
            icon={faGraduationCap}
            style={{ marginRight: "6px" }}
          />
          NeuralCards
        </div>
        <div style={styles.previewUser}>
          <FontAwesomeIcon icon={faUser} style={{ marginRight: "4px" }} />
          Пользователь
        </div>
      </div>

      {/* Миниатюра контента */}
      <div
        style={{ ...styles.previewContent, background: currentTheme.surface }}
      >
        {/* Быстрые действия */}
        <div style={styles.previewQuickActions}>
          <div
            style={{
              ...styles.previewAction,
              background: currentTheme.cardBackground,
              border: `1px solid ${currentTheme.border}`,
            }}
          >
            <FontAwesomeIcon icon={faBullseye} />
          </div>
          <div
            style={{
              ...styles.previewAction,
              background: currentTheme.cardBackground,
              border: `1px solid ${currentTheme.border}`,
            }}
          >
            <FontAwesomeIcon icon={faBook} />
          </div>
          <div
            style={{
              ...styles.previewAction,
              background: currentTheme.cardBackground,
              border: `1px solid ${currentTheme.border}`,
            }}
          >
            <FontAwesomeIcon icon={faRotateRight} />
          </div>
        </div>

        {/* Статистика */}
        <div style={styles.previewStats}>
          <div
            style={{
              ...styles.previewStat,
              background: currentTheme.backgroundSecondary,
            }}
          >
            <div
              style={{
                ...styles.previewStatValue,
                color: currentTheme.primary,
              }}
            >
              99
            </div>
            <div
              style={{
                ...styles.previewStatLabel,
                color: currentTheme.textSecondary,
              }}
            >
              Карточек
            </div>
          </div>
          <div
            style={{
              ...styles.previewStat,
              background: currentTheme.backgroundSecondary,
            }}
          >
            <div
              style={{
                ...styles.previewStatValue,
                color: currentTheme.primary,
              }}
            >
              15
            </div>
            <div
              style={{
                ...styles.previewStatLabel,
                color: currentTheme.textSecondary,
              }}
            >
              Минут
            </div>
          </div>
          <div
            style={{
              ...styles.previewStat,
              background: currentTheme.backgroundSecondary,
            }}
          >
            <div
              style={{
                ...styles.previewStatValue,
                color: currentTheme.primary,
              }}
            >
              3<FontAwesomeIcon icon={faFire} style={{ fontSize: "12px" }} />
            </div>
            <div
              style={{
                ...styles.previewStatLabel,
                color: currentTheme.textSecondary,
              }}
            >
              Дней
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div style={styles.previewButtons}>
          <button
            style={{
              ...styles.previewButtonPrimary,
              background: currentTheme.buttonPrimaryBg,
              color: currentTheme.buttonPrimaryText,
            }}
          >
            Основная кнопка
          </button>
          <button
            style={{
              ...styles.previewButtonSecondary,
              background: currentTheme.buttonSecondaryBg,
              color: currentTheme.buttonSecondaryText,
            }}
          >
            Вторичная
          </button>
        </div>

        {/* Семантические цвета */}
        <div style={styles.previewSemantic}>
          <div
            style={{
              ...styles.previewBadge,
              background: currentTheme.success,
              color: "#fff",
            }}
          >
            <FontAwesomeIcon icon={faCheck} style={{ marginRight: "4px" }} />
            Успех
          </div>
          <div
            style={{
              ...styles.previewBadge,
              background: currentTheme.error,
              color: "#fff",
            }}
          >
            <FontAwesomeIcon icon={faXmark} style={{ marginRight: "4px" }} />
            Ошибка
          </div>
          <div
            style={{
              ...styles.previewBadge,
              background: currentTheme.warning,
              color: "#fff",
            }}
          >
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              style={{ marginRight: "4px" }}
            />
            Пред
          </div>
          <div
            style={{
              ...styles.previewBadge,
              background: currentTheme.info,
              color: "#fff",
            }}
          >
            <FontAwesomeIcon
              icon={faCircleInfo}
              style={{ marginRight: "4px" }}
            />
            Инфо
          </div>
        </div>

        {/* Ссылка */}
        <a
          href="#preview"
          onClick={(e) => e.preventDefault()}
          style={{
            ...styles.previewLink,
            color: currentTheme.linkColor,
          }}
        >
          Пример ссылки →
        </a>
      </div>

      {/* Палитра всех цветов */}
      <div style={styles.colorPalette}>
        <p
          style={{
            ...styles.paletteTitle,
            color: currentTheme.text,
            marginBottom: "12px",
          }}
        >
          <FontAwesomeIcon icon={faPalette} style={{ marginRight: "6px" }} />
          Активные цвета:
        </p>
        
        <div style={styles.colorSwatches}>
          {Object.entries(currentTheme).map(([key, value]) => {
            // Показываем только цветовые значения (HEX или RGB)
            if (
              typeof value === "string" &&
              (value.startsWith("#") || value.startsWith("rgb"))
            ) {
              const description = COLOR_DESCRIPTIONS[key];
              const isHovered = hoveredSwatch === key;
              const isSelected = selectedColorKey === key;
              
              return (
                <div
                  key={key}
                  style={{
                    ...styles.swatchContainer,
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColorKey(isSelected ? null : key);
                  }}
                  onMouseEnter={() => setHoveredSwatch(key)}
                  onMouseLeave={() => {
                    setHoveredSwatch(null);
                    if (!isSelected) setSelectedColorKey(null);
                  }}
                >
                  {/* Color Picker Popup при клике */}
                  {isSelected && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "calc(100% + 8px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        padding: "12px",
                        background: currentTheme.surfaceElevated,
                        border: `2px solid ${currentTheme.primary}`,
                        borderRadius: "8px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                        zIndex: 1000,
                        pointerEvents: "auto",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => updateColor(key, e.target.value)}
                        style={{
                          width: "150px",
                          height: "40px",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                        autoFocus
                      />
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "11px",
                          color: currentTheme.textSecondary,
                          textAlign: "center",
                          fontFamily: "monospace",
                        }}
                      >
                        {value}
                      </div>
                      {/* Стрелка popup */}
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          borderWidth: "8px",
                          borderStyle: "solid",
                          borderColor: `${currentTheme.primary} transparent transparent transparent`,
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Тултип при наведении (только если не выбран) */}
                  {isHovered && !isSelected && description && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        marginBottom: "8px",
                        padding: "8px 12px",
                        background: currentTheme.surfaceElevated,
                        border: `1px solid ${currentTheme.border}`,
                        borderRadius: "6px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        whiteSpace: "nowrap",
                        zIndex: 999,
                        pointerEvents: "none",
                      }}
                    >
                      <div style={{ fontWeight: "600", fontSize: "12px", color: currentTheme.text, marginBottom: "2px" }}>
                        {description.name}
                      </div>
                      <div style={{ fontSize: "11px", color: currentTheme.textSecondary }}>
                        {description.description}
                      </div>
                      <div style={{ fontSize: "10px", color: currentTheme.textMuted, marginTop: "4px", fontFamily: "monospace" }}>
                        {value}
                      </div>
                      {/* Стрелка тултипа */}
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          borderWidth: "6px",
                          borderStyle: "solid",
                          borderColor: `${currentTheme.border} transparent transparent transparent`,
                        }}
                      />
                    </div>
                  )}
                  
                  <div
                    style={{
                      ...styles.swatch,
                      background: value,
                      border: `3px solid ${isSelected ? currentTheme.primary : (isHovered ? currentTheme.primary : currentTheme.border)}`,
                      transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                      transform: isHovered || isSelected ? "scale(1.15)" : "scale(1)",
                      boxShadow: isSelected ? `0 0 12px ${currentTheme.primary}60` : "none",
                    }}
                  />
                  <span
                    style={{
                      ...styles.swatchLabel,
                      color: currentTheme.textSecondary,
                      fontSize: "10px",
                    }}
                  >
                    {key.substring(0, 2)}
                  </span>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  previewContainer: {
    position: "sticky",
    top: "20px",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "var(--nt-card-shadow, 0 4px 16px rgba(0,0,0,0.15))",
    maxHeight: "calc(100vh - 40px)",
    overflow: "auto",
  },
  previewHeader: {
    marginBottom: "16px",
  },
  previewTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "4px",
  },
  previewSubtitle: {
    fontSize: "13px",
  },
  previewHeaderBar: {
    padding: "12px 16px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  previewLogo: {
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
  },
  previewUser: {
    color: "#fff",
    fontSize: "12px",
    padding: "4px 8px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "4px",
  },
  previewContent: {
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  previewQuickActions: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
    marginBottom: "16px",
  },
  previewAction: {
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    borderRadius: "8px",
  },
  previewStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
    marginBottom: "16px",
  },
  previewStat: {
    padding: "12px 8px",
    borderRadius: "8px",
    textAlign: "center",
  },
  previewStatValue: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "4px",
  },
  previewStatLabel: {
    fontSize: "10px",
  },
  previewButtons: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
  },
  previewButtonPrimary: {
    flex: 1,
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "500",
    cursor: "pointer",
  },
  previewButtonSecondary: {
    flex: 1,
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "500",
    cursor: "pointer",
  },
  previewSemantic: {
    display: "flex",
    gap: "6px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  previewBadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "500",
  },
  previewLink: {
    fontSize: "12px",
    textDecoration: "none",
    fontWeight: "500",
  },
  colorPalette: {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid rgba(0,0,0,0.1)",
  },
  paletteTitle: {
    fontSize: "14px",
    fontWeight: "600",
  },
  colorSwatches: {
    display: "grid",
    gridTemplateColumns: "repeat(8, 1fr)",
    gap: "6px",
  },
  swatchContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  swatch: {
    width: "24px",
    height: "24px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "transform 0.1s",
  },
  swatchLabel: {
    fontSize: "9px",
    textTransform: "uppercase",
  },
};
