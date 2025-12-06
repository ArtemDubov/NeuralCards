import React from "react";
import { useAppStore } from "../../../../shared/stores/appStore";

const Navigation = ({ activeTab, setActiveTab }) => {
  const { t } = useAppStore();

  const tabs = [
    { id: "sets", label: t("navigation.sets"), icon: "📚" },
    { id: "training", label: t("navigation.training"), icon: "🎯" },
    { id: "favorites", label: t("navigation.favorites.with_icon"), icon: "⭐" },
  ];

  return (
    <nav className="nt-app__nav">
      <div className="nt-app__nav-buttons nt-util__w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nt-btn nt-util__flex-1 nt-util__justify-center ${
              activeTab === tab.id
                ? "nt-btn--primary nt-util__border-accent"
                : "nt-btn--ghost nt-util__text-secondary"
            }`}
            onClick={() => {
              console.log("Клик по табу:", tab.id);
              setActiveTab(tab.id);
            }}
          >
            <span className="nt-util__mr-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
