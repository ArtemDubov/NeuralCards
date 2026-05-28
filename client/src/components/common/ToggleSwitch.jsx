import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "../../utils/icons";

/**
 * Универсальный переключатель в виде таблетки с плавающим кругляшом
 * Используется для всех чекбоксов на сайте
 */
export default function ToggleSwitch({
  checked,
  onChange,
  label,
  id,
  disabled = false,
}) {
  return (
    <div style={styles.container}>
      {label && (
        <label
          htmlFor={id}
          style={{
            ...styles.label,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          ...styles.toggle,
          ...(checked ? styles.toggleChecked : {}),
          ...(disabled ? styles.toggleDisabled : {}),
        }}
        onClick={() => !disabled && onChange(!checked)}
      >
        <div
          style={{
            ...styles.icon,
            ...styles.iconMoon,
            opacity: checked ? 1 : 0.4,
          }}
        >
          <FontAwesomeIcon icon={faMoon} />
        </div>
        <div
          style={{
            ...styles.icon,
            ...styles.iconSun,
            opacity: checked ? 0.4 : 1,
          }}
        >
          <FontAwesomeIcon icon={faSun} />
        </div>
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
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    userSelect: "none",
  },
  toggle: {
    position: "relative",
    width: "64px",
    height: "32px",
    background: "var(--nt-border-light, #e0e0e0)",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "background 0.3s ease",
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    boxSizing: "border-box",
  },
  toggleChecked: {
    background: "linear-gradient(135deg, var(--nt-primary) 0%, var(--nt-secondary) 100%)",
  },
  toggleDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  thumb: {
    position: "absolute",
    width: "24px",
    height: "24px",
    background: "var(--nt-surface, #ffffff)",
    borderRadius: "50%",
    left: "4px",
    top: "4px",
    transition: "transform 0.3s ease",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    transform: "translateX(0)",
  },
  thumbChecked: {
    transform: "translateX(32px)",
  },
  icon: {
    position: "absolute",
    fontSize: "14px",
    transition: "opacity 0.3s ease",
    zIndex: 1,
  },
  iconMoon: {
    left: "8px",
    color: "var(--nt-primary)",
  },
  iconSun: {
    right: "8px",
    color: "var(--nt-warning)",
  },
  hiddenInput: {
    position: "absolute",
    width: "1px",
    height: "1px",
    opacity: 0,
    pointerEvents: "none",
  },
};
