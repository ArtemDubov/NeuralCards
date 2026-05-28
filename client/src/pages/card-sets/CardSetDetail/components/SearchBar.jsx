import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSliders, faTimes } from "../../../../utils/icons";

/**
 * Компонент поисковой панели с фильтрами
 * @param {object} props
 * @param {string} props.searchQuery - текущий поисковый запрос
 * @param {function} props.setSearchQuery - функция обновления запроса
 * @param {object} props.searchFilters - настройки поиска
 * @param {function} props.setSearchFilters - функция обновления настроек
 * @param {boolean} props.showSearchFilters - показывать ли модалку фильтров
 * @param {function} props.setShowSearchFilters - функция переключения модалки
 * @param {number} props.filteredCount - количество найденных карточек
 * @param {number} props.totalCount - общее количество карточек
 * @param {object} props.currentTheme - текущая тема
 */
export default function SearchBar({
  searchQuery,
  setSearchQuery,
  searchFilters,
  setSearchFilters,
  showSearchFilters,
  setShowSearchFilters,
  filteredCount,
  totalCount,
  currentTheme,
}) {
  return (
    <div className="card-set-search-wrapper">
      {/* Контейнер для поля ввода с иконками */}
      <div className="card-set-search-input-container">
        {/* Лупа слева - всегда цвет primary */}
        <FontAwesomeIcon 
          icon={faSearch} 
          className="card-set-search-icon"
          style={{ color: currentTheme.primary }}
        />
        
        {/* Поле ввода - рамка всегда color primary */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск..."
          className="card-set-search-input"
          style={{
            borderColor: currentTheme.primary, // Всегда primary
          }}
        />
        
        {/* Кнопка настроек поиска — всегда orange/primary */}
        <button
          data-search-filter-btn="true"
          onClick={() => setShowSearchFilters(!showSearchFilters)}
          className="card-set-search-filter-btn"
          style={{
            background:
              searchFilters.wholeWords || searchFilters.caseSensitive
                ? `${currentTheme.primary}20`
                : "transparent",
            color: currentTheme.primary, // Всегда primary
          }}
          title="Настройки поиска"
        >
          <FontAwesomeIcon icon={faSliders} />
        </button>
        
        {/* Крестик очистки — всегда orange/primary */}
        <button
          onClick={() => {
            setSearchQuery("");
            setShowSearchFilters(false);
          }}
          className="card-set-search-clear-btn"
          style={{
            color: currentTheme.primary, // Всегда primary
            opacity: searchQuery ? 1 : 0.4,
            cursor: searchQuery ? "pointer" : "default",
          }}
          title="Очистить поиск"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      
      {/* Счётчик найденных — под поисковиком */}
      {searchQuery && (
        <div className="card-set-search-result-count-wrapper">
          <span 
            className="card-set-search-result-count"
            style={{
              color: currentTheme.textMuted,
            }}
          >
            Найдено: {filteredCount} из {totalCount}
          </span>
        </div>
      )}
    </div>
  );
}
