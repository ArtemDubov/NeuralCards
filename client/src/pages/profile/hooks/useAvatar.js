import { useState } from "react";
import { profileApi } from "../../../features/auth/api/profileApi";

/**
 * Хук для управления аватаром пользователя
 */
export function useAvatar(toast, loadProfile, loadUser) {
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Выбор изображения
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Загрузка изображения
  const handleImageUpload = async (formData, setFormData) => {
    if (!imagePreview) return;

    try {
      setUploading(true);
      
      // Загружаем изображение напрямую (сервер сам обрежет)
      const response = await fetch(imagePreview);
      const blob = await response.blob();

      // Создаём файл из blob
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

      const responseApi = await profileApi.uploadAvatar(file);
      
      // Обновляем formData с новыми данными
      setFormData({
        ...formData,
        avatar_type: "url",
        avatar_url: responseApi.data.avatar_url,
        // Сохраняем текущие настройки как последние
        last_avatar_emoji: formData.avatar_emoji,
        last_avatar_color: formData.avatar_color,
      });
      
      setImagePreview(null);
      toast.success("Аватар загружен и обработан!");
      
      // Обновляем локальный профиль и глобальный user
      await Promise.all([loadProfile(), loadUser()]);
      return true;
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Ошибка загрузки аватара";
      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : JSON.stringify(errorMessage),
      );
      return false;
    } finally {
      setUploading(false);
    }
  };

  // Удаление фото аватара
  const handleRemoveAvatarPhoto = async (formData, setFormData) => {
    try {
      const response = await profileApi.removeAvatarPhoto();
      
      // Обновляем formData с восстановленными настройками
      setFormData({
        ...formData,
        avatar_type: response.data.avatar_type,
        avatar_emoji: response.data.avatar_emoji,
        avatar_color: response.data.avatar_color,
        avatar_url: "",
      });
      
      toast.success("Фото удалено, восстановлены последние настройки");
      
      // Обновляем локальный профиль и глобальный user
      await Promise.all([loadProfile(), loadUser()]);
      return true;
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Ошибка удаления фото";
      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : JSON.stringify(errorMessage),
      );
      return false;
    }
  };

  return {
    imagePreview,
    setImagePreview,
    uploading,
    handleImageSelect,
    handleImageUpload,
    handleRemoveAvatarPhoto,
  };
}