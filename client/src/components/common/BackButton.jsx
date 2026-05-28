import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "../../utils/icons";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Кнопка "Назад" с автоматическим переходом на предыдущую страницу
 */
export default function BackButton({
  defaultTo = "/dashboard",
  text = "Назад",
  style = {},
}) {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(defaultTo);
    }
  };

  return (
    <button
      onClick={handleBack}
      style={{
        ...styles.button,
        background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
        ...style,
      }}
    >
      <FontAwesomeIcon icon={faArrowLeft} style={styles.icon} />
      {text}
    </button>
  );
}

const styles = {
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "var(--nt-card-shadow, 0 2px 8px rgba(0,0,0,0.2))",
  },
  icon: {
    fontSize: "14px",
  },
};
