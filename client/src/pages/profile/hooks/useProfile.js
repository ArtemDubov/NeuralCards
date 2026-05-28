import { useState, useEffect } from "react";
import { profileApi } from "../../../features/auth/api/profileApi";

/**
 * Хук для управления профилем пользователя
 */
export function useProfile(toast, loadUser) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Загрузка профиля
  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileResponse = await profileApi.getProfile();
      setProfile(profileResponse.data);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error(error.response?.data?.detail || "Ошибка загрузки профиля");
    } finally {
      setLoading(false);
    }
  };

  // Обновление профиля
  const updateProfile = async (formData) => {
    try {
      await profileApi.updateProfile(formData);
      await Promise.all([loadProfile(), loadUser && loadUser()]);
      toast.success("Профиль обновлён!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || error.message);
      return false;
    }
  };

  // Загрузка при монтировании
  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    loading,
    loadProfile,
    updateProfile,
  };
}