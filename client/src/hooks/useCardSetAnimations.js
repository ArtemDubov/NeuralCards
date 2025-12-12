import { useAnimation } from "./useAnimation";

export const useCardSetAnimations = () => {
  const animation = useAnimation();

  const handleDeleteCardSet = (deleteFunction, elementId) => {
    return animation.createDeleteHandler(
      deleteFunction,
      `cardSet-${elementId}`,
      "cardSet"
    );
  };

  const getCardSetCreateClasses = () => {
    const animationClass = animation.getAnimationClass("create", "cardSet");
    const basicClass = animation.getBasicAnimation();
    return animationClass || basicClass;
  };

  const animateCardSetCreation = (elementId) => {
    const element = document.querySelector(
      `[data-animation-id="cardSet-${elementId}"]`
    );
    if (element) {
      return animation.playAnimation(element, "create", "cardSet");
    }
    return Promise.resolve();
  };

  return {
    ...animation,
    handleDeleteCardSet,
    getCardSetCreateClasses,
    animateCardSetCreation,
  };
};
