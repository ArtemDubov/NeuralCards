import { create } from "zustand";
import { persist } from "zustand/middleware";

// === ДОБАВЛЕНО: Предзагружаем ВСЕ переводы синхронно ===
import ruTranslations from "../../locales/ru.json";
import enTranslations from "../../locales/en.json";
import esTranslations from "../../locales/es.json";

const translationsMap = {
  ru: ruTranslations,
  en: enTranslations,
  es: esTranslations,
};

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Язык - будет восстановлен из localStorage
      language: "ru",
      // Переводы - инициализируем ПОСЛЕ восстановления language
      translations: ruTranslations, // Временное значение

      // Тема
      theme: "ocean",
      themes: [
        { id: "ocean", nameKey: "theme.ocean", icon: "🌊" },
        { id: "dark", nameKey: "theme.dark", icon: "🌙" },
        { id: "forest", nameKey: "theme.forest", icon: "🌲" },
        { id: "sunset", nameKey: "theme.sunset", icon: "🌅" },
        { id: "light", nameKey: "theme.light", icon: "☀️" },
      ],

      // === ИЗМЕНЕНО: Синхронная смена языка ===
      setLanguage: (lang) => {
        const translations = translationsMap[lang] || ruTranslations;
        set({
          language: lang,
          translations: translations,
        });
      },

      // === ДОБАВЛЕНО: Инициализация после восстановления ===
      initializeLanguage: () => {
        const state = get();
        // Если language уже установлен (из persist), обновляем translations
        const translations = translationsMap[state.language] || ruTranslations;
        if (state.translations !== translations) {
          set({ translations: translations });
        }
      },

      setTheme: (themeId) => {
        document.documentElement.setAttribute("data-theme", themeId);
        set({ theme: themeId });
      },

      // Трансляция
      t: (key, variables = {}) => {
        const { translations } = get();
        let text = translations[key] || key;

        // Замена переменных {name} → значение
        Object.keys(variables).forEach((variable) => {
          text = text.replace(`{${variable}}`, variables[variable]);
        });

        return text;
      },

      initialize: async () => {
        console.log("Инициализация appStore");

        // 1. Восстанавливаем тему
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
            console.error("Error parsing saved theme:", e);
          }
        }

        // 2. Инициализируем язык (ВАЖНО!)
        get().initializeLanguage();

        console.log("Инициализация appStore завершена");
        return Promise.resolve();
      },
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        language: state.language,
        theme: state.theme,
      }),
      // === ДОБАВЛЕНО: Обработка после восстановления ===
      onRehydrateStorage: () => {
        return (state) => {
          // Этот код выполнится ПОСЛЕ восстановления из localStorage
          if (state) {
            // Обновляем translations в соответствии с восстановленным language
            const translations =
              translationsMap[state.language] || ruTranslations;
            state.translations = translations;
          }
        };
      },
    }
  )
);
