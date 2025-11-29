import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    localStorage.getItem("neuraltrident-language") || "ru"
  );
  const [translations, setTranslations] = useState({});

  // Загрузка переводов
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const savedLang =
          localStorage.getItem("neuraltrident-language") || "ru";
        setLanguage(savedLang);

        const translationModule = await import(`../locales/${savedLang}.json`);
        setTranslations(translationModule.default);
      } catch (error) {
        console.error("Error loading translations:", error);
        // Fallback to Russian
        const fallback = await import("../locales/ru.json");
        setTranslations(fallback.default);
      }
    };

    loadTranslations();
  }, []);

  const switchLanguage = async (newLang) => {
    try {
      const translationModule = await import(`../locales/${newLang}.json`);
      setTranslations(translationModule.default);
      setLanguage(newLang);
      localStorage.setItem("neuraltrident-language", newLang);
      localStorage.setItem("selectedLanguage", newLang);
    } catch (error) {
      console.error("Error switching language:", error);
    }
  };

  const t = (key) => {
    return translations[key] || key; // Возвращаем ключ если перевод не найден
  };

  return (
    <LanguageContext.Provider
      value={{ language, translations, switchLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
