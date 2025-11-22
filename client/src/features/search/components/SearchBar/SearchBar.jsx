import React, { useState, useEffect } from "react";
import "./SearchBar.css";

const SearchBar = ({
  onSearch,
  placeholder = "Поиск наборов и карточек...",
}) => {
  const [query, setQuery] = useState("");

  // Автопоиск при изменении запроса (с задержкой)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query.trim());
    }, 300); // Задержка 300мс

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery("");
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
          placeholder={placeholder}
          className="search-input"
        />
        {query && (
          <button
            type="button"
            className="clear-search-btn"
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
