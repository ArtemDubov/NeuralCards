import React from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import SearchBar from "../../../search/components/SearchBar/SearchBar";
import "./Navigation.css";

const Navigation = ({ activeTab, setActiveTab, onSearch }) => {
  const { t } = useLanguage();

  const tabs = [
    { id: "sets", label: t("navigation.sets") },
    { id: "create", label: t("navigation.create") },
    { id: "training", label: t("navigation.training") },
    { id: "favorites", label: t("navigation.favorites") },
    { id: "profile", label: t("navigation.profile") },
  ];

  return (
    <div className="nav-container">
      <nav className="nav-buttons">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`btn-tp2 ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="search-section">
        <SearchBar onSearch={onSearch} />
      </div>
    </div>
  );
};

export default Navigation;
