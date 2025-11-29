import React from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import SearchBar from "../../../search/components/SearchBar/SearchBar";

const Navigation = ({ activeTab, setActiveTab, onSearch }) => {
  const { t } = useLanguage();

  // ДОБАВИТЬ ОТЛАДКУ ПЕРЕД tabs
  console.log("=== NAVIGATION ===");
  console.log("activeTab:", activeTab);

  const tabs = [
    { id: "sets", label: t("navigation.sets") },
    { id: "favorites", label: t("navigation.favorites.with_icon") },
    { id: "training", label: t("navigation.training") },
  ];

  console.log("tabs:", tabs);

  return (
    <div className="nav-container">
      <nav className="nav-buttons">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`btn-tp2 ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => {
              console.log("Клик по табу:", tab.id);
              setActiveTab(tab.id);
            }}
          >
            {tab.label}
          </button>
        ))}
        <div className="search-inline">
          <SearchBar onSearch={onSearch} />
        </div>
      </nav>
    </div>
  );
};

export default Navigation;
