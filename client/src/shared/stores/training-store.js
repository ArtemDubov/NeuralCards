// /shared/stores/training-store.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TRAINING_MODES_CONFIG } from "../configs/training-modes-config";

/**
 * Минималистичный store для тренировок
 * Только состояние, без бизнес-логики
 */
export const useTrainingStore = create(
  persist(
    (set, get) => ({
      // === ТОЛЬКО СОСТОЯНИЕ ===

      // Текущая активная сессия
      session: null,

      // Конфигурация режимов (импортируется из конфига)
      modes: TRAINING_MODES_CONFIG,

      // История сессий (опционально, для статистики)
      sessionHistory: [],

      // === МИНИМАЛЬНЫЕ ДЕЙСТВИЯ ===

      // Установить сессию (вся логика создания - в сервисах)
      setSession: (session) => set({ session }),

      // Очистить сессию
      clearSession: () => set({ session: null }),

      // Обновить сессию через функцию-апдейтер
      updateSession: (updater) =>
        set((state) => ({
          session: updater(state.session),
        })),

      // Добавить сессию в историю
      addToHistory: (session) =>
        set((state) => ({
          sessionHistory: [
            {
              ...session,
              endTime: new Date().toISOString(),
              id: Date.now(),
            },
            ...state.sessionHistory.slice(0, 49), // храним 50 последних
          ],
        })),

      // Добавить кастомный режим
      addCustomMode: (mode) =>
        set((state) => ({
          modes: { ...state.modes, [mode.id]: mode },
        })),

      // === ПРОСТЫЕ СЕЛЕКТОРЫ ===

      // Получить текущий режим
      getCurrentMode: () => {
        const { session, modes } = get();
        return session ? modes[session.mode] : null;
      },

      // Получить прогресс (простая обертка)
      getProgress: () => {
        const { session } = get();
        if (!session || !session.cardset?.cards) return null;

        const total = session.cardset.cards.length;
        const current = session.currentCardIndex;

        return {
          current,
          total,
          percentage: Math.round((current / total) * 100),
          isCompleted: current >= total,
        };
      },
    }),
    {
      name: "training-storage",
      partialize: (state) => ({
        modes: state.modes,
        sessionHistory: state.sessionHistory,
      }),
    }
  )
);
