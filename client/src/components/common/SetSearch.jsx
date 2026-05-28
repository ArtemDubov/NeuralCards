import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faXmark } from "../../utils/icons";

/**
 * Поисковик по наборам с автоподсказками в стиле Google.
 * При вводе текста показывает выпадающий список с подсказками.
 * Совпадения подсвечиваются жирным.
 */
export default function SetSearch({
  sets = [],
  onSelect,
  onQueryChange,
  currentTheme,
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Фильтрация наборов по запросу
  const filteredSets = query.trim()
    ? sets.filter(
        (set) =>
          set.title.toLowerCase().includes(query.toLowerCase()) ||
          (set.description &&
            set.description.toLowerCase().includes(query.toLowerCase())),
      )
    : [];

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Навигация клавишами
  const handleKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        Math.min(prev + 1, filteredSets.length - 1),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredSets[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (set) => {
    onSelect(set);
    setQuery("");
    if (onQueryChange) onQueryChange("");
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Подсветка совпадений
  const highlightText = (text, search) => {
    if (!search.trim()) return text;
    const idx = text.toLowerCase().indexOf(search.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <strong style={{ fontWeight: 700 }}>
          {text.slice(idx, idx + search.length)}
        </strong>
        {text.slice(idx + search.length)}
      </>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.inputWrapper}>
        <FontAwesomeIcon icon={faSearch} style={styles.searchIcon} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (onQueryChange) onQueryChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Поиск наборов..."
          style={{
            ...styles.input,
            background: currentTheme?.surface || "#fff",
            color: currentTheme?.text || "#333",
            borderColor: isOpen
              ? currentTheme?.primary || "#3498db"
              : currentTheme?.border || "#ddd",
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              if (onQueryChange) onQueryChange("");
              setIsOpen(false);
              setHighlightedIndex(-1);
            }}
            style={styles.clearBtn}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}
      </div>

      {/* Выпадающий список подсказок */}
      {isOpen && query.trim() && (
        <div
          ref={dropdownRef}
          style={{
            ...styles.dropdown,
            background: currentTheme?.surface || "#fff",
            borderColor: currentTheme?.border || "#ddd",
            boxShadow: `0 4px 16px ${currentTheme?.cardShadow || "rgba(0,0,0,0.15)"}`,
          }}
        >
          {filteredSets.length === 0 ? (
            <div
              style={{
                ...styles.noResults,
                color: currentTheme?.textMuted || "#999",
              }}
            >
              Ничего не найдено
            </div>
          ) : (
            filteredSets.slice(0, 8).map((set, index) => (
              <div
                key={set.id}
                onClick={() => handleSelect(set)}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  ...styles.dropdownItem,
                  background:
                    index === highlightedIndex
                      ? `${currentTheme?.primary || "#3498db"}15`
                      : "transparent",
                  color: currentTheme?.text || "#333",
                }}
              >
                <div style={styles.dropdownItemTitle}>
                  {highlightText(set.title, query)}
                </div>
                {set.description && (
                  <div style={styles.dropdownItemDesc}>
                    {highlightText(set.description, query)}
                  </div>
                )}
                <div style={styles.dropdownItemMeta}>
                  {set.cards?.length || 0} карточек
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    width: "100%",
    maxWidth: "600px",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    fontSize: "14px",
    color: "#999",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "10px 36px 10px 36px",
    border: "2px solid",
    borderRadius: "24px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  clearBtn: {
    position: "absolute",
    right: "10px",
    width: "24px",
    height: "24px",
    border: "none",
    borderRadius: "50%",
    background: "rgba(0,0,0,0.08)",
    color: "#666",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    border: "1px solid",
    borderRadius: "12px",
    zIndex: 1000,
    maxHeight: "280px",
    overflowY: "auto",
  },
  dropdownItem: {
    padding: "8px 12px",
    cursor: "pointer",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    transition: "background 0.15s",
  },
  dropdownItemTitle: {
    fontSize: "13px",
    fontWeight: 500,
  },
  dropdownItemDesc: {
    fontSize: "11px",
    color: "#666",
    marginTop: "2px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  dropdownItemMeta: {
    fontSize: "10px",
    color: "#999",
    marginTop: "2px",
  },
  noResults: {
    padding: "12px",
    textAlign: "center",
    fontSize: "13px",
  },
};
