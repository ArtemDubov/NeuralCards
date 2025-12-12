import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useAnimation } from "../../../../hooks/useAnimation";
import { useAppStore } from "../../../../shared/stores/appStore";

const AnimationSettings = () => {
  const {
    enabled,
    isRandom,
    config,
    setEnabled,
    setIsRandom,
    setAnimation,
    resetToDefaults,
    getAllAnimationsForUI,
    availableActions,
  } = useAnimation();

  const { t } = useAppStore();
  const [activeTab, setActiveTab] = useState("create");
  const [internalAnimations, setInternalAnimations] = useState({});

  // Ref для отслеживания предыдущего состояния
  const prevConfigRef = useRef(config);

  // Инициализация анимаций при монтировании (один раз)
  useEffect(() => {
    const animations = getAllAnimationsForUI();
    setInternalAnimations(animations);
  }, [getAllAnimationsForUI]);

  // Проверяем, изменился ли config
  const configChanged = useMemo(() => {
    const changed =
      JSON.stringify(prevConfigRef.current) !== JSON.stringify(config);
    if (changed) {
      prevConfigRef.current = config;
    }
    return changed;
  }, [config]);

  // Стабильные значения через useMemo
  const currentAnimations = useMemo(() => {
    return internalAnimations[activeTab] || [];
  }, [internalAnimations, activeTab]);

  const stableConfig = useMemo(() => config, [config]);

  // Стабильные обработчики через useCallback
  const handleSetAnimation = useCallback(
    (action, elementType, animationId) => {
      const currentTab = activeTab;
      setAnimation(action, elementType, animationId);

      if (action !== currentTab) {
        setActiveTab(action);
      }
    },
    [setAnimation, activeTab]
  );

  const handleSetEnabled = useCallback(
    (checked) => {
      const currentTab = activeTab;
      setEnabled(checked);
      setActiveTab(currentTab);
    },
    [setEnabled, activeTab]
  );

  const handleSetIsRandom = useCallback(
    (checked) => {
      const currentTab = activeTab;
      setIsRandom(checked);
      setActiveTab(currentTab);
    },
    [setIsRandom, activeTab]
  );

  const handleReset = useCallback(() => {
    const currentTab = activeTab;
    resetToDefaults();
    setActiveTab(currentTab);
  }, [resetToDefaults, activeTab]);

  const actionTabs = availableActions || ["create", "delete"];

  return (
    <div className="nt-card nt-util__p-md">
      <h3 className="nt-util__mb-md">
        {t("premium.settings.animations_title")}
      </h3>

      <div className="nt-util__mb-md">
        <label className="nt-checkbox-label">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => handleSetEnabled(e.target.checked)}
            className="nt-checkbox"
          />
          <span className="nt-util__ml-sm">
            {t("premium.settings.enable_animations")}
          </span>
        </label>

        <label className="nt-checkbox-label nt-util__mt-sm">
          <input
            type="checkbox"
            checked={isRandom}
            onChange={(e) => handleSetIsRandom(e.target.checked)}
            className="nt-checkbox"
            disabled={!enabled}
          />
          <span className="nt-util__ml-sm">
            {t("premium.settings.random_animations")}
          </span>
        </label>
      </div>

      {enabled && (
        <>
          <div className="nt-tabs nt-util__mb-md">
            {actionTabs.map((action) => (
              <button
                key={action}
                className={`nt-tab ${
                  activeTab === action ? "nt-tab--active" : ""
                }`}
                onClick={() => setActiveTab(action)}
              >
                {action === "create"
                  ? t("premium.settings.tab.create")
                  : t("premium.settings.tab.delete")}
              </button>
            ))}
          </div>

          {!isRandom && currentAnimations.length > 0 && (
            <div className="nt-util__mb-md">
              <h4 className="nt-util__mb-sm">{t("premium.settings.sets")}</h4>
              <div className="nt-util__flex nt-util__flex-wrap nt-util__gap-xs">
                {currentAnimations.map((anim) => (
                  <button
                    key={anim.id}
                    className={`nt-btn nt-btn--sm ${
                      stableConfig.config[activeTab]?.cardSet === anim.id
                        ? "nt-btn--primary"
                        : "nt-btn--outline"
                    }`}
                    onClick={() =>
                      handleSetAnimation(activeTab, "cardSet", anim.id)
                    }
                    style={{ marginBottom: "4px" }}
                  >
                    <span className="nt-util__mr-xs">{anim.emoji}</span>
                    {anim.label}
                  </button>
                ))}
              </div>

              <h4 className="nt-util__mb-sm nt-util__mt-sm">
                {t("premium.settings.cards")}
              </h4>
              <div className="nt-util__flex nt-util__flex-wrap nt-util__gap-xs">
                {currentAnimations.map((anim) => (
                  <button
                    key={anim.id}
                    className={`nt-btn nt-btn--sm ${
                      stableConfig.config[activeTab]?.card === anim.id
                        ? "nt-btn--primary"
                        : "nt-btn--outline"
                    }`}
                    onClick={() =>
                      handleSetAnimation(activeTab, "card", anim.id)
                    }
                    style={{ marginBottom: "4px" }}
                  >
                    <span className="nt-util__mr-xs">{anim.emoji}</span>
                    {anim.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="nt-util__border-t nt-util__pt-md">
            <div className="nt-util__flex nt-util__justify-between">
              <span className="nt-util__text-sm nt-util__text-secondary">
                {isRandom
                  ? t("premium.settings.random_mode")
                  : t("premium.settings.selected_mode")}
              </span>
              <button
                className="nt-btn nt-btn--secondary nt-btn--sm"
                onClick={handleReset}
              >
                {t("premium.settings.reset")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Обернем в React.memo с глубоким сравнением
const arePropsEqual = () => {
  return true; // Никогда не ререндерим из-за пропсов
};

export default React.memo(AnimationSettings, arePropsEqual);
