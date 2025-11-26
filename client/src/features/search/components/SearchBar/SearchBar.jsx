import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import "./SearchBar.css";

const SearchBar = ({ onSearch }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");

  // Используем useCallback для стабильной ссылки onSearch
  const stableOnSearch = useCallback(onSearch, []);

  useEffect(() => {
    if (query.trim() === "") {
      stableOnSearch("");
      return;
    }

    const timeoutId = setTimeout(() => {
      stableOnSearch(query.trim());
    }, 300); // Задержка 300мс для дебаунсинга

    return () => clearTimeout(timeoutId);
  }, [query, stableOnSearch]);

  const handleClear = () => {
    setQuery("");
    stableOnSearch(""); // Явно очищаем поиск
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className="search-bar">
      <div className="search-input-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={t("search.placeholder")}
          className="search-input"
        />
        {query && (
          <button
            type="button"
            className="btn-tp7"
            onClick={handleClear}
            title="Очистить поиск"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
