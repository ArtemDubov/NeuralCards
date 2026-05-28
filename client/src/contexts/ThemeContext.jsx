import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { profileApi } from "../features/auth/api/profileApi";
import {
  PRESET_THEMES,
  getDarkPreset,
  getPreset,
  COLOR_GROUPS,
  FONT_PRESETS,
  DENSITY_SETTINGS,
} from "./themePresets";

const ThemeContext = createContext(null);

const STORAGE_KEY = "nt-theme-settings";

// Debounce утилита для отложенного сохранения
function createDebounce(delay) {
  let timeoutId = null;
  return (callback) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
}

function saveToLocalStorage(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    // ignore
  }
}

// Создаём debounced функции для сохранения (1 секунда задержка)
const debouncedSaveProfile = createDebounce(1000);

export function ThemeProvider({ children }) {
  // Состояния
  const [selectedPreset, setSelectedPreset] = useState("purple");
  const [currentTheme, setCurrentTheme] = useState({ ...PRESET_THEMES.purple.colors, mode: PRESET_THEMES.purple.mode, name: PRESET_THEMES.purple.name });
  const [customColors, setCustomColors] = useState(null);
  const [customFonts, setCustomFonts] = useState(null);
  const [density, setDensity] = useState("normal");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userPresets, setUserPresets] = useState({});

  // Загрузка настроек при монтировании
  useEffect(() => {
    // Сначала загружаем из localStorage (мгновенно)
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        if (settings.selectedPreset) setSelectedPreset(settings.selectedPreset);
        if (settings.darkMode !== undefined) setDarkMode(settings.darkMode);
        if (settings.customColors) setCustomColors(settings.customColors);
        if (settings.customFonts) setCustomFonts(settings.customFonts);
        if (settings.density) setDensity(settings.density);
        if (settings.userPresets) setUserPresets(settings.userPresets);

        // Применяем тему из localStorage
        const preset = getPreset(
          settings.selectedPreset || "purple",
          settings.darkMode || false,
        );
        if (preset) setCurrentTheme({ ...preset.colors, mode: preset.mode, name: preset.name });
      }
    } catch (e) {
      console.warn("Failed to load theme from localStorage:", e);
    }

    // Затем пробуем загрузить с сервера (перезаписывает если есть)
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const profile = await profileApi.getProfile();
      const userProfile = profile.data.profile;

      if (userProfile) {
        if (userProfile.theme) setSelectedPreset(userProfile.theme);
        if (userProfile.dark_mode !== undefined)
          setDarkMode(userProfile.dark_mode);
        if (userProfile.custom_colors)
          setCustomColors(JSON.parse(userProfile.custom_colors));
        if (userProfile.custom_fonts)
          setCustomFonts(JSON.parse(userProfile.custom_fonts));
        if (userProfile.density) setDensity(userProfile.density);
        if (userProfile.user_presets)
          setUserPresets(JSON.parse(userProfile.user_presets));

        // Применяем тему
        const preset = getPreset(
          userProfile.theme || "purple",
          userProfile.dark_mode || false,
        );
        if (preset) setCurrentTheme({ ...preset.colors, mode: preset.mode, name: preset.name });
      }
    } catch (error) {
      // Тихо игнорируем ошибки загрузки темы для неавторизованных пользователей
      // Ошибки "No refresh token" и 401 - это нормальное поведение для гостевого режима
      const isAuthError = 
        error.message === "No refresh token" || 
        error.response?.status === 401;
      
      if (!isAuthError) {
        console.error("Error loading theme settings:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Применение темы к body и установка data-theme атрибута
  useEffect(() => {
    document.body.style.backgroundColor = currentTheme?.background || "var(--nt-background, #f5f5f5)";
    document.body.style.color = currentTheme?.text || "var(--nt-text, #333)";
    
    // Устанавливаем data-theme атрибут для CSS переменных темной темы
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [currentTheme, darkMode]);

  // Обновление пресета - МГНОВЕННО + фоновое сохранение
  const updatePreset = useCallback(
    (presetKey) => {
      setSelectedPreset(presetKey);
      const preset = getPreset(presetKey, darkMode);
      if (preset) {
        setCurrentTheme({ ...preset.colors, mode: preset.mode, name: preset.name });
        setCustomColors(null);
      }
      // Мгновенное сохранение в localStorage
      saveToLocalStorage({ selectedPreset: presetKey, darkMode });
      // Фоновое сохранение с debouncing
      debouncedSaveProfile(async () => {
        try {
          await profileApi.updateProfile({
            theme: presetKey,
            custom_colors: null,
          });
        } catch (error) {
          console.error("Error saving theme:", error);
        }
      });
    },
    [darkMode],
  );

  // Обновление цвета - МГНОВЕННО + фоновое сохранение
  const updateColor = useCallback(
    (colorKey, value) => {
      const newCustomColors = { ...(customColors || {}), [colorKey]: value };
      setCustomColors(newCustomColors);
      setCurrentTheme((prev) => ({ ...prev, [colorKey]: value }));
      saveToLocalStorage({
        selectedPreset,
        darkMode,
        customColors: newCustomColors,
      });
      // Фоновое сохранение с debouncing
      debouncedSaveProfile(async () => {
        try {
          await profileApi.updateProfile({
            custom_colors: JSON.stringify(newCustomColors),
          });
        } catch (error) {
          console.error("Error saving color:", error);
        }
      });
    },
    [customColors],
  );

  // Обновление шрифта - МГНОВЕННО + фоновое сохранение
  const updateFont = useCallback(
    (key, value) => {
      const newCustomFonts = { ...(customFonts || {}), [key]: value };
      setCustomFonts(newCustomFonts);
      if (key === "fontFamily") {
        setCurrentTheme((prev) => ({ ...prev, fontFamily: value }));
      }
      // Фоновое сохранение с debouncing
      debouncedSaveProfile(async () => {
        try {
          await profileApi.updateProfile({
            custom_fonts: JSON.stringify(newCustomFonts),
          });
        } catch (error) {
          console.error("Error saving font:", error);
        }
      });
    },
    [customFonts],
  );

  // Обновление плотности - МГНОВЕННО + фоновое сохранение
  const updateDensity = useCallback((densityKey) => {
    setDensity(densityKey);
    // Фоновое сохранение с debouncing
    debouncedSaveProfile(async () => {
      try {
        await profileApi.updateProfile({ density: densityKey });
      } catch (error) {
        console.error("Error saving density:", error);
      }
    });
  }, []);

  // Переключение тёмной темы - МГНОВЕННО + фоновое сохранение
  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    const preset = getPreset(selectedPreset, newDarkMode);
    if (preset) setCurrentTheme({ ...preset.colors, mode: preset.mode, name: preset.name });
    saveToLocalStorage({ selectedPreset, darkMode: newDarkMode });
    // Фоновое сохранение с debouncing
    debouncedSaveProfile(async () => {
      try {
        await profileApi.updateProfile({ dark_mode: newDarkMode });
      } catch (error) {
        console.error("Error saving dark mode:", error);
      }
    });
  }, [darkMode, selectedPreset]);

  // Сохранить как пользовательский пресет
  const saveAsUserPreset = async (presetName) => {
    const newUserPresets = {
      ...userPresets,
      [presetName]: {
        light: {
          name: presetName,
          mode: "light",
          colors: { ...currentTheme },
          density,
        },
        dark: {
          name: `${presetName} Тёмный`,
          mode: "dark",
          colors: { ...getDarkPreset(selectedPreset)?.colors },
          density,
        },
      },
    };
    setUserPresets(newUserPresets);
    try {
      await profileApi.updateProfile({
        user_presets: JSON.stringify(newUserPresets),
      });
    } catch (error) {
      console.error("Error saving user preset:", error);
    }
  };

  // Сброс кастомных цветов - МГНОВЕННО + фоновое сохранение
  const resetCustomColors = useCallback(() => {
    setCustomColors(null);
    const preset = getPreset(selectedPreset, darkMode);
    if (preset) setCurrentTheme({ ...preset.colors, mode: preset.mode, name: preset.name });
    // Фоновое сохранение с debouncing
    debouncedSaveProfile(async () => {
      try {
        await profileApi.updateProfile({ custom_colors: null });
      } catch (error) {
        console.error("Error resetting colors:", error);
      }
    });
  }, [selectedPreset, darkMode]);

  // Сброс кастомных шрифтов - МГНОВЕННО + фоновое сохранение
  const resetCustomFonts = useCallback(() => {
    setCustomFonts(null);
    const preset = getPreset(selectedPreset, darkMode);
    if (preset) setCurrentTheme((prev) => ({ ...prev, ...preset.colors }));
    // Фоновое сохранение с debouncing
    debouncedSaveProfile(async () => {
      try {
        await profileApi.updateProfile({ custom_fonts: null });
      } catch (error) {
        console.error("Error resetting fonts:", error);
      }
    });
  }, [selectedPreset, darkMode]);

  const value = useMemo(
    () => ({
      selectedPreset,
      presets: { ...PRESET_THEMES, ...userPresets },
      currentTheme,
      customColors,
      customFonts,
      density,
      densities: DENSITY_SETTINGS,
      darkMode,
      colorGroups: COLOR_GROUPS,
      fontPresets: FONT_PRESETS,
      loading,
      userPresets,
      updatePreset,
      updateColor,
      updateFont,
      updateDensity,
      toggleDarkMode,
      resetCustomColors,
      resetCustomFonts,
      saveAsUserPreset,
    }),
    [
      selectedPreset,
      userPresets,
      currentTheme,
      customColors,
      customFonts,
      density,
      darkMode,
      loading,
      updatePreset,
      updateColor,
      updateFont,
      updateDensity,
      toggleDarkMode,
      resetCustomColors,
      resetCustomFonts,
      saveAsUserPreset,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
