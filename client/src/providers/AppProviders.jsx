// src/providers/AppProviders.jsx
import React from "react";
import { QueryProvider } from "./QueryProvider";
import { AnimationProvider } from "../contexts/AnimationContext";

export const AppProviders = ({ children }) => {
  return (
    <QueryProvider>
      <AnimationProvider>{children}</AnimationProvider>
    </QueryProvider>
  );
};
