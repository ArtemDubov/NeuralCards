import { useState } from "react";
import { accountApi } from "../../../features/auth/api/accountApi";

/**
 * Хук для управления удалением аккаунта
 */
export function useDeleteAccount(toast, logout) {
  const [deletePassword, setDeletePassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Удаление аккаунта
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.warning("Введите пароль для подтверждения");
      return false;
    }

    try {
      setLoading(true);
      await accountApi.deleteAccount({ password: deletePassword });
      toast.success("Аккаунт успешно удалён!");
      logout();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Открыть модалку
  const openModal = () => {
    setShowModal(true);
  };

  // Закрыть модалку
  const closeModal = () => {
    setShowModal(false);
    setDeletePassword("");
  };

  return {
    deletePassword,
    setDeletePassword,
    showModal,
    loading,
    openModal,
    closeModal,
    handleDeleteAccount,
  };
}
