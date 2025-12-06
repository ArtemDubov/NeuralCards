/**
 * РЕЖИМ ВИКТОРИНЫ (ОБНОВЛЕННЫЙ)
 * Использует общие утилиты для генерации вариантов ответов
 * Добавляет логику выбора варианта и отображения результата
 */

import { useState, useEffect } from "react";
import { useTrainingBase, generateQuizAnswers } from "./shared";

export const useQuizMode = (cards, onAnswer) => {
  // === БАЗОВАЯ ЛОГИКА ИЗ useTrainingBase ===
  const {
    currentCard,
    currentIndex,
    isCompleted,
    progress,
    handleAnswer: baseHandleAnswer,
  } = useTrainingBase(cards, onAnswer);

  // === УНИКАЛЬНАЯ ЛОГИКА РЕЖИМА ВИКТОРИНЫ ===
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);

  // === ГЕНЕРАЦИЯ ВАРИАНТОВ ОТВЕТОВ ПРИ СМЕНЕ КАРТОЧКИ ===
  useEffect(() => {
    if (!currentCard || !cards || cards.length < 4) {
      setAnswers([]);
      return;
    }

    // Используем общую функцию из training-helpers
    const quizAnswers = generateQuizAnswers(currentCard, cards, 4);
    setAnswers(quizAnswers);
    setSelectedAnswer(null);
    setShowResult(false);
  }, [currentCard, cards, currentIndex]);

  // === ОБРАБОТКА ВЫБОРА ВАРИАНТА ===
  const handleAnswer = useCallback(
    (answerIndex) => {
      if (showResult || !currentCard) return;

      setSelectedAnswer(answerIndex);
      setShowResult(true);

      const isCorrect = answers[answerIndex] === currentCard.back;
      const difficulty = isCorrect ? 0 : 2; // easy=0, hard=2

      // Используем базовый обработчик
      baseHandleAnswer(isCorrect, difficulty, isCorrect ? 10 : 0);

      // Автоматический переход через 1.5 секунды
      setTimeout(() => {
        setSelectedAnswer(null);
        setShowResult(false);
      }, 1500);
    },
    [currentCard, answers, showResult, baseHandleAnswer]
  );

  // === ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ ДЛЯ UI ===
  const quizInfo = {
    answers,
    selectedAnswer,
    showResult,
    correctAnswerIndex: answers.indexOf(currentCard?.back || ""),
    isAnswered: selectedAnswer !== null,
  };

  // === СТАТИСТИКА ВИКТОРИНЫ ===
  const quizStats = {
    ...progress,
    hasEnoughCards: cards.length >= 4,
    currentQuestion: currentIndex + 1,
    totalQuestions: cards.length,
  };

  return {
    // Из базового хука
    currentCard,
    isCompleted,
    progress: quizStats,

    // Уникальное для викторины
    ...quizInfo,
    handleAnswer,

    // Дополнительные методы
    skipQuestion: () => {
      baseHandleAnswer(false, 2, 0); // Неправильный ответ за пропуск
    },

    // Флаги
    isQuizMode: true,
  };
};
