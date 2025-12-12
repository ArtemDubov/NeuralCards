import { create } from "zustand";
import { persist } from "zustand/middleware";

import ruTranslations from "../../locales/ru.json";
import enTranslations from "../../locales/en.json";
import esTranslations from "../../locales/es.json";
import deTranslations from "../../locales/de.json";
import frTranslations from "../../locales/fr.json";

const translationsMap = {
  ru: ruTranslations,
  en: enTranslations,
  es: esTranslations,
  de: deTranslations,
  fr: frTranslations,
};

export const useAppStore = create(
  persist(
    (set, get) => ({
      language: "ru",
      translations: ruTranslations,
      theme: "ocean",
      themes: [
        { id: "ocean", nameKey: "theme.ocean", icon: "🌊" },
        { id: "deep-sea", nameKey: "theme.deepSea", icon: "🐙" },
        { id: "arctic-ice", nameKey: "theme.arcticIce", icon: "❄️" },
        { id: "warm-waters", nameKey: "theme.warmWaters", icon: "🌡️" },
        { id: "forest", nameKey: "theme.forest", icon: "🌲" },
        { id: "mossy-grove", nameKey: "theme.mossyGrove", icon: "🍃" },
        { id: "desert-sand", nameKey: "theme.desertSand", icon: "🏜️" },
        { id: "sunset", nameKey: "theme.sunset", icon: "🌅" },
        { id: "ember", nameKey: "theme.ember", icon: "🟠" },
        { id: "vintage-wine", nameKey: "theme.vintageWine", icon: "🍷" },
        { id: "monochrome", nameKey: "theme.monochrome", icon: "⚫" },
        { id: "lavender-field", nameKey: "theme.lavenderField", icon: "💜" },
        { id: "rose-quartz", nameKey: "theme.roseQuartz", icon: "🌸" },
        { id: "cyberpunk", nameKey: "theme.cyberpunk", icon: "🤖" },
        { id: "neon-nights", nameKey: "theme.neonNights", icon: "🌃" },
        { id: "morning", nameKey: "theme.morning", icon: "🌅" },
        { id: "day", nameKey: "theme.day", icon: "☀️" },
        { id: "evening", nameKey: "theme.evening", icon: "🌆" },
        { id: "night", nameKey: "theme.night", icon: "🌃" },
        { id: "jungle", nameKey: "theme.jungle", icon: "🌴" },
        { id: "swamp", nameKey: "theme.swamp", icon: "🐊" },
        { id: "canyon", nameKey: "theme.canyon", icon: "🏞️" },
        { id: "basalt", nameKey: "theme.basalt", icon: "🌋" },
        { id: "marble", nameKey: "theme.marble", icon: "🗿" },
        { id: "sky", nameKey: "theme.sky", icon: "☁️" },
        { id: "mist", nameKey: "theme.mist", icon: "🌫️" },
        { id: "storm", nameKey: "theme.storm", icon: "⛈️" },
        { id: "zenith", nameKey: "theme.zenith", icon: "☀️" },
        { id: "volcano", nameKey: "theme.volcano", icon: "🌋" },
        { id: "lava", nameKey: "theme.lava", icon: "🌋" },
        { id: "coral", nameKey: "theme.coral", icon: "🪸" },
        { id: "velvet", nameKey: "theme.velvet", icon: "🟣" },
      ],

      setLanguage: (lang) => {
        const translations = translationsMap[lang] || ruTranslations;
        set({
          language: lang,
          translations: translations,
        });
      },

      initializeLanguage: () => {
        const state = get();
        const translations = translationsMap[state.language] || ruTranslations;
        if (state.translations !== translations) {
          set({ translations: translations });
        }
      },

      setTheme: (themeId) => {
        document.documentElement.setAttribute("data-theme", themeId);
        set({ theme: themeId });
      },

      t: (key, variables = {}) => {
        const { translations } = get();
        let text = translations[key] || key;

        Object.keys(variables).forEach((variable) => {
          text = text.replace(`{${variable}}`, variables[variable]);
        });

        return text;
      },

      initialize: async () => {
        const savedTheme = localStorage.getItem("app-storage");
        if (savedTheme) {
          try {
            const parsed = JSON.parse(savedTheme);
            if (parsed.state?.theme) {
              document.documentElement.setAttribute(
                "data-theme",
                parsed.state.theme
              );
            }
          } catch (e) {
            // Ошибка парсинга темы - игнорируем
          }
        }

        get().initializeLanguage();
        return Promise.resolve();
      },
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        language: state.language,
        theme: state.theme,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            const translations =
              translationsMap[state.language] || ruTranslations;
            state.translations = translations;
          }
        };
      },
    }
  )
);
