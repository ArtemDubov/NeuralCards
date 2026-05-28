import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faUpload, faPlus } from "../../../utils/icons";

/**
 * Header Actions Component - title and action buttons
 */
const HeaderActions = React.memo(function HeaderActions({
  onImport,
  onCreate,
  currentTheme,
}) {
  return (
    <div className="card-sets-header-actions">
      <h1 className="card-sets-title" style={{ color: currentTheme.text }}>
        <FontAwesomeIcon icon={faBook} style={{ marginRight: "8px" }} />
        Мои наборы
      </h1>
      <div className="card-sets-header-buttons">
        <button
          onClick={onImport}
          className="card-sets-import-button"
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: "10px",
            color: "white",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            background: "var(--nt-success)",
            transition: "all 0.2s",
          }}
        >
          <FontAwesomeIcon icon={faUpload} style={{ marginRight: "6px" }} />
          Импорт
        </button>
        <button
          onClick={onCreate}
          className="card-sets-create-button"
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: "10px",
            color: "white",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            background: `linear-gradient(135deg, var(--nt-primary), var(--nt-secondary))`,
            transition: "all 0.2s",
          }}
        >
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: "6px" }} />
          Создать набор
        </button>
      </div>
    </div>
  );
});

export default HeaderActions;
