import { usePremium } from "./usePremium";
import { useAnimationStore } from "../shared/stores/animationStore";

export const useAnimation = () => {
  const { isPremium } = usePremium();
  const {
    enabled,
    getAnimation,
    getAnimationInfo,
    getAnimationTypes,
    getAvailableActions,
    getAvailableElementTypes,
    getConfigForUI,
    updateConfig,
    setAnimation,
    setEnabled,
    setIsRandom,
    resetToDefaults,
  } = useAnimationStore();

  const isAnimationEnabled = () => isPremium && enabled;

  const ANIMATION_PRIORITY = {
    delete: 100,
    update: 50,
    create: 10,
  };

  const playAnimation = async (element, action, elementType, options = {}) => {
    const {
      duration,
      onStart,
      onComplete,
      onError,
      skipPremiumCheck = false,
      force = false,
    } = options;

    if ((!skipPremiumCheck && !isPremium) || !enabled || !element) {
      return Promise.resolve({ skipped: true });
    }

    // Проверяем, не выполняется ли уже анимация с более высоким приоритетом
    const currentAction = element.dataset.currentAnimation;
    const currentPriority = ANIMATION_PRIORITY[currentAction] || 0;
    const newPriority = ANIMATION_PRIORITY[action] || 0;

    if (currentPriority > newPriority && !force) {
      return Promise.resolve({
        skipped: true,
        reason: "higher-priority-active",
      });
    }

    // Если есть текущая анимация - немедленно останавливаем её
    if (currentAction && currentAction !== action) {
      element.style.animation = "none";
      const computedStyle = window.getComputedStyle(element);
      element.style.opacity = computedStyle.opacity;

      const animClasses = Array.from(element.classList).filter((c) =>
        c.startsWith("premium-animation--")
      );
      element.classList.remove(...animClasses);
    }

    // Блокируем элемент для этой анимации
    element.dataset.currentAnimation = action;

    const animationTypeId = getAnimation(action, elementType);
    if (!animationTypeId) {
      delete element.dataset.currentAnimation;
      return Promise.resolve({ skipped: true });
    }

    const animationInfo = getAnimationInfo(action, animationTypeId);
    const animationDuration = duration || animationInfo?.duration || 500;

    const animationClass = `premium-animation--${action}-${animationTypeId}`;
    const stateClass = `premium-animation--${
      action.endsWith("e") ? action : action + "ing"
    }`;

    try {
      if (onStart) onStart();

      // Для удаления: высший приоритет, немедленная блокировка
      if (action === "delete") {
        element.style.pointerEvents = "none";
        element.style.willChange = "opacity, transform";

        // Если была анимация создания - мгновенно устанавливаем opacity: 1
        if (element.classList.contains("premium-animation--creating")) {
          element.style.opacity = "1";
        }
      }

      element.classList.add(animationClass, stateClass);

      return new Promise((resolve) => {
        let animationEnded = false;
        let cleanupTimeout = null;

        const cleanup = () => {
          if (animationEnded) return;
          animationEnded = true;

          if (cleanupTimeout) {
            clearTimeout(cleanupTimeout);
            cleanupTimeout = null;
          }

          element.removeEventListener("animationend", handleAnimationEnd);
          element.removeEventListener("animationcancel", handleAnimationEnd);

          // Разблокируем элемент
          delete element.dataset.currentAnimation;

          // Удаляем классы только для НЕ-удаления
          if (action !== "delete") {
            element.classList.remove(animationClass, stateClass);
          }
        };

        const handleAnimationEnd = (event) => {
          if (event.target !== element) return;

          cleanup();

          // Для удаления оставляем стили как есть (fill-mode сохранит opacity:0)
          if (action === "delete") {
            element.style.pointerEvents = "";
            element.style.willChange = "";
          }

          if (onComplete) onComplete();

          resolve({
            success: true,
            action,
            elementType,
            animationTypeId,
            duration: animationDuration,
          });
        };

        element.addEventListener("animationend", handleAnimationEnd);
        element.addEventListener("animationcancel", handleAnimationEnd);

        // Fallback таймаут
        cleanupTimeout = setTimeout(() => {
          cleanup();
          if (onComplete) onComplete();
          resolve({
            success: true,
            action,
            elementType,
            animationTypeId,
            duration: animationDuration,
            fallback: true,
          });
        }, animationDuration + 100);
      });
    } catch (error) {
      delete element.dataset.currentAnimation;
      if (onError) onError(error);
      return Promise.resolve({ success: false, error: error.message });
    }
  };

  const createDeleteHandler = (
    deleteFunction,
    elementId,
    elementType,
    options = {}
  ) => {
    return async (...args) => {
      const { beforeDelete, afterDelete, skipAnimation } = options;

      const element = document.querySelector(
        `[data-animation-id="${elementId}"]`
      );

      if (!element) {
        return deleteFunction(...args);
      }

      if (beforeDelete) await beforeDelete(element);

      if (isPremium && enabled && !skipAnimation) {
        // Флаг force гарантирует, что удаление выполнится, даже если есть другая анимация
        return playAnimation(element, "delete", elementType, {
          onComplete: () => {
            const result = deleteFunction(...args);
            if (afterDelete) afterDelete(result, element);
          },
          force: true,
        });
      } else {
        const result = deleteFunction(...args);
        if (afterDelete) afterDelete(result, element);
        return result;
      }
    };
  };

  const getAnimationClass = (action, elementType, additionalClasses = "") => {
    if (!isPremium || !enabled) {
      return additionalClasses || null;
    }

    const animationId = getAnimation(action, elementType);
    if (!animationId) return additionalClasses || null;

    const animationClass = `premium-animation--${action}-${animationId}`;
    const stateClass = `premium-animation--${
      action.endsWith("e") ? action : action + "ing"
    }`;

    return `${animationClass} ${stateClass} ${additionalClasses}`.trim();
  };

  const getBasicAnimation = (type = "fade") => {
    const basicAnimations = {
      fade: "basic-animation--fade",
      none: "",
    };
    return basicAnimations[type] || basicAnimations.fade;
  };

  return {
    isAnimationEnabled,
    isPremium,
    enabled,
    config: getConfigForUI(),
    availableActions: getAvailableActions(),
    availableElementTypes: getAvailableElementTypes(),

    playAnimation,
    getAnimationClass,
    createDeleteHandler,
    getBasicAnimation,

    setAnimation,
    setEnabled,
    setIsRandom,
    resetToDefaults,
    updateConfig,

    getAnimationTypes,

    getAllAnimationsForUI: () => {
      const actions = getAvailableActions();
      const animations = {};
      actions.forEach((action) => {
        animations[action] = getAnimationTypes(action);
      });
      return animations;
    },
    getAnimationInfo,
  };
};
