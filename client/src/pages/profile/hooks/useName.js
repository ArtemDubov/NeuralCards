import { useState } from "react";
import { profileApi } from "../../../features/auth/api/profileApi";

/**
 * Хук для управления изменением имени
 */
export function useName(toast, loadProfile, loadUser) {
  const [nameForm, setNameForm] = useState({
    new_name: "",
    current_password: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Изменение имени
  const handleChangeName = async () => {
    if (!nameForm.new_name || !nameForm.current_password) {
      toast.warning("Заполните все поля");
      return false;
    }
    if (nameForm.new_name.length < 2) {
      toast.warning("Имя должно содержать минимум 2 символа");
      return false;
    }

    try {
      setLoading(true);
      await profileApi.updateProfile({
        name: nameForm.new_name,
        current_password: nameForm.current_password,
      });
      toast.success("Имя успешно изменено!");
      setShowModal(false);
      setNameForm({ new_name: "", current_password: "" });
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
    setNameForm({ new_name: "", current_password: "" });
  };

  return {
    nameForm,
    setNameForm,
    showModal,
    loading,
    openModal,
    closeModal,
    handleChangeName,
  };
}