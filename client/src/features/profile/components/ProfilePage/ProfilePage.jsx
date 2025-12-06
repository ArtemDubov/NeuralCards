import React, { useEffect } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useUIStore } from "../../../../shared/stores/uiStore";
import { useAuthStore } from "../../../../shared/stores/authStore";
import { usePremium } from "../../../../hooks/usePremium";

const ProfilePage = () => {
  const { t } = useAppStore();
  const { openModal } = useUIStore();
  const { user, fetchProfile } = useAuthStore();
  const {
    isPremium,
    premiumUntil,
    expiresInDays,
    activatePremium,
    deactivatePremium,
  } = usePremium();

  // Загружаем актуальный профиль при заходе на страницу
  useEffect(() => {
    const loadProfile = async () => {
      try {
        await fetchProfile();
      } catch (error) {
        console.error("Ошибка загрузки профиля:", error);
      }
    };

    loadProfile();
  }, [fetchProfile]);

  const handlePremiumClick = () => {
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return "";
    }
  };

  const getButtonStyle = () => {
    if (isPremium) {
      return {
        background: "var(--nt-bg-secondary)",
        color: "var(--nt-text-primary)",
        border: "1px solid var(--nt-border-primary)",
        transition: "all 0.3s ease",
      };
    } else {
      return {
        background: "linear-gradient(135deg, #FFD700, #FFA500)",
        color: "#000",
        border: "2px solid #FFA500",
        fontWeight: "600",
        transition: "all 0.3s ease",
      };
    }
  };

  return (
    <div className="nt-profile__page">
      <div className="nt-page__header">
        <h2 className="nt-page__title">👤 {t("profile.title")}</h2>
      </div>

      <div
        className="nt-content__grid"
        style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--nt-space-xl)" }}
      >
        <div className="nt-content__card">
          <h3 className="nt-util__text-accent">{t("profile.personal.info")}</h3>
          <div className="nt-util__mt-lg">
            <div className="nt-form__group">
              <label className="nt-form__label">{t("profile.name")}</label>
              <input
                type="text"
                value={user?.name || ""}
                readOnly
                className="nt-form__input"
              />
            </div>

            <div className="nt-form__group">
              <label className="nt-form__label">{t("profile.email")}</label>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="nt-form__input"
              />
            </div>

            <div className="nt-form__group">
              <label className="nt-form__label">
                {t("profile.registration.date")}
              </label>
              <input
                type="text"
                value={
                  user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("ru-RU")
                    : ""
                }
                readOnly
                className="nt-form__input"
              />
            </div>
          </div>
        </div>

        <div className="nt-content__card">
          <h3 className="nt-util__text-accent">{t("profile.statistics")}</h3>
          <div className="nt-profile__stats">
            <div className="nt-profile__stat-card">
              <div className="nt-profile__stat-value">0</div>
              <div className="nt-profile__stat-label">
                {t("profile.stats.sets.created")}
              </div>
            </div>
            <div className="nt-profile__stat-card">
              <div className="nt-profile__stat-value">0</div>
              <div className="nt-profile__stat-label">
                {t("profile.stats.cards.created")}
              </div>
            </div>
            <div className="nt-profile__stat-card">
              <div className="nt-profile__stat-value">0</div>
              <div className="nt-profile__stat-label">
                {t("profile.stats.trainings.completed")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Блок Премиум */}
      <div className="nt-content__card nt-util__mt-lg">
        <h3 className="nt-util__text-accent">
          ⭐ {t("premium.title") || "Премиум"}
        </h3>
        <div className="nt-util__mt-md">
          {isPremium ? (
            <div className="nt-premium-info">
              <div
                className="nt-premium-badge nt-util__mb-md"
                style={{
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  color: "#000",
                }}
              >
                <span className="nt-premium-badge__icon">⭐</span>
                <span className="nt-premium-badge__text">
                  {t("premium.status.active") || "Премиум активен"}
                </span>
              </div>

              {premiumUntil && expiresInDays > 0 && (
                <div className="nt-premium-expiry nt-util__mb-md">
                  <p
                    className="nt-util__text-secondary"
                    style={{ marginBottom: "8px" }}
                  >
                    {t("premium.expires") || "Действует до"}{" "}
                    <strong>{formatDate(premiumUntil)}</strong>
                  </p>
                  <p
                    className="nt-util__text-accent"
                    style={{ fontWeight: "600" }}
                  >
                    {t("premium.days_left")?.replace("{days}", expiresInDays) ||
                      `Осталось ${expiresInDays} дней`}
                  </p>
                </div>
              )}

              <button
                className="nt-btn"
                onClick={handlePremiumClick}
                style={getButtonStyle()}
                onMouseOver={(e) => {
                  if (isPremium) {
                    e.currentTarget.style.background = "var(--nt-bg-primary)";
                    e.currentTarget.style.borderColor =
                      "var(--nt-color-accent)";
                  }
                }}
                onMouseOut={(e) => {
                  if (isPremium) {
                    e.currentTarget.style.background = "var(--nt-bg-secondary)";
                    e.currentTarget.style.borderColor =
                      "var(--nt-border-primary)";
                  }
                }}
              >
                {isPremium
                  ? t("premium.deactivate.button") || "Отключить Премиум"
                  : t("premium.activate.button") || "Активировать Премиум"}
              </button>
            </div>
          ) : (
            <div className="nt-premium-info">
              <p className="nt-util__mb-md nt-util__text-secondary">
                {t("premium.description") ||
                  "Получите доступ к расширенным функциям обучения"}
              </p>
              <button
                className="nt-btn"
                onClick={handlePremiumClick}
                style={getButtonStyle()}
                onMouseOver={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #FFC800, #FF8C00)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(255, 165, 0, 0.3)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #FFD700, #FFA500)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {t("premium.activate.button") || "Активировать Премиум"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="nt-content__card nt-util__mt-xl">
        <button className="nt-btn nt-btn--primary" style={{ width: "auto" }}>
          {t("profile.save")}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
