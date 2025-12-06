import React, { useState, useEffect } from "react";
import { useUIStore } from "../../../shared/stores/uiStore";
import { useAppStore } from "../../../shared/stores/appStore";

import CardModal from "../../cardsets/components/CardModal/CardModal";
import ViewCardModal from "../../cardsets/components/ViewCardModal/ViewCardModal";
import EditSetModal from "../../cardsets/components/EditSetModal/EditSetModal";
import CreateSetModal from "../../cardsets/components/CreateSetModal/CreateSetModal";
import { ConfirmationModal } from "./ConfirmationModal/ConfirmationModal";

// Импорты мутаций
import {
  useDeleteSet,
  useUpdateSet,
  useCreateSet,
} from "../../../api/cardsets";
import { useAddCard, useUpdateCard, useDeleteCard } from "../../../api/cards";

export const ModalManager = () => {
  const { modals, closeModal, getModalData } = useUIStore();
  const { t } = useAppStore();

  // Мутации
  const addCardMutation = useAddCard();
  const updateCardMutation = useUpdateCard();
  const deleteCardMutation = useDeleteCard();
  const deleteSetMutation = useDeleteSet();
  const updateSetMutation = useUpdateSet();
  const createSetMutation = useCreateSet();

  // Состояние для ошибок и загрузки редактирования набора
  const [editSetError, setEditSetError] = useState(null);
  const [createSetError, setCreateSetError] = useState(null);

  // Обработчики
  const handleAddCard = async (formData) => {
    const modalData = getModalData("addCard");
    if (!modalData?.setId) return;

    try {
      await addCardMutation.mutateAsync({
        setId: modalData.setId,
        cardData: {
          front: formData.frontText,
          back: formData.backText,
          imageUrl: null,
          audioUrl: null,
          backImageUrl: null,
          backAudioUrl: null,
        },
      });

      closeModal("addCard");
    } catch (error) {
      console.error("Ошибка добавления карточки:", error);
    }
  };

  const handleEditCard = async (formData) => {
    const editingCard = getModalData("editCard");
    if (!editingCard) return;

    try {
      await updateCardMutation.mutateAsync({
        setId: editingCard.setId || editingCard.cardsetId,
        cardId: editingCard.id,
        cardData: {
          front: formData.frontText,
          back: formData.backText,
          imageUrl: editingCard.imageUrl,
          audioUrl: editingCard.audioUrl,
          backImageUrl: editingCard.backImageUrl,
          backAudioUrl: editingCard.backAudioUrl,
        },
      });

      closeModal("editCard");
    } catch (error) {
      console.error("Ошибка обновления карточки:", error);
    }
  };

  const handleEditSet = async (formData) => {
    const setData = getModalData("editSet");
    if (!setData?.id) return;

    setEditSetError(null);

    try {
      console.log("📤 Отправляем обновление набора:", {
        setId: setData.id,
        data: {
          title: formData.title,
          tags: formData.tags,
        },
      });

      await updateSetMutation.mutateAsync({
        setId: setData.id,
        data: {
          title: formData.title,
          tags: formData.tags,
        },
      });

      closeModal("editSet");
    } catch (error) {
      console.error("Ошибка обновления набора:", error);
      setEditSetError(error.response?.data?.error || error.message);
    }
  };

  // Исправленный обработчик для создания набора
  const handleCreateSet = async (formData) => {
    setCreateSetError(null);

    try {
      console.log("📤 Отправляем создание набора:", {
        title: formData.title,
        tags: formData.tags,
      });

      // ИСПРАВЛЕНО: передаем объект напрямую
      await createSetMutation.mutateAsync({
        title: formData.title,
        tags: formData.tags,
      });

      closeModal("createSet");
    } catch (error) {
      console.error("Ошибка создания набора:", error);
      // Подробное логирование ошибки
      console.error("Детали ошибки:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setCreateSetError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Не удалось создать набор"
      );
    }
  };

  const handleConfirmDelete = async () => {
    const modalData = getModalData("deleteConfirmation") || {};
    const { type, id, setId } = modalData;

    try {
      if (type === "set") {
        await deleteSetMutation.mutateAsync(id);
        closeModal("deleteConfirmation");
      } else if (type === "card") {
        await deleteCardMutation.mutateAsync({
          setId: setId,
          cardId: id,
        });
        closeModal("deleteConfirmation");
      }
    } catch (error) {
      console.error("Ошибка удаления:", error);
      closeModal("deleteConfirmation");
    }
  };

  const handlePremiumConfirmation = async () => {
    const modalData = getModalData("premiumConfirmation");
    if (modalData?.onConfirm) {
      await modalData.onConfirm();
    }
    closeModal("premiumConfirmation");
  };

  const handlePremiumDeactivate = async () => {
    const modalData = getModalData("premiumDeactivate");
    if (modalData?.onConfirm) {
      await modalData.onConfirm();
    }
    closeModal("premiumDeactivate");
  };

  const handleViewCardEdit = (card) => {
    closeModal("viewCard");
    const { openModal } = useUIStore.getState();
    openModal("editCard", {
      ...card,
      setId: card.cardsetId || getModalData("viewCard")?.cardsetId,
    });
  };

  return (
    <>
      <ViewCardModal
        isOpen={modals.viewCard.open}
        onClose={() => closeModal("viewCard")}
        card={getModalData("viewCard")}
        onEdit={handleViewCardEdit}
      />

      <CardModal
        isOpen={modals.addCard.open}
        onClose={() => closeModal("addCard")}
        onSubmit={handleAddCard}
        title={t("card.create.title")}
        submitText={t("card.create.button")}
      />

      <CardModal
        isOpen={modals.editCard.open}
        onClose={() => closeModal("editCard")}
        onSubmit={handleEditCard}
        title={t("card.edit.title")}
        editingCard={getModalData("editCard")}
        submitText={t("card.edit.button")}
      />

      {/* Новая модалка создания набора */}
      <CreateSetModal
        isOpen={modals.createSet?.open || false}
        onClose={() => {
          setCreateSetError(null);
          closeModal("createSet");
        }}
        onSubmit={handleCreateSet}
        isSubmitting={createSetMutation.isPending}
        error={createSetError}
      />

      <EditSetModal
        isOpen={modals.editSet.open}
        onClose={() => {
          setEditSetError(null);
          closeModal("editSet");
        }}
        onSubmit={handleEditSet}
        setData={getModalData("editSet")}
        isSubmitting={updateSetMutation.isPending}
        error={editSetError}
      />

      <ConfirmationModal
        isOpen={modals.deleteConfirmation.open}
        onClose={() => closeModal("deleteConfirmation")}
        onConfirm={handleConfirmDelete}
        title={getModalData("deleteConfirmation")?.title}
        message={getModalData("deleteConfirmation")?.message}
        confirmText={t("modal.delete.confirm")}
        cancelText={t("modal.delete.cancel")}
      />

      {/* Премиум модалка активации */}
      <ConfirmationModal
        isOpen={modals.premiumConfirmation?.open || false}
        onClose={() => closeModal("premiumConfirmation")}
        onConfirm={handlePremiumConfirmation}
        title={getModalData("premiumConfirmation")?.title}
        message={getModalData("premiumConfirmation")?.message}
        confirmText={t("premium.confirm.button") || "Подключить"}
        cancelText={t("modal.delete.cancel") || "Отмена"}
      />

      {/* Премиум модалка деактивации */}
      <ConfirmationModal
        isOpen={modals.premiumDeactivate?.open || false}
        onClose={() => closeModal("premiumDeactivate")}
        onConfirm={handlePremiumDeactivate}
        title={getModalData("premiumDeactivate")?.title}
        message={getModalData("premiumDeactivate")?.message}
        confirmText={t("premium.deactivate.button") || "Отключить"}
        cancelText={t("modal.delete.cancel") || "Отмена"}
      />
    </>
  );
};
