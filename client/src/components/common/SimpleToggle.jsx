import React from "react";

/**
 * Простой переключатель без иконок — только pill с кругляшом
 * Поддерживает тему через currentTheme
 */
export default function SimpleToggle({
  checked,
  onChange,
  label,
  id,
  disabled = false,
  currentTheme, // Добавлен параметр темы
}) {
  const th = currentTheme;

  return (
    <div style={styles.container}>
      {label && (
        <label
          htmlFor={id}
          style={{
            ...styles.label,
            opacity: disabled ? 0.5 : 1,
            color: th ? th.text : undefined,
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          ...styles.toggle,
          background: checked 
            ? (th?.primary || "#667eea") 
            : (th?.border || "#e0e0e0"),
          ...(disabled ? styles.toggleDisabled : {}),
        }}
        onClick={() => !disabled && onChange(!checked)}
      >
        <div
          style={{
            ...styles.thumb,
            ...(checked ? styles.thumbChecked : {}),
          }}
        />
      </div>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={styles.hiddenInput}
        disabled={disabled}
      />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  label: {
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    userSelect: "none",
  },
  toggle: {
    position: "relative",
    width: "52px",
    height: "28px",
    borderRadius: "14px",
    cursor: "pointer",
    transition: "background 0.2s ease",
    boxSizing: "border-box",
    border: "2px solid transparent",
  },
  toggleDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  thumb: {
    position: "absolute",
    width: "20px",
    height: "20px",
    background: "var(--nt-surface, #ffffff)",
    borderRadius: "50%",
    left: "2px",
    top: "2px",
    transition: "transform 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
    transform: "translateX(0)",
  },
  thumbChecked: {
    transform: "translateX(24px)",
  },
  hiddenInput: {
    position: "absolute",
    width: "1px",
    height: "1px",
    opacity: 0,
    pointerEvents: "none",
  },
};
