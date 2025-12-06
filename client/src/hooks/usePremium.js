// client/src/hooks/usePremium.js
import { useAuthStore } from "../shared/stores/authStore";

export const usePremium = () => {
  const { user, togglePremium } = useAuthStore();

  const isPremium = user?.isPremium || false;

  // Без premiumUntil показываем просто статус
  const premiumUntil = null;
  const expiresInDays = 0;

  const activatePremium = async () => {
    return await togglePremium("activate");
  };

  const deactivatePremium = async () => {
    return await togglePremium("deactivate");
  };

  return {
    isPremium,
    premiumUntil,
    expiresInDays,
    activatePremium,
    deactivatePremium,
  };
};
