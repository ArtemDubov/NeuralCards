import { useState, useEffect } from "react";
import { accountApi } from "../../../features/auth/api/accountApi";
import { calculatePasswordStrength } from "../utils/passwordUtils";

/**
 * Хук для управления изменением пароля
 */
export function usePassword(toast) {
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Обновление сложности пароля при вводе
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(passwordForm.new_password));
  }, [passwordForm.new_password]);

  // Изменение пароля
  const handleChangePassword = async () => {
    if (
      !passwordForm.current_password ||
      !passwordForm.new_password ||
      !passwordForm.confirm_password
    ) {
      toast.warning("Заполните все поля");
      return false;
    }
    if (passwordForm.new_password.length < 6) {
      toast.warning("Пароль должен содержать минимум 6 символов");
      return false;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.warning("Пароли не совпадают");
      return false;
    }

    try {
      setLoading(true);
      await accountApi.changePassword(passwordForm);
      toast.success("Пароль успешно изменён!");
      setShowModal(false);
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
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
    setPasswordForm({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
  };

  return {
    passwordForm,
    setPasswordForm,
    passwordStrength,
    showModal,
    loading,
    openModal,
    closeModal,
    handleChangePassword,
  };
}
