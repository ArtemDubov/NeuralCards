import { useState } from "react";

export const useModalManagement = () => {
  const [isViewCardModalOpen, setIsViewCardModalOpen] = useState(false);
  const [viewedCard, setViewedCard] = useState(null);
  const [isEditCardModalOpen, setIsEditCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  // Просмотр карточки
  const handleViewCard = (card) => {
    setViewedCard(card);
    setIsViewCardModalOpen(true);
  };

  // Редактирование карточки
  const handleEditCard = (card) => {
    setEditingCard(card);
    setIsViewCardModalOpen(false);
    setIsEditCardModalOpen(true);
  };

  // Закрытие всех модалок
  const closeAllModals = () => {
    setIsViewCardModalOpen(false);
    setIsEditCardModalOpen(false);
    setIsAddCardModalOpen(false);
    setViewedCard(null);
    setEditingCard(null);
  };

  return {
    // Состояния
    isViewCardModalOpen,
    setIsViewCardModalOpen,
    viewedCard,
    setViewedCard,
    isEditCardModalOpen,
    setIsEditCardModalOpen,
    editingCard,
    setEditingCard,
    isAddCardModalOpen,
    setIsAddCardModalOpen,

    // Функции
    handleViewCard,
    handleEditCard,
    closeAllModals,
  };
};
