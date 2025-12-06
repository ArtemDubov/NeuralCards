/**
 * УНИВЕРСАЛЬНЫЙ ТАЙМЕР ДЛЯ РЕЖИМОВ С ОГРАНИЧЕНИЕМ ВРЕМЕНИ
 */

import { useState, useEffect, useCallback, useRef } from "react";

export const useTrainingTimer = (config = {}) => {
  const {
    initialTime = 60,
    mode = "global",
    autoStart = true,
    onTimeout = null,
    onTick = null,
  } = config;

  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(autoStart);
  const [isTimeout, setIsTimeout] = useState(false);
  const timerRef = useRef(null);

  // === ОСНОВНОЙ ТАЙМЕР ===
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;

        if (onTick) onTick(newTime);

        if (newTime <= 0) {
          clearInterval(timerRef.current);
          setIsTimeout(true);
          setIsActive(false);
          if (onTimeout) onTimeout();
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeLeft, onTimeout, onTick]);

  // === УПРАВЛЕНИЕ ТАЙМЕРОМ ===
  const startTimer = useCallback(() => {
    setIsActive(true);
    setIsTimeout(false);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const resetTimer = useCallback(
    (newTime = initialTime) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeLeft(newTime);
      setIsActive(autoStart);
      setIsTimeout(false);
    },
    [initialTime, autoStart]
  );

  const addTime = useCallback((seconds) => {
    setTimeLeft((prev) => prev + seconds);
  }, []);

  // === ФУНКЦИЯ ФОРМАТИРОВАНИЯ ВРЕМЕНИ ===
  const formatTime = useCallback(
    (seconds = timeLeft) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    },
    [timeLeft]
  );

  // === РАСЧЕТ СТАТИСТИКИ ===
  const timeStats = {
    timeLeft,
    initialTime,
    percentage: Math.round((timeLeft / initialTime) * 100),
    isActive,
    isTimeout,
    minutes: Math.floor(timeLeft / 60),
    seconds: timeLeft % 60,
    formatted: formatTime(), // ДОБАВЛЯЕМ СЮДА
  };

  return {
    // Состояние
    timeLeft,
    isActive,
    isTimeout,

    // Управление
    startTimer,
    pauseTimer,
    resetTimer,
    addTime,
    setIsActive,

    // Статистика
    timeStats,

    // Функция форматирования
    formatTime,
  };
};
