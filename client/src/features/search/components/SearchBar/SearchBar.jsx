// features/search/components/SearchBar/SearchBar.jsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import "./SearchBar.css";

const SearchBar = ({ onSearch, initialValue = "", autoFocus = false }) => {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // 🎯 Обработчик изменения input
  const handleInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      setInputValue(value);
      onSearch(value);
    },
    [onSearch]
  );

  // 🎯 Очистка поиска
  const handleClear = useCallback(() => {
    setInputValue("");
    onSearch("");
    inputRef.current?.focus();
  }, [onSearch]);

  // 🎯 Обработчик специальных клавиш
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        handleClear();
      }
    },
    [handleClear]
  );

  // 🎯 Сабмит формы (предотвращаем дефолтное поведение)
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    // Фокус остается в поле, поиск уже работает через onChange
  }, []);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <div className={`search-bar ${isFocused ? "search-bar--focused" : ""}`}>
      <form onSubmit={handleSubmit} className="search-bar__form">
        <div className="search-bar__input-wrapper">
          <span className="search-bar__icon">🔍</span>

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={
              t("search.placeholder") || "Поиск наборов и карточек..."
            }
            className="search-bar__input"
            aria-label="Поиск"
          />

          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="search-bar__clear"
              aria-label="Очистить поиск"
            >
              ✕
            </button>
          )}
        </div>
      </form>

      {/* Подсказка при фокусе */}
      {isFocused && (
        <div className="search-bar__hint">
          {t("search.hint") || "Введите минимум 2 символа для поиска"}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
