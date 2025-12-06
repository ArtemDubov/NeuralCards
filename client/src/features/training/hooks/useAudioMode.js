/**
 * АУДИО РЕЖИМ (ОБНОВЛЕННЫЙ)
 * Использует общие утилиты для фильтрации аудио-карточек
 * Сохраняет уникальную логику воспроизведения аудио и распознавания речи
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useTrainingBase, filterAudioCards, calculateProgress } from "./shared";

export const useAudioMode = (cards, onAnswer) => {
  // === БАЗОВАЯ ЛОГИКА ===
  const {
    currentCard: baseCurrentCard,
    currentIndex: baseCurrentIndex,
    isCompleted: baseCompleted,
    score,
    answers,
    handleAnswer: baseHandleAnswer,
    nextCard,
    setCurrentIndex,
    setIsCompleted,
  } = useTrainingBase(cards, onAnswer);

  // === УНИКАЛЬНАЯ ЛОГИКА АУДИО РЕЖИМА ===
  const [audioCards, setAudioCards] = useState([]);
  const [audioPlayCount, setAudioPlayCount] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [gameState, setGameState] = useState("playing");
  const audioRef = useRef(null);

  // Фильтруем только карточки с аудио при инициализации
  useEffect(() => {
    const filteredCards = filterAudioCards(cards);
    if (filteredCards.length === 0) {
      console.warn("В наборе нет карточек с аудио");
      setIsCompleted(true);
      return;
    }

    setAudioCards(filteredCards);
    setCurrentIndex(0);
  }, [cards, setIsCompleted, setCurrentIndex]);

  // Текущая карточка из аудио-набора
  const currentCard = audioCards[baseCurrentIndex];
  const isLastAudioCard = baseCurrentIndex >= audioCards.length - 1;

  // Воспроизведение аудио
  const playAudio = useCallback(() => {
    if (!currentCard || audioPlayCount >= 3) return;

    const audioUrl = currentCard.audioUrl || currentCard.backAudioUrl;
    if (!audioUrl) return;

    // Останавливаем предыдущее аудио
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Создаем новый аудио элемент
    const audio = new Audio(`http://localhost:5001${audioUrl}`);
    audioRef.current = audio;

    audio
      .play()
      .then(() => {
        setAudioPlayCount((prev) => prev + 1);
      })
      .catch((error) => {
        console.error("Ошибка воспроизведения аудио:", error);
      });
  }, [currentCard, audioPlayCount]);

  // Автовоспроизведение при смене карточки
  useEffect(() => {
    if (currentCard && gameState === "playing") {
      setAudioPlayCount(0);
      setShowAnswer(false);
      setUserAnswer("");

      // Автовоспроизведение через секунду
      const timer = setTimeout(() => {
        playAudio();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentCard, gameState, playAudio]);

  // Обработка ответа пользователя
  const handleAnswer = useCallback(
    (userInput = "", isCorrectOverride = null) => {
      if (!currentCard) return;

      setGameState("answering");
      setUserAnswer(userInput);

      // Определяем правильность ответа
      let isCorrect;
      if (isCorrectOverride !== null) {
        isCorrect = isCorrectOverride;
      } else {
        const correctAnswer = currentCard.back.toLowerCase().trim();
        const userAnswerClean = userInput.toLowerCase().trim();
        isCorrect = userAnswerClean === correctAnswer;
      }

      const difficulty = isCorrect ? 0 : 2;

      // Показываем правильный ответ через 2 секунды
      setTimeout(() => {
        setShowAnswer(true);

        // Используем базовый обработчик
        baseHandleAnswer(isCorrect, difficulty, isCorrect ? 10 : 0);

        // Следующая карточка через 3 секунды
        setTimeout(() => {
          if (isLastAudioCard) {
            setGameState("completed");
            setIsCompleted(true);
          } else {
            nextCard();
            setGameState("playing");
          }
        }, 3000);
      }, 2000);
    },
    [currentCard, isLastAudioCard, baseHandleAnswer, nextCard, setIsCompleted]
  );

  // Быстрые кнопки
  const handleKnowAnswer = useCallback(() => {
    handleAnswer(currentCard.back, true);
  }, [currentCard, handleAnswer]);

  const skipCard = useCallback(() => {
    handleAnswer("", false);
  }, [handleAnswer]);

  const playAudioAgain = useCallback(() => {
    if (audioPlayCount < 3) {
      playAudio();
    }
  }, [audioPlayCount, playAudio]);

  // Статистика аудио режима
  const audioStats = {
    current: baseCurrentIndex + 1,
    total: audioCards.length,
    audioPlays: audioPlayCount,
    playsLeft: Math.max(0, 3 - audioPlayCount),
    hasAudio: !!(currentCard?.audioUrl || currentCard?.backAudioUrl),
    gameState,
    showAnswer,
    userAnswer,
    isCompleted: baseCompleted || gameState === "completed",
  };

  const audioProgress = calculateProgress(baseCurrentIndex, audioCards.length, {
    audioCardsCount: audioCards.length,
    playsUsed: audioPlayCount,
    gameState,
  });

  return {
    currentCard,
    audioStats,
    audioProgress,
    isCompleted: audioStats.isCompleted,
    gameState,
    showAnswer,
    userAnswer,
    audioPlayCount,
    playAudio: playAudioAgain,
    handleAnswer,
    handleKnowAnswer,
    skipCard,

    // Дополнительные методы
    setUserAnswerInput: setUserAnswer,

    // Результаты
    getResults: () => ({
      totalCards: audioCards.length,
      completedCards: baseCurrentIndex,
      audioCardsUsed: audioCards.filter(
        (card) => card.audioUrl || card.backAudioUrl
      ).length,
      totalPlays: answers.reduce(
        (sum, answer) => sum + (answer.audioPlays || 0),
        0
      ),
      listeningAccuracy:
        answers.length > 0
          ? Math.round(
              (answers.filter((a) => a.isCorrect).length / answers.length) * 100
            )
          : 0,
    }),
  };
};
