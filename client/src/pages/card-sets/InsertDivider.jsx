import React from "react";
import { useDndContext } from "@dnd-kit/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "../../utils/icons";

/**
 * InsertDivider — зона для вставки карточки между двумя карточками.
 *
 * Внутри DndContext с помощью useDndContext отслеживает, идёт ли drag.
 * Если drag активен — hover-эффекты отключены, но место сохраняется.
 */
export default function InsertDivider({ onClick, currentTheme }) {
  const { active } = useDndContext();
  const isDragging = active != null;

  return (
    <div
      className="insert-divider"
      style={{
        ...styles.container,
        pointerEvents: isDragging ? "none" : "auto",
      }}
      onMouseEnter={(e) => {
        if (isDragging) return;
        const ring = e.currentTarget.querySelector(".insert-ring");
        const icon = e.currentTarget.querySelector(".insert-icon");
        if (ring) {
          ring.style.opacity = "1";
          ring.style.transform = "scale(1)";
          ring.style.borderColor = currentTheme.primary;
          ring.style.background = `${currentTheme.primary}15`;
        }
        if (icon) {
          icon.style.color = currentTheme.primary;
        }
      }}
      onMouseLeave={(e) => {
        if (isDragging) return;
        const ring = e.currentTarget.querySelector(".insert-ring");
        const icon = e.currentTarget.querySelector(".insert-icon");
        if (ring) {
          ring.style.opacity = "0";
          ring.style.transform = "scale(0.5)";
        }
        if (icon) {
          icon.style.color = "transparent";
        }
      }}
      onClick={onClick}
    >
      <span
        className="insert-ring"
        style={{
          opacity: 0,
          transform: "scale(0.5)",
          transition:
            "opacity 0.2s ease, transform 0.2s ease, border-color 0.2s ease, background 0.2s ease",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          border: "2px solid transparent",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FontAwesomeIcon
          className="insert-icon"
          icon={faPlus}
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "transparent",
            transition: "color 0.2s ease",
          }}
        />
      </span>
    </div>
  );
}

const styles = {
  container: {
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    borderRadius: "8px",
    margin: "0 40px",
    background: "transparent",
    position: "relative",
  },
};
