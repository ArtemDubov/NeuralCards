// layouts/MainLayout/useMainAppLogic.js
import { useAppStore } from "../../shared/stores/appStore";
import { useAuthStore } from "../../shared/stores/authStore";
import { useUIStore } from "../../shared/stores/uiStore";
import { useDataStore } from "../../shared/stores/dataStore";
import { useCardSets, useCreateSet } from "../../api/cardSets";

export function useMainAppLogic() {
  const { t } = useAppStore();
  const { user, logout } = useAuthStore();
  const {
    activeTab,
    setActiveTab,
    openModal,
    closeModal,
    forms,
    updateForm,
    resetForm,
  } = useUIStore();
  const { selectedSet, setSelectedSet } = useDataStore();

  const { data: cardSets = [] } = useCardSets();
  const createSetMutation = useCreateSet();

  // === ОБРАБОТЧИКИ СОБЫТИЙ ===
  const handleViewSet = (set) => {
    console.log("View set clicked:", set);
    setSelectedSet(set);
    setActiveTab("view-set");
  };

  const handleDeleteSet = (setId, setTitle) => {
    openModal("deleteConfirmation", {
      type: "set",
      id: setId,
      title: t("modal.delete.set.title"),
      message: t("modal.delete.set", { title: setTitle }),
    });
  };

  const handleLogout = () => {
    logout();
    setActiveTab("sets");
  };

  const handleCreateSet = async (e) => {
    e.preventDefault();

    try {
      await createSetMutation.mutateAsync({
        title: forms.set?.title || "",
        description: "Мой новый набор",
        isPublic: false,
        tags: (forms.set?.tags || []).map((tag) => ({ name: tag })),
      });

      resetForm("set");
      setActiveTab("sets");
    } catch (error) {
      alert("Ошибка при создании набора: " + error.message);
    }
  };

  return {
    // Состояние
    user,
    activeTab,
    forms,
    selectedSet,
    cardSets,

    // Данные из сторов
    t,

    // Обработчики событий
    handleLogout,
    handleCreateSet,
    handleViewSet,
    handleDeleteSet,

    // Функции из сторов
    setActiveTab,
    updateForm,
    resetForm,
    openModal,
    closeModal,
  };
}
