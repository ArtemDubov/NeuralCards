import React, { useState, useEffect } from "react";
import { useUIStore } from "../../../shared/stores/uiStore";
import { useAppStore } from "../../../shared/stores/appStore";
import { useAnimationStore } from "../../../shared/stores/animationStore";
import { useQueryClient } from "@tanstack/react-query";
import { useAnimation } from "../../../hooks/useAnimation";

import CardModal from "../../cardSets/components/CardModal/CardModal";
import ViewCardModal from "../../cardSets/components/ViewCardModal/ViewCardModal";
import EditSetModal from "../../cardSets/components/EditSetModal/EditSetModal";
import CreateSetModal from "../../cardSets/components/CreateSetModal/CreateSetModal";
import BatchUploadModal from "../../cardSets/components/BatchUploadModal/BatchUploadModal";
import { ConfirmationModal } from "./ConfirmationModal/ConfirmationModal";

// Импорты мутаций
import {
  useDeleteSet,
  useUpdateSet,
  useCreateSet,
} from '../../../api/cardSets';
import {
  useAddCard,
  useUpdateCard,
  useDeleteCard,
  useAddMultipleCards,
} from "../../../api/cards";

export const ModalManager = () => {
  const { modals, closeModal, getModalData } = useUIStore();
  const { t } = useAppStore();
  const queryClient = useQueryClient();
  const animationStore = useAnimationStore();
  const { playAnimation } = useAnimation();

  // Мутации
  const addCardMutation = useAddCard();
  const updateCardMutation = useUpdateCard();
  const deleteCardMutation = useDeleteCard();
  const addMultipleCardsMutation = useAddMultipleCards();
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
      const newCard = await addCardMutation.mutateAsync({
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

      // Устанавливаем ID новой карточки для анимации через store
      if (newCard?.id) {
        animationStore.setNewlyCreatedCardId(newCard.id);

        // Обновляем данные набора, чтобы получить обновленный список карточек
        queryClient.invalidateQueries({
          queryKey: ["cardSet", modalData.setId],
        });
      }

      closeModal("addCard");

      // Вызываем callback onSuccess если передан
      if (modalData.onSuccess) {
        modalData.onSuccess(newCard);
      }
    } catch (error) {
      console.error("Ошибка добавления карточки:", error);
    }
  };

  const handleBatchUpload = async (cardsData) => {
    const modalData = getModalData("batchUpload");
    if (!modalData?.setId) return;

    try {
      console.log("📤 Отправляем карточки массово:", {
        setId: modalData.setId,
        count: cardsData.length,
      });

      const batchData = cardsData.map((card) => ({
        front: card.front,
        back: card.back,
        imageUrl: null,
        audioUrl: null,
        backImageUrl: null,
        backAudioUrl: null,
      }));

      const newCards = await addMultipleCardsMutation.mutateAsync({
        setId: modalData.setId,
        cardsData: batchData,
      });

      console.log("✅ Карточки созданы массово:", {
        count: newCards?.length,
        cards: newCards,
      });

      // ✅ Закрываем модалку СРАЗУ
      closeModal("batchUpload");

      // Вызываем callback если есть
      if (modalData.onSuccess) {
        modalData.onSuccess(newCards);
      }

      console.log("🚪 Модалка batchUpload закрыта");
    } catch (error) {
      console.error("Ошибка массового создания карточек:", error);
      // Оставляем модалку открытой при ошибке для повторной попытки
    }
  };

  const handleEditCard = async (formData) => {
    const editingCard = getModalData("editCard");
    if (!editingCard) return;

    try {
      await updateCardMutation.mutateAsync({
        setId: editingCard.setId || editingCard.cardSetId,
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
        tags: formData.tags, // Здесь tags уже в правильном формате
      });

      // ВАЖНО: Не изменяем формат данных - передаем как есть
      const newSet = await createSetMutation.mutateAsync({
        title: formData.title,
        tags: formData.tags, // Оставляем как было
      });

      // Устанавливаем ID нового набора для анимации через store
      if (newSet?.id) {
        animationStore.setNewlyCreatedSetId(newSet.id);

        // Инвалидируем кеш наборов для обновления списка
        queryClient.invalidateQueries({ queryKey: ["cardSets"] });
      }

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

  // ВОССТАНОВЛЕННЫЙ обработчик удаления - работает как раньше, но с анимацией
  const handleConfirmDelete = () => {
    const modalData = getModalData("deleteConfirmation") || {};
    const { type, id, setId, animationData } = modalData;

    // Сразу закрываем модальное окно
    closeModal("deleteConfirmation");

    // Затем в фоне выполняем анимацию и удаление
    const performDeleteWithAnimation = async () => {
      try {
        // Если есть данные для анимации, запускаем анимацию
        if (animationData) {
          const { elementId, action, elementType } = animationData;
          const element = document.querySelector(
            `[data-animation-id="${elementId}"]`
          );

          if (element) {
            console.log("🎬 Starting delete animation for:", {
              elementId,
              action,
              elementType,
            });

            // Запускаем анимацию и ждем ее завершения
            await playAnimation(element, action, elementType, {
              onComplete: () => {
                console.log("✅ Delete animation completed");
              },
            });
          }
        }

        // После анимации выполняем фактическое удаление из БД
        if (type === "set") {
          await deleteSetMutation.mutateAsync(id);

          // После удаления набора инвалидируем кеш
          queryClient.invalidateQueries({ queryKey: ["cardSets"] });

          // Устанавливаем ID удаленного набора для возможной анимации
          animationStore.setRecentlyDeletedSetId(id);
        } else if (type === "card") {
          await deleteCardMutation.mutateAsync({
            setId: setId,
            cardId: id,
          });

          // После удаления карточки инвалидируем кеш набора
          queryClient.invalidateQueries({ queryKey: ["cardSet", setId] });

          // Устанавливаем ID удаленной карточки для возможной анимации
          animationStore.setRecentlyDeletedCardId(id);
        }
      } catch (error) {
        console.error("Ошибка удаления:", error);
      }
    };

    // Запускаем процесс удаления в фоне
    performDeleteWithAnimation();
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
      setId: card.cardSetId || getModalData("viewCard")?.cardSetId,
    });
  };

  // Функция для открытия модалки создания карточки с поддержкой анимаций
  const openAddCardModal = (setId, onSuccess) => {
    const { openModal } = useUIStore.getState();
    openModal("addCard", {
      setId,
      onSuccess: (newCard) => {
        // Устанавливаем ID новой карточки для анимации
        if (newCard?.id) {
          animationStore.setNewlyCreatedCardId(newCard.id);
        }
        if (onSuccess) onSuccess(newCard);
      },
    });
  };

  // Функция для открытия модалки создания набора с поддержкой анимаций
  const openCreateSetModal = () => {
    const { openModal } = useUIStore.getState();
    openModal("createSet");
  };

  // Экспортируем функции для использования в других компонентах
  useEffect(() => {
    // Сохраняем функции в глобальном объекте для доступа из других компонентов
    window.__animationHelpers = {
      getNewlyCreatedSetId: () => animationStore.getState().newlyCreatedSetId,
      getNewlyCreatedCardId: () => animationStore.getState().newlyCreatedCardId,
      openAddCardModal,
      openCreateSetModal,
    };
  }, []);

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
        title={t("card.create.title") || "Создание карточки"}
        submitText={t("card.create.button") || "Создать"}
      />

      <CardModal
        isOpen={modals.editCard.open}
        onClose={() => closeModal("editCard")}
        onSubmit={handleEditCard}
        title={t("card.edit.title") || "Редактирование карточки"}
        editingCard={getModalData("editCard")}
        submitText={t("card.edit.button") || "Сохранить"}
      />

      {/* Модалка массового создания карточек */}
      <BatchUploadModal
        isOpen={modals.batchUpload?.open || false}
        onClose={() => closeModal("batchUpload")}
        onSubmit={handleBatchUpload}
        isUploading={addMultipleCardsMutation.isPending}
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
        confirmText={t("modal.delete.confirm") || "Удалить"}
        cancelText={t("modal.delete.cancel") || "Отмена"}
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
