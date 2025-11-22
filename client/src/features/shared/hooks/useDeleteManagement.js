import { useState } from "react";

export const useDeleteManagement = () => {
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null,
    id: null,
    title: "",
    message: "",
  });

  const showDeleteModal = (type, id, title, message) => {
    setDeleteModal({
      isOpen: true,
      type,
      id,
      title,
      message,
    });
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, type: null, id: null });
  };

  return {
    deleteModal,
    setDeleteModal,
    showDeleteModal,
    handleCancelDelete,
  };
};
