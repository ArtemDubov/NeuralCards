import React from 'react';

/**
 * Модальное окно настроек поиска
 * @param {object} props
 * @param {boolean} props.show - показывать ли модалку
 * @param {object} props.searchFilters - текущие настройки поиска
 * @param {function} props.setSearchFilters - функция обновления настроек
 * @param {object} props.currentTheme - текущая тема
 */
export default function SearchFiltersModal({
  show,
  searchFilters,
  setSearchFilters,
  currentTheme,
}) {
  if (!show) return null;

  return (
    <div
      data-search-filters-modal="true"
      className="card-set-search-filters-modal"
      style={{
        background: currentTheme.surface,
        border: `1px solid ${currentTheme.border || "#e0e0e0"}`,
      }}
    >
      <div className="card-set-search-filter-title">Настройки поиска</div>
      
      <label className="card-set-search-filter-option">
        <input
          type="checkbox"
          checked={searchFilters.wholeWords}
          onChange={(e) =>
            setSearchFilters((prev) => ({
              ...prev,
              wholeWords: e.target.checked,
            }))
          }
        />
        <span>Только целые слова</span>
      </label>
      
      <label className="card-set-search-filter-option">
        <input
          type="checkbox"
          checked={searchFilters.caseSensitive}
          onChange={(e) =>
            setSearchFilters((prev) => ({
              ...prev,
              caseSensitive: e.target.checked,
            }))
          }
        />
        <span>Учитывать регистр</span>
      </label>
      
      <div className="card-set-search-filter-divider" />
      
      <label className="card-set-search-filter-option">
        <input
          type="checkbox"
          checked={searchFilters.searchFront}
          onChange={(e) =>
            setSearchFilters((prev) => ({
              ...prev,
              searchFront: e.target.checked,
            }))
          }
        />
        <span>Лицевая сторона</span>
      </label>
      
      <label className="card-set-search-filter-option">
        <input
          type="checkbox"
          checked={searchFilters.searchBack}
          onChange={(e) =>
            setSearchFilters((prev) => ({
              ...prev,
              searchBack: e.target.checked,
            }))
          }
        />
        <span>Обратная сторона</span>
      </label>
      
      {/* Кнопка сброса */}
      <button
        onClick={() => {
          setSearchFilters({
            wholeWords: false,
            caseSensitive: false,
            searchBack: true,
            searchFront: true,
          });
        }}
        className="card-set-search-filter-reset-btn"
      >
        Сбросить
      </button>
    </div>
  );
}
