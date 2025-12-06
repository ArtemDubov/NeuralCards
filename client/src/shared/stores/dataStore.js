// dataStore.js - ИСПРАВЛЕННАЯ ВЕРСИЯ:
import { create } from "zustand";

export const useDataStore = create((set, get) => ({
  selectedSet: null,

  // ДЕЙСТВИЯ
  setSelectedSet: (selectedSet) => set({ selectedSet }),

  // СЕЛЕКТОРЫ
  getSelectedSet: () => get().selectedSet,
}));
