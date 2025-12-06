import { create } from "zustand";

export const useUIStore = create((set, get) => ({
  // Табы
  activeTab: "sets",

  // Тренировка
  selectedSetForTraining: null,

  // Модалки
  modals: {
    addCard: { open: false, data: null },
    editCard: { open: false, data: null },
    viewCard: { open: false, data: null },
    deleteConfirmation: { open: false, data: null },
    editSet: { open: false, data: null },
    createSet: { open: false, data: null }, // ← ДОБАВЛЕНО
    premiumConfirmation: { open: false, data: null },
    premiumDeactivate: { open: false, data: null },
  },

  // Формы
  forms: {
    set: { title: "", tags: [] },
    card: { frontText: "", backText: "" },
  },

  // Язык
  language: (() => {
    try {
      const savedLanguage = localStorage.getItem("nt-language");
      if (savedLanguage && ["ru", "en", "es"].includes(savedLanguage)) {
        return savedLanguage;
      }
    } catch (error) {
      console.warn("Не удалось загрузить язык из localStorage:", error);
    }
    return "ru";
  })(),

  // Действия
  setActiveTab: (tab) => set({ activeTab: tab }),

  setLanguage: (lang) => {
    try {
      localStorage.setItem("nt-language", lang);
    } catch (error) {
      console.warn("Не удалось сохранить язык в localStorage:", error);
    }
    set({ language: lang });
  },

  setSelectedSetForTraining: (set) => set({ selectedSetForTraining: set }),

  openModal: (modalName, data = {}) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: { open: true, data },
      },
    })),

  closeModal: (modalName) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: { open: false, data: null },
      },
    })),

  closeAllModals: () =>
    set({
      modals: {
        addCard: { open: false, data: null },
        editCard: { open: false, data: null },
        viewCard: { open: false, data: null },
        deleteConfirmation: { open: false, data: null },
        editSet: { open: false, data: null },
        createSet: { open: false, data: null }, // ← ДОБАВЛЕНО
        premiumConfirmation: { open: false, data: null },
        premiumDeactivate: { open: false, data: null },
      },
    }),

  updateForm: (formName, updates) =>
    set((state) => ({
      forms: {
        ...state.forms,
        [formName]: {
          ...state.forms[formName],
          ...updates,
        },
      },
    })),

  resetForm: (formName) =>
    set((state) => ({
      forms: {
        ...state.forms,
        [formName]: {},
      },
    })),

  // Селекторы
  isModalOpen: (modalName) => get().modals[modalName]?.open || false,
  getModalData: (modalName) => get().modals[modalName]?.data || null,
}));
