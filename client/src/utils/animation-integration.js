import { useAnimation } from "../hooks/useAnimation";

/**
 * Хук для интеграции анимаций с мутациями React Query
 */
export const useAnimatedMutation = (mutationHook, options = {}) => {
  const { action, elementType } = options;
  const { playAnimation, isAnimationEnabled } = useAnimation();

  const mutation = mutationHook();

  const originalMutate = mutation.mutate;
  const originalMutateAsync = mutation.mutateAsync;

  // Асинхронная версия с анимацией
  const mutateAsyncWithAnimation = async (variables, mutationOptions = {}) => {
    const { animationElementId, ...restOptions } = mutationOptions;

    if (isAnimationEnabled && animationElementId && action && elementType) {
      const element = document.querySelector(
        `[data-animation-id="${animationElementId}"]`
      );

      if (element) {
        await playAnimation(element, action, elementType);
      }
    }

    return originalMutateAsync(variables, restOptions);
  };

  // Синхронная версия с анимацией
  const mutateWithAnimation = (variables, mutationOptions = {}) => {
    const { animationElementId, onSuccess, ...restOptions } = mutationOptions;

    const enhancedOnSuccess = (data, variables, context) => {
      // Запускаем анимацию после успешной мутации
      if (isAnimationEnabled && animationElementId && action && elementType) {
        const element = document.querySelector(
          `[data-animation-id="${animationElementId}"]`
        );

        if (element) {
          playAnimation(element, action, elementType);
        }
      }

      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    };

    originalMutate(variables, {
      ...restOptions,
      onSuccess: enhancedOnSuccess,
    });
  };

  return {
    ...mutation,
    mutate: mutateWithAnimation,
    mutateAsync: mutateAsyncWithAnimation,
  };
};
