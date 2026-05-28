import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "../../../utils/icons";

/**
 * Search Bar Component for Card Sets
 */
const SearchBar = React.memo(function SearchBar({
  searchQuery,
  setSearchQuery,
  currentTheme,
}) {
  return (
    <div className="card-sets-search-container" style={{ 
      marginBottom: "24px", 
      position: "relative" 
    }}>
      <input
        type="text"
        placeholder="Поиск наборов..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="card-sets-search-input"
        style={{
          width: "100%",
          padding: "8px 10px 8px 36px",
          border: `1px solid var(--nt-border)`,
          borderRadius: "8px",
          fontSize: "14px",
          outline: "none",
          background: "var(--nt-surface)",
          color: "var(--nt-text)",
          transition: "border-color 0.2s",
        }}
      />
      <FontAwesomeIcon
        icon={faSearch}
        className="card-sets-search-icon"
        style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--nt-text-muted)",
        }}
      />
    </div>
  );
});

export default SearchBar;
