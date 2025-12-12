import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useAnimationStore } from "../shared/stores/animationStore";
import { usePremium } from "../hooks/usePremium";

const AnimationContext = createContext({});

export const useAnimationContext = () => useContext(AnimationContext);

export const AnimationProvider = ({ children }) => {
  const { isPremium } = usePremium();
  const { enabled } = useAnimationStore();

  useEffect(() => {
    if (isPremium && enabled) {
      document.documentElement.classList.add("premium-enabled");

      setTimeout(() => {
        const animationWrappers = document.querySelectorAll(
          ".premium-animation-wrapper"
        );
        animationWrappers.forEach((el) => {
          el.classList.add("premium-animation-refresh");
          setTimeout(
            () => el.classList.remove("premium-animation-refresh"),
            100
          );
        });
      }, 100);

      return () => {
        document.documentElement.classList.remove("premium-enabled");
      };
    } else if (!isPremium) {
      document.documentElement.classList.remove("premium-enabled");
    } else if (!enabled) {
      document.documentElement.classList.remove("premium-enabled");
    }
  }, [isPremium, enabled]);

  const value = useMemo(
    () => ({
      isPremium,
      enabled,
      hasPremiumAnimations: isPremium && enabled,
      refreshAnimations: () => {
        if (isPremium && enabled) {
          document
            .querySelectorAll(".premium-animation-wrapper")
            .forEach((el) => {
              el.classList.add("premium-animation-refresh");
              setTimeout(
                () => el.classList.remove("premium-animation-refresh"),
                100
              );
            });
        }
      },
    }),
    [isPremium, enabled]
  );

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};
