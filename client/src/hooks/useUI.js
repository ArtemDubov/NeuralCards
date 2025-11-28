import { useState, useCallback } from "react";

export const useUI = () => {
  const [activeTab, setActiveTab] = useState("sets");
  const [selectedSetForTraining, setSelectedSetForTraining] = useState(null);

  const [modals, setModals] = useState({
    addCard: { isOpen: false },
    editCard: { isOpen: false, card: null },
    viewCard: { isOpen: false, card: null },
    deleteConfirmation: {
      isOpen: false,
      type: null,
      id: null,
      title: "",
      message: "",
    },
  });

  const [forms, setForms] = useState({
    card: {
      frontText: "",
      backText: "",
      frontImage: null,
      backImage: null,
      frontAudio: null,
      backAudio: null,
      isUploading: false,
    },
    set: {
      title: "",
      tags: [],
    },
  });

  const openModal = useCallback((modalName, data = {}) => {
    setModals((prev) => ({
      ...prev,
      [modalName]: { ...prev[modalName], isOpen: true, ...data },
    }));
  }, []);

  const closeModal = useCallback((modalName) => {
    setModals((prev) => ({
      ...prev,
      [modalName]: { ...prev[modalName], isOpen: false },
    }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals({
      addCard: { isOpen: false },
      editCard: { isOpen: false, card: null },
      viewCard: { isOpen: false, card: null },
      deleteConfirmation: {
        isOpen: false,
        type: null,
        id: null,
        title: "",
        message: "",
      },
    });
  }, []);

  const updateForm = useCallback((formName, updates) => {
    setForms((prev) => ({
      ...prev,
      [formName]: { ...prev[formName], ...updates },
    }));
  }, []);

  const resetForm = useCallback((formName) => {
    const initialStates = {
      card: {
        frontText: "",
        backText: "",
        frontImage: null,
        backImage: null,
        frontAudio: null,
        backAudio: null,
        isUploading: false,
      },
      set: {
        title: "",
        tags: [],
      },
    };

    setForms((prev) => ({
      ...prev,
      [formName]: initialStates[formName],
    }));
  }, []);

  return {
    activeTab,
    selectedSetForTraining,
    modals,
    forms,

    setActiveTab,
    setSelectedSetForTraining,
    openModal,
    closeModal,
    closeAllModals,
    updateForm,
    resetForm,
  };
};
