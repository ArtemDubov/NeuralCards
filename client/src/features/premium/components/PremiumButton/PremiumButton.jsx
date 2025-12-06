import React from "react";
import { usePremium } from "../../../../hooks/usePremium";
import { useUIStore } from "../../../../shared/stores/uiStore";
import { useAppStore } from "../../../../shared/stores/appStore";

const PremiumButton = ({ compact = false, className = "" }) => {
  const { openModal } = useUIStore();
  const { t } = useAppStore();
  const { isPremium, activatePremium, deactivatePremium } = usePremium();

  const handleClick = () => {
    if (isPremium) {
      openModal("premiumDeactivate", {
        title: t("premium.deactivate.title") || "Отключить Премиум?",
        message:
          t("premium.deactivate.message") ||
          "Вы уверены, что хотите отключить Премиум подписку?",
        onConfirm: async () => {
          // УБИРАЕМ АЛЕРТ
          await deactivatePremium();
        },
      });
    } else {
      openModal("premiumConfirmation", {
        title: t("premium.confirm.title") || "Подключить Премиум?",
        message:
          t("premium.confirm.message") ||
          "Вы уверены, что хотите подключить Премиум подписку?",
        onConfirm: async () => {
          // УБИРАЕМ АЛЕРТ
          await activatePremium();
        },
      });
    }
  };

  if (compact) {
    return (
      <button
        className={`nt-premium-button nt-premium-button--compact ${className} ${
          isPremium ? "nt-premium-button--active" : ""
        }`}
        onClick={handleClick}
        title={isPremium ? "Премиум активен" : "Активировать Премиум"}
      >
        <span className="nt-premium-button__icon">⭐</span>
        {!compact && (
          <span className="nt-premium-button__text">
            {isPremium ? "Премиум" : "Премиум"}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      className={`nt-premium-button ${className} ${
        isPremium ? "nt-premium-button--active" : ""
      }`}
      onClick={handleClick}
    >
      <span className="nt-premium-button__icon">⭐</span>
      <span className="nt-premium-button__text">
        {isPremium
          ? t("premium.active") || "Премиум"
          : t("premium.inactive") || "Получить Премиум"}
      </span>
    </button>
  );
};

export default PremiumButton;
