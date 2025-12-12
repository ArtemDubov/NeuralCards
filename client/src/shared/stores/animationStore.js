import { create } from "zustand";
import { persist } from "zustand/middleware";

const ANIMATIONS_CONFIG = {
  actions: ["create", "delete"],
  elementTypes: ["cardSet", "card"],
  animations: {
    create: [
      { id: "fadeIn", label: "Плавное появление", emoji: "✨", duration: 600 },
      { id: "slideIn", label: "Выезд снизу", emoji: "⬆️", duration: 500 },
      { id: "scaleIn", label: "Увеличение", emoji: "🔍", duration: 400 },
      { id: "bounceIn", label: "Отскок", emoji: "🏀", duration: 600 },
      { id: "confetti", label: "Конфетти", emoji: "🎉", duration: 800 },
    ],
    delete: [
      {
        id: "fadeOut",
        label: "Плавное исчезновение",
        emoji: "👻",
        duration: 400,
      },
      { id: "slideOut", label: "Уезд вверх", emoji: "⬆️", duration: 400 },
      { id: "scaleOut", label: "Сжатие", emoji: "📉", duration: 300 },
      { id: "bounceOut", label: "Отскок", emoji: "🏀", duration: 500 },
      { id: "disintegrate", label: "Рассыпание", emoji: "💥", duration: 600 },
    ],
  },
  defaults: {
    create: {
      cardSet: "fadeIn",
      card: "fadeIn",
    },
    delete: {
      cardSet: "fadeOut",
      card: "fadeOut",
    },
  },
};

const createDefaultConfig = () => {
  const config = { enabled: true, isRandom: false, config: {} };

  ANIMATIONS_CONFIG.actions.forEach((action) => {
    config.config[action] = {};
    ANIMATIONS_CONFIG.elementTypes.forEach((elementType) => {
      config.config[action][elementType] =
        ANIMATIONS_CONFIG.defaults[action]?.[elementType] ||
        ANIMATIONS_CONFIG.animations[action]?.[0]?.id ||
        null;
    });
  });

  return config;
};

const DEFAULT_CONFIG = createDefaultConfig();

export const useAnimationStore = create(
  persist(
    (set, get) => ({
      ...DEFAULT_CONFIG,
      newlyCreatedSetId: null,
      newlyCreatedCardId: null,
      recentlyDeletedSetId: null,
      recentlyDeletedCardId: null,

      getAnimationTypes: (action) => {
        return ANIMATIONS_CONFIG.animations[action] || [];
      },

      getAllAnimations: () => ANIMATIONS_CONFIG.animations,

      getAvailableActions: () => ANIMATIONS_CONFIG.actions,

      getAvailableElementTypes: () => ANIMATIONS_CONFIG.elementTypes,

      setEnabled: (enabled) => {
        set({ enabled });
      },

      setIsRandom: (isRandom) => {
        set({ isRandom });
      },

      setAnimation: (action, elementType, animationId) => {
        set((state) => ({
          config: {
            ...state.config,
            [action]: {
              ...state.config[action],
              [elementType]: animationId,
            },
          },
        }));
      },

      getAnimation: (action, elementType) => {
        const state = get();

        if (!state.enabled) {
          return null;
        }

        if (
          !ANIMATIONS_CONFIG.actions.includes(action) ||
          !ANIMATIONS_CONFIG.elementTypes.includes(elementType)
        ) {
          return null;
        }

        if (state.isRandom) {
          const animations = ANIMATIONS_CONFIG.animations[action];
          if (!animations || animations.length === 0) {
            return null;
          }

          const randomIndex = Math.floor(Math.random() * animations.length);
          return animations[randomIndex]?.id || null;
        }

        return (
          state.config[action]?.[elementType] ||
          ANIMATIONS_CONFIG.defaults[action]?.[elementType] ||
          null
        );
      },

      getAnimationInfo: (action, animationId) => {
        const animations = ANIMATIONS_CONFIG.animations[action];
        if (!animations) {
          return null;
        }

        return animations.find((anim) => anim.id === animationId) || null;
      },

      resetToDefaults: () => {
        set(DEFAULT_CONFIG);
      },

      getConfigForUI: () => {
        const state = get();
        return {
          enabled: state.enabled,
          isRandom: state.isRandom,
          config: state.config,
          availableActions: ANIMATIONS_CONFIG.actions,
          availableElementTypes: ANIMATIONS_CONFIG.elementTypes,
          availableAnimations: ANIMATIONS_CONFIG.animations,
        };
      },

      updateConfig: (newConfig) => {
        set((state) => ({
          ...state,
          config: {
            ...state.config,
            ...newConfig,
          },
        }));
      },

      isAnimationValid: (action, animationId) => {
        const animations = ANIMATIONS_CONFIG.animations[action];
        if (!animations) {
          return false;
        }

        return animations.some((anim) => anim.id === animationId);
      },

      setNewlyCreatedSetId: (id) => {
        set({ newlyCreatedSetId: id });

        if (id) {
          setTimeout(() => {
            if (get().newlyCreatedSetId === id) {
              set({ newlyCreatedSetId: null });
            }
          }, 1500);
        }
      },

      setNewlyCreatedCardId: (id) => {
        set({ newlyCreatedCardId: id });

        if (id) {
          setTimeout(() => {
            if (get().newlyCreatedCardId === id) {
              set({ newlyCreatedCardId: null });
            }
          }, 1500);
        }
      },

      clearNewlyCreatedSetId: () => {
        set({ newlyCreatedSetId: null });
      },

      clearNewlyCreatedCardId: () => {
        set({ newlyCreatedCardId: null });
      },

      setRecentlyDeletedSetId: (id) => {
        set({ recentlyDeletedSetId: id });

        if (id) {
          setTimeout(() => {
            if (get().recentlyDeletedSetId === id) {
              set({ recentlyDeletedSetId: null });
            }
          }, 1500);
        }
      },

      setRecentlyDeletedCardId: (id) => {
        set({ recentlyDeletedCardId: id });

        if (id) {
          setTimeout(() => {
            if (get().recentlyDeletedCardId === id) {
              set({ recentlyDeletedCardId: null });
            }
          }, 1500);
        }
      },
    }),
    {
      name: "animation-storage",
      partialize: (state) => ({
        enabled: state.enabled,
        isRandom: state.isRandom,
        config: state.config,
      }),
    }
  )
);
