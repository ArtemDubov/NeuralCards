import React, { useEffect, useState } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useAuthStore } from "../../../../shared/stores/authStore";
import { usePremium } from "../../../../hooks/usePremium";
import AnimatedModal from "../../../shared/components/AnimatedModal/AnimatedModal";
import AvatarPicker from "./AvatarPicker";
import SecuritySettings from "../SecuritySettings/SecuritySettings";

const ProfilePage = () => {
  const { t } = useAppStore();
  const { user, fetchProfile } = useAuthStore();
  const { isPremium } = usePremium();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

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

  // Функция для отображения аватара (оставляем как есть)
  const renderAvatar = () => {
    console.log("Рендеринг аватара:", user);

    // 1. Есть URL аватара (изображение)
    if (user?.avatarUrl) {
      let avatarSrc = user.avatarUrl;

      if (
        avatarSrc &&
        !avatarSrc.startsWith("http") &&
        !avatarSrc.startsWith("/api/")
      ) {
        avatarSrc = avatarSrc.startsWith("/")
          ? `/api${avatarSrc}`
          : `/api/${avatarSrc}`;
      }

      console.log("Показываем изображение аватара:", avatarSrc);
      return (
        <div className="nt-profile__avatar-combined">
          <img
            src={avatarSrc}
            alt="Avatar"
            className="nt-profile__avatar-image"
          />
          {/* Эмодзи поверх изображения, если есть */}
          {user?.avatarEmoji && (
            <div className="nt-profile__avatar-emoji-overlay">
              <span className="nt-profile__avatar-emoji-large">
                {user.avatarEmoji}
              </span>
            </div>
          )}
        </div>
      );
    }

    // 2. Если есть цвет фона (avatarColor)
    if (user?.avatarColor) {
      return (
        <div
          className="nt-profile__avatar-color"
          style={{
            backgroundColor: user.avatarColor,
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {user?.avatarEmoji ? (
            <span className="nt-profile__avatar-emoji-large">
              {user.avatarEmoji}
            </span>
          ) : (
            <span className="nt-profile__avatar-color-initial">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
        </div>
      );
    }

    // 3. Если только эмодзи (без цвета)
    if (user?.avatarEmoji) {
      return (
        <div className="nt-profile__avatar-emoji-only">
          <span className="nt-profile__avatar-emoji-large">
            {user.avatarEmoji}
          </span>
        </div>
      );
    }

    // 4. Автоматический цвет из имени
    if (user?.name) {
      const colors = ["#4FC3F7", "#7C3AED", "#10B981", "#F97316", "#EC4899"];
      const colorIndex = user.name.charCodeAt(0) % colors.length;
      const backgroundColor = colors[colorIndex];

      return (
        <div
          className="nt-profile__avatar-color"
          style={{
            backgroundColor: backgroundColor,
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span className="nt-profile__avatar-color-initial">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
      );
    }

    // 5. По умолчанию
    return (
      <div className="nt-profile__avatar-default">
        <span className="nt-profile__avatar-initial">?</span>
      </div>
    );
  };

  return (
    <div className="nt-profile__page">
      {/* ЗАГОЛОВОК */}
      <div className="nt-page__header">
        <div className="nt-util__flex nt-util__justify-between nt-util__items-center nt-util__mb-sm">
          <h2 className="nt-page__title">
            <i className="fas fa-user nt-util__mr-sm"></i>
            {t("profile.title")}
          </h2>
          <div className="nt-premium-status-indicator">
            <span
              className={`nt-badge ${
                isPremium ? "nt-badge--success" : "nt-badge--secondary"
              }`}
            >
              {isPremium
                ? t("premium.status.active.short")
                : t("premium.status.inactive.short")}
            </span>
          </div>
        </div>

        {/* ВКЛАДКИ ПРОФИЛЯ */}
        <div className="nt-util__flex nt-util__gap-sm nt-util__mb-lg">
          <button
            className={`nt-btn ${
              activeTab === "profile" ? "nt-btn--primary" : "nt-btn--outline"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <i className="fas fa-user nt-util__mr-sm"></i>
            {t("profile.tabs.profile")}
          </button>
          <button
            className={`nt-btn ${
              activeTab === "security" ? "nt-btn--primary" : "nt-btn--outline"
            }`}
            onClick={() => setActiveTab("security")}
          >
            <i className="fas fa-shield-alt nt-util__mr-sm"></i>
            {t("profile.tabs.security")}
          </button>
        </div>
      </div>

      {/* СОДЕРЖИМОЕ ВКЛАДОК */}
      {activeTab === "profile" ? (
        <div
          className="nt-content__grid"
          style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--nt-space-xl)" }}
        >
          {/* ЛЕВАЯ КОЛОНКА - ПРОФИЛЬ */}
          <div className="nt-content__card">
            <h3 className="nt-util__text-accent nt-util__mb-lg">
              <i className="fas fa-user-circle nt-util__mr-sm"></i>
              {t("profile.personal.info")}
            </h3>

            {/* СЕКЦИЯ АВАТАРА */}
            <div className="nt-profile__avatar-section nt-util__mb-lg">
              <div className="nt-profile__avatar-container">
                <div
                  className="nt-profile__avatar-display"
                  onClick={() => setShowAvatarPicker(true)}
                  title={t("profile.avatar.change_title")}
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    border: "3px solid var(--nt-border-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    cursor: "pointer",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {renderAvatar()}
                </div>
                <p className="nt-profile__avatar-hint nt-util__mt-sm nt-util__text-center">
                  {t("profile.avatar.click_to_change")}
                </p>
              </div>
            </div>

            {/* ИНФОРМАЦИЯ */}
            <div>
              <div className="nt-form__group">
                <label className="nt-form__label">
                  <i className="fas fa-user nt-util__mr-sm"></i>
                  {t("profile.name")}
                </label>
                <input
                  type="text"
                  value={user?.name || ""}
                  readOnly
                  className="nt-form__input"
                />
              </div>
              <div className="nt-form__group">
                <label className="nt-form__label">
                  <i className="fas fa-envelope nt-util__mr-sm"></i>
                  {t("profile.email")}
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="nt-form__input"
                />
              </div>
              <div className="nt-form__group">
                <label className="nt-form__label">
                  <i className="fas fa-calendar-alt nt-util__mr-sm"></i>
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

          {/* ПРАВАЯ КОЛОНКА - СТАТИСТИКА */}
          <div className="nt-content__card">
            <h3 className="nt-util__text-accent nt-util__mb-lg">
              <i className="fas fa-chart-line nt-util__mr-sm"></i>
              {t("profile.statistics")}
            </h3>
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
      ) : (
        /* ВКЛАДКА БЕЗОПАСНОСТИ */
        <SecuritySettings />
      )}

      {/* МОДАЛКА АВАТАРА */}
      <AnimatedModal
        isOpen={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        size="large"
      >
        <AvatarPicker
          currentAvatar={user}
          onClose={() => {
            setShowAvatarPicker(false);
            fetchProfile();
          }}
        />
      </AnimatedModal>
    </div>
  );
};

export default ProfilePage;
