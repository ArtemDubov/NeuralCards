import { useState } from "react";
import { accountApi } from "../../../features/auth/api/accountApi";

/**
 * Хук для управления изменением email
 */
export function useEmail(toast, loadProfile, loadUser) {
  const [emailForm, setEmailForm] = useState({
    new_email: "",
    current_password: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Изменение email
  const handleChangeEmail = async () => {
    if (!emailForm.new_email || !emailForm.current_password) {
      toast.warning("Заполните все поля");
      return false;
    }
    if (!emailForm.new_email.includes("@")) {
      toast.warning("Введите корректный email");
      return false;
    }

    try {
      setLoading(true);
      await accountApi.changeEmail(emailForm);
      toast.success("Email успешно изменён!");
      setShowModal(false);
      setEmailForm({ new_email: "", current_password: "" });
      await Promise.all([loadProfile(), loadUser && loadUser()]);
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
    setEmailForm({ new_email: "", current_password: "" });
  };

  return {
    emailForm,
    setEmailForm,
    showModal,
    loading,
    openModal,
    closeModal,
    handleChangeEmail,
  };
}