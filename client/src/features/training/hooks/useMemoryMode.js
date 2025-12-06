/**
 * РЕЖИМ ПАМЯТИ (ОБНОВЛЕННЫЙ)
 * Использует общие функции createMemoryPairs из training-helpers
 * Сохраняет уникальную логику сопоставления пар
 */

import { useState, useEffect, useCallback } from "react";
import { createMemoryPairs } from "./shared";

export const useMemoryMode = (cards, onAnswer) => {
  // === УНИКАЛЬНАЯ ЛОГИКА РЕЖИМА ПАМЯТИ ===
  const [board, setBoard] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Инициализация игрового поля с помощью общей функции
  useEffect(() => {
    if (cards.length < 2) return;

    const gameCards = cards.slice(0, 12); // Максимум 6 пар
    const pairs = createMemoryPairs(gameCards, 6);

    setBoard(pairs.map((pair) => ({ ...pair, flipped: false })));
    setGameStarted(true);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  }, [cards]);

  // Обработка клика по карточке
  const handleCardClick = useCallback(
    (cardId) => {
      if (flipped.length >= 2) return;
      if (flipped.includes(cardId) || matched.includes(cardId)) return;

      const newFlipped = [...flipped, cardId];
      setFlipped(newFlipped);

      // Если открыли две карточки
      if (newFlipped.length === 2) {
        setMoves((prev) => prev + 1);

        const [firstId, secondId] = newFlipped;
        const firstCard = board.find((c) => c.id === firstId);
        const secondCard = board.find((c) => c.id === secondId);

        // Проверяем, совпадают ли карточки
        if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
          // Нашли пару!
          setMatched((prev) => [...prev, firstCard.pairId]);

          // Отправляем статистику
          setTimeout(() => {
            onAnswer(true, 0); // Правильный ответ
          }, 500);

          // Очищаем открытые карточки через секунду
          setTimeout(() => {
            setFlipped([]);
          }, 1000);
        } else {
          // Не совпали - переворачиваем обратно
          setTimeout(() => {
            setFlipped([]);
            onAnswer(false, 2); // Неправильный ответ
          }, 1500);
        }
      }
    },
    [board, flipped, matched, onAnswer]
  );

  // Проверка завершения игры
  const totalPairs = Math.min(Math.floor(cards.length / 2), 6);
  const isCompleted = matched.length >= totalPairs;

  // Сброс игры
  const resetGame = useCallback(() => {
    setFlipped([]);
    setMatched([]);
    setMoves(0);

    // Реинициализация доски
    const gameCards = cards.slice(0, 12);
    const pairs = createMemoryPairs(gameCards, 6);
    setBoard(pairs.map((pair) => ({ ...pair, flipped: false })));
  }, [cards]);

  // Статистика
  const stats = {
    pairsFound: matched.length,
    totalPairs,
    moves,
    accuracy: moves > 0 ? Math.round((matched.length / moves) * 100) : 0,
    boardSize: board.length,
    gameStarted,
    isCompleted,
  };

  return {
    board,
    flipped,
    matched,
    moves,
    gameStarted,
    isCompleted,
    stats,
    handleCardClick,
    resetGame,
  };
};
