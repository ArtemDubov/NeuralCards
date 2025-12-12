import React from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { usePremium } from "../../../../hooks/usePremium";

const Navigation = ({ activeTab, setActiveTab }) => {
  const { t } = useAppStore();
  const { isPremium } = usePremium();

  // Вкладки для всех пользователей
  const tabs = [
    { id: "sets", label: t("navigation.sets"), icon: "📚" },
    { id: "training", label: t("navigation.training"), icon: "🎯" },
    { id: "favorites", label: t("navigation.favorites.with_icon"), icon: "⭐" },
    {
      id: "premium",
      label: t("navigation.premium") || "Премиум",
      icon: isPremium ? "⚡" : "🔒",
    },
  ];

  return (
    <nav className="nt-app__nav">
      <div className="nt-app__nav-buttons nt-util__w-full">
        {tabs.map((tab) => {
          // Определяем классы для каждой кнопки
          let buttonClass = "nt-btn nt-util__flex-1 nt-util__justify-center";

          if (activeTab === tab.id) {
            // Активная кнопка
            if (tab.id === "premium") {
              buttonClass += isPremium
                ? " nt-btn--premium-tab-active"
                : " nt-btn--premium-tab";
            } else {
              buttonClass += " nt-btn--primary";
            }
          } else {
            // Неактивная кнопка
            buttonClass += " nt-btn--ghost";
          }

          return (
            <button
              key={tab.id}
              className={buttonClass}
              onClick={() => {
                console.log("Клик по табу:", tab.id);
                setActiveTab(tab.id);
              }}
              title={
                tab.id === "premium" && !isPremium
                  ? t("premium.activate.tooltip")
                  : ""
              }
            >
              <span className="nt-util__mr-sm">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
