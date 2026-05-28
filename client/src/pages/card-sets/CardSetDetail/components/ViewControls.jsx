import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faThLarge, faEye, faEyeSlash } from "../../../../utils/icons";

/**
 * Компонент переключения режимов отображения и видимости контента
 * @param {object} props
 * @param {string} props.viewMode - текущий режим ('list' или 'grid')
 * @param {function} props.setViewMode - функция переключения режима
 * @param {boolean} props.showContent - показывать ли содержимое карточек
 * @param {function} props.setShowContent - функция переключения видимости
 * @param {object} props.currentTheme - текущая тема
 */
export default function ViewControls({ 
  viewMode, 
  setViewMode, 
  showContent, 
  setShowContent, 
  currentTheme 
}) {
  return (
    <div className="card-set-view-controls">
      {/* Переключатель список/плитка - одна кнопка */}
      <button
        onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
        className="card-set-view-toggle-btn"
        style={{
          background: currentTheme.primary,
          color: "white",
        }}
        title={viewMode === "list" ? "Переключить на плитку" : "Переключить на список"}
      >
        <FontAwesomeIcon icon={viewMode === "list" ? faList : faThLarge} />
      </button>
      
      <div className="card-set-view-divider" />
      
      {/* Кнопка глазика - показать/скрыть контент */}
      <button
        onClick={() => setShowContent(!showContent)}
        className="card-set-eye-toggle-btn"
        style={{
          background: showContent ? "var(--nt-success)" : currentTheme.textMuted,
          color: "white",
        }}
        title={showContent ? "Скрыть содержимое" : "Показать содержимое"}
      >
        <FontAwesomeIcon icon={showContent ? faEye : faEyeSlash} />
      </button>
    </div>
  );
}
