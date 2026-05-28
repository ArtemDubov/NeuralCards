import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faThLarge } from "../../../../utils/icons";

/**
 * Компонент переключения режима отображения (список/плитка)
 * @param {object} props
 * @param {string} props.viewMode - текущий режим ('list' или 'grid')
 * @param {function} props.setViewMode - функция переключения режима
 * @param {object} props.currentTheme - текущая тема
 */
export default function ViewModeToggle({ viewMode, setViewMode, currentTheme }) {
  return (
    <div className="card-set-view-mode-toggle">
      <button
        onClick={() => setViewMode("list")}
        className={`card-set-view-mode-button ${viewMode === "list" ? "active" : ""}`}
        style={{
          background: viewMode === "list" ? currentTheme.primary : "transparent",
          color: viewMode === "list" ? "white" : currentTheme.textSecondary,
        }}
        title="Список"
      >
        <FontAwesomeIcon icon={faList} />
      </button>
      
      <div className="card-set-view-mode-divider" />
      
      <button
        onClick={() => setViewMode("grid")}
        className={`card-set-view-mode-button ${viewMode === "grid" ? "active" : ""}`}
        style={{
          background: viewMode === "grid" ? currentTheme.primary : "transparent",
          color: viewMode === "grid" ? "white" : currentTheme.textSecondary,
        }}
        title="Плитка"
      >
        <FontAwesomeIcon icon={faThLarge} />
      </button>
    </div>
  );
}
