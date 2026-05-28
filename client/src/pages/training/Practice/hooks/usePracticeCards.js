import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainingApi } from '../../../../features/training/api/trainingApi';
import { useToast } from '../../../../contexts/ToastContext';

/**
 * Хук для управления карточками практики и очередью
 */
export function usePracticeCards(setId, trainingSettings) {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [cards, setCards] = useState([]);
  const [queue, setQueue] = useState([]);
  const [knewCount, setKnewCount] = useState(0);
  const [didntKnowCount, setDidntKnowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [trainingSessionId, setTrainingSessionId] = useState(null);

  // Загрузка карточек
  const loadCards = useCallback(async () => {
    try {
      // Создаём TrainingSession для статистики
      try {
        const sessionResponse = await trainingApi.createSession({
          card_set_id: parseInt(setId),
          mode: "practice",
        });
        setTrainingSessionId(sessionResponse.data.id);
      } catch (sessionError) {
        console.warn("Could not create training session for practice:", sessionError);
      }

      const response = await trainingApi.createPracticeSession(setId);
      let cardsData = response.data.cards;
      
      // Shuffle если включено в настройках
      if (trainingSettings.shuffleCards) {
        cardsData = [...cardsData].sort(() => Math.random() - 0.5);
      }
      
      if (!cardsData || cardsData.length === 0) {
        navigate(-1);
        return;
      }
      
      setCards(cardsData);
      const initialQueue = cardsData.map((c) => c.id);
      setQueue(initialQueue);
    } catch (error) {
      console.error("Error loading practice:", error);
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      
      if (status === 404) {
        toast.error(`Эндпоинт не найден (404). ${detail || error.message}`);
      } else if (status === 401) {
        toast.error("Сессия истекла. Войдите заново.");
        navigate("/auth/login");
      } else {
        toast.error(`Ошибка загрузки практики: ${detail || error.message}`);
      }
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [setId, navigate, trainingSettings.shuffleCards, toast]);

  // Обработка ответа (знаю/не знаю)
  const handleAnswer = useCallback(async (cardId, knew) => {
    if (knew) {
      setKnewCount((prev) => prev + 1);
    } else {
      setDidntKnowCount((prev) => prev + 1);
    }

    // Отправляем ответ на сервер для статистики
    if (trainingSessionId) {
      try {
        await trainingApi.submitAnswer(trainingSessionId, "", knew);
      } catch (error) {
        console.error("Error submitting practice answer:", error);
      }
    }

    const newQueue = knew
      ? queue.filter((id) => id !== cardId)
      : [...queue.filter((id) => id !== cardId), cardId];

    if (newQueue.length === 0) {
      // Завершаем тренировку
      setFinished(true);
      if (trainingSessionId) {
        trainingApi
          .completeSession(trainingSessionId)
          .then(() => {
            window.dispatchEvent(new Event("trainingCompleted"));
          })
          .catch((err) =>
            console.error("Error completing practice session:", err),
          );
      }
    }

    return newQueue;
  }, [queue, trainingSessionId]);

  // Перезапуск практики
  const handleRestart = useCallback(() => {
    let newQueue = cards.map((c) => c.id);
    
    // Перемешиваем карточки если включено в настройках
    if (trainingSettings.shuffleCards) {
      newQueue = [...newQueue].sort(() => Math.random() - 0.5);
    }
    
    setQueue(newQueue);
    setKnewCount(0);
    setDidntKnowCount(0);
    setFinished(false);

    return newQueue[0]; // Возвращаем ID первой карточки
  }, [cards, trainingSettings.shuffleCards]);

  return {
    cards,
    queue,
    setQueue,
    knewCount,
    didntKnowCount,
    loading,
    finished,
    loadCards,
    handleAnswer,
    handleRestart,
    setFinished,
    setKnewCount,
    setDidntKnowCount
  };
}
