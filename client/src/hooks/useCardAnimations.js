import { useAnimation } from "./useAnimation";
import { useMemo, useRef } from "react";

export const useCardAnimations = () => {
  const animation = useAnimation();
  const animatedCardsRef = useRef(new Set());

  const handleDeleteCard = useMemo(
    () => (deleteFunction, elementId) => {
      return animation.createDeleteHandler(
        deleteFunction,
        `card-${elementId}`,
        "card"
      );
    },
    [animation]
  );

  const getCardCreateClasses = useMemo(() => {
    const animationClass = animation.getAnimationClass("create", "card");
    const basicClass = animation.getBasicAnimation();
    return animationClass || basicClass;
  }, [animation.getAnimationClass, animation.getBasicAnimation]);

  const animateCardCreation = useMemo(
    () => (elementId) => {
      if (animatedCardsRef.current.has(elementId)) {
        return Promise.resolve();
      }

      animatedCardsRef.current.add(elementId);

      const element = document.querySelector(
        `[data-animation-id="card-${elementId}"]`
      );

      if (element) {
        return animation
          .playAnimation(element, "create", "card")
          .finally(() => {
            setTimeout(() => {
              animatedCardsRef.current.delete(elementId);
            }, 2000);
          });
      }

      animatedCardsRef.current.delete(elementId);
      return Promise.resolve();
    },
    [animation]
  );

  const clearAnimationCache = useMemo(
    () => () => {
      animatedCardsRef.current.clear();
    },
    []
  );

  return {
    ...animation,
    handleDeleteCard,
    getCardCreateClasses,
    animateCardCreation,
    clearAnimationCache,
  };
};
