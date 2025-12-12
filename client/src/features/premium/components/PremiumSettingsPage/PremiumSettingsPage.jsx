import React, { memo } from "react";
import { useAuthStore } from "../../../../shared/stores/authStore";
import AnimationSettings from "../AnimationSettings/AnimationSettings";
import "./PremiumSettingsPage.css";

// Выносим статические тексты
const TEXTS = {
  pageTitle: "Премиум настройки",

  status: {
    title: "Статус подписки",
    active: "Активна",
    active_message: "Премиум функции доступны",
    inactive: "Неактивна",
    inactive_message: "Активируйте премиум для доступа к функциям",
    deactivate: "Деактивировать",
    activate: "Активировать",
  },

  features: {
    title: "Премиум функции",
    locked_title: "Доступные функции",
    animations: "Анимации",
    animations_desc: "Плавные анимации элементов",
    speed: "Высокая скорость",
    speed_desc: "Приоритетная обработка",
    themes: "Эксклюзивные темы",
    themes_desc: "Уникальные цветовые схемы",
    statistics: "Расширенная статистика",
    statistics_desc: "Подробная аналитика",
  },
};

// Выносим компоненты в отдельные мемоизированные компоненты
const PremiumActiveView = memo(({ onDeactivate, isLoading }) => (
  <>
    <div className="nt-card nt-util__p-lg nt-util__mb-lg">
      <h2 className="nt-util__mb-md">{TEXTS.status.title}</h2>
      <div className="nt-util__flex nt-util__items-center nt-util__justify-between">
        <div>
          <span className="nt-badge nt-badge--success">
            {TEXTS.status.active}
          </span>
          <p className="nt-util__text-secondary nt-util__mt-xs">
            {TEXTS.status.active_message}
          </p>
        </div>
        <button
          className="nt-btn nt-btn--danger"
          onClick={onDeactivate}
          disabled={isLoading}
        >
          {isLoading ? "..." : TEXTS.status.deactivate}
        </button>
      </div>
    </div>

    <div className="nt-card nt-util__p-lg nt-util__mb-lg">
      <AnimationSettings />
    </div>

    <div className="nt-card nt-util__p-lg">
      <h2 className="nt-util__mb-md">{TEXTS.features.title}</h2>
      <div className="nt-util__grid nt-util__grid-cols-2 nt-util__gap-md">
        <div className="nt-feature">
          <div className="nt-feature__icon">🎭</div>
          <h3 className="nt-feature__title">{TEXTS.features.animations}</h3>
          <p className="nt-feature__desc">{TEXTS.features.animations_desc}</p>
        </div>
        <div className="nt-feature">
          <div className="nt-feature__icon">⚡</div>
          <h3 className="nt-feature__title">{TEXTS.features.speed}</h3>
          <p className="nt-feature__desc">{TEXTS.features.speed_desc}</p>
        </div>
        <div className="nt-feature">
          <div className="nt-feature__icon">🎨</div>
          <h3 className="nt-feature__title">{TEXTS.features.themes}</h3>
          <p className="nt-feature__desc">{TEXTS.features.themes_desc}</p>
        </div>
        <div className="nt-feature">
          <div className="nt-feature__icon">📊</div>
          <h3 className="nt-feature__title">{TEXTS.features.statistics}</h3>
          <p className="nt-feature__desc">{TEXTS.features.statistics_desc}</p>
        </div>
      </div>
    </div>
  </>
));

const PremiumInactiveView = memo(({ onActivate, isLoading }) => (
  <>
    <div className="nt-card nt-util__p-lg nt-util__mb-lg">
      <h2 className="nt-util__mb-md">{TEXTS.features.locked_title}</h2>
      <div className="nt-util__flex nt-util__items-center nt-util__justify-between">
        <div>
          <span className="nt-badge nt-badge--secondary">
            {TEXTS.status.inactive}
          </span>
          <p className="nt-util__text-secondary nt-util__mt-xs">
            {TEXTS.status.inactive_message}
          </p>
        </div>
        <button
          className="nt-btn nt-btn--primary"
          onClick={onActivate}
          disabled={isLoading}
        >
          {isLoading ? "..." : TEXTS.status.activate}
        </button>
      </div>
    </div>

    <div className="nt-card nt-util__p-lg">
      <h2 className="nt-util__mb-md">{TEXTS.features.locked_title}</h2>
      <div className="nt-util__grid nt-util__grid-cols-2 nt-util__gap-md">
        <div className="nt-feature nt-feature--locked">
          <div className="nt-feature__icon">🔒</div>
          <h3 className="nt-feature__title">{TEXTS.features.animations}</h3>
          <p className="nt-feature__desc">{TEXTS.features.animations_desc}</p>
        </div>
        <div className="nt-feature nt-feature--locked">
          <div className="nt-feature__icon">🔒</div>
          <h3 className="nt-feature__title">{TEXTS.features.speed}</h3>
          <p className="nt-feature__desc">{TEXTS.features.speed_desc}</p>
        </div>
        <div className="nt-feature nt-feature--locked">
          <div className="nt-feature__icon">🔒</div>
          <h3 className="nt-feature__title">{TEXTS.features.themes}</h3>
          <p className="nt-feature__desc">{TEXTS.features.themes_desc}</p>
        </div>
        <div className="nt-feature nt-feature--locked">
          <div className="nt-feature__icon">🔒</div>
          <h3 className="nt-feature__title">{TEXTS.features.statistics}</h3>
          <p className="nt-feature__desc">{TEXTS.features.statistics_desc}</p>
        </div>
      </div>
    </div>
  </>
));

const PremiumSettingsPage = () => {
  // ВМЕСТО usePremium() берем напрямую из authStore
  const { user, togglePremium, loading: authLoading } = useAuthStore();

  const isPremium = user?.isPremium || false;

  // Мемоизируем колбэки
  const activatePremium = React.useCallback(async () => {
    await togglePremium("activate");
  }, [togglePremium]);

  const deactivatePremium = React.useCallback(async () => {
    await togglePremium("deactivate");
  }, [togglePremium]);

  return (
    <div className="nt-page nt-premium-settings">
      <div className="nt-page__header">
        <h1 className="nt-page__title">{TEXTS.pageTitle}</h1>
      </div>

      <div className="nt-page__content">
        {isPremium ? (
          <PremiumActiveView
            onDeactivate={deactivatePremium}
            isLoading={authLoading}
          />
        ) : (
          <PremiumInactiveView
            onActivate={activatePremium}
            isLoading={authLoading}
          />
        )}
      </div>
    </div>
  );
};

export default memo(PremiumSettingsPage);
