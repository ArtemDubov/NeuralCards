import { useState, useCallback, useRef, useEffect } from 'react';
import { chatApi } from '../../../../features/chat/api/chatApi';
import { textToSpeechDemo } from '../../../../features/speech/api/speechApi';

/**
 * Хук для управления интерактивной практикой на лендинге
 * Полностью идентичен обычной практике (PracticePage)
 */
export function useLandingPractice() {
  const [practiceSet, setPracticeSet] = useState(null);
  const [cards, setCards] = useState([]);
  const [queue, setQueue] = useState([]);
  const [knewCount, setKnewCount] = useState(0);
  const [didntKnowCount, setDidntKnowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  
  // Визуальные карточки (как в PracticePage)
  const [visualCards, setVisualCards] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const audioRef = useRef(null);

  // Запуск практики
  const startPractice = useCallback(async (setId, onAuthRequired) => {
    setLoading(true);
    setFinished(false);
    setKnewCount(0);
    setDidntKnowCount(0);
    setTtsPlaying(false);
    
    try {
      const res = await chatApi.guestPractice(setId);
      const cardsData = res.data.cards || [];
      
      if (!cardsData || cardsData.length === 0) {
        console.error('Нет карточек в наборе');
        return;
      }
      
      setCards(cardsData);
      const initialQueue = cardsData.map((c) => c.id);
      setQueue(initialQueue);

      // Инициализация первой визуальной карточки
      setVisualCards([
        {
          id: Date.now(),
          cardId: initialQueue[0],
          isFlipped: false,
          flipAnimating: false,
          dragOffset: 0,
          swipeDirection: null,
        },
      ]);
      
      setPracticeSet(setId);
    } catch (error) {
      console.error('Ошибка запуска практики:', error);
      // Если ошибка - показываем модалку регистрации
      if (onAuthRequired) {
        onAuthRequired('register');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Остановка TTS
  const stopTTS = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setTtsPlaying(false);
  }, []);

  // Воспроизведение TTS
  const handleTTS = useCallback(async (text, lang = "ru") => {
    if (!text?.trim()) return;
    
    stopTTS();
    setTtsLoading(true);
    
    try {
      const result = await textToSpeechDemo(text, lang);
      const audioUrl = `http://localhost:8081/${result.audio_url}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setTtsPlaying(false);
        setTtsLoading(false);
        audioRef.current = null;
      };
      
      audio.onerror = (err) => {
        console.error("Audio error:", err);
        setTtsPlaying(false);
        setTtsLoading(false);
        audioRef.current = null;
        
        // Fallback на Web Speech API
        const utterance = new SpeechSynthesisUtterance(text);
        const langMap = {
          'ru': 'ru-RU',
          'en': 'en-US',
          'de': 'de-DE',
          'fr': 'fr-FR',
          'es': 'es-ES',
          'it': 'it-IT',
          'zh-CN': 'zh-CN',
          'zh': 'zh-CN',
          'ja': 'ja-JP',
        };
        utterance.lang = langMap[lang] || 'ru-RU';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        utterance.onend = () => {
          setTtsPlaying(false);
          setTtsLoading(false);
        };
        
        utterance.onerror = () => {
          setTtsPlaying(false);
          setTtsLoading(false);
        };
        
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      };
      
      setTtsPlaying(true);
      await audio.play();
    } catch (err) {
      console.error("TTS error:", err);
      setTtsPlaying(false);
      setTtsLoading(false);
      
      // Fallback на Web Speech API
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        const langMap = {
          'ru': 'ru-RU',
          'en': 'en-US',
          'de': 'de-DE',
          'fr': 'fr-FR',
          'es': 'es-ES',
          'it': 'it-IT',
          'zh-CN': 'zh-CN',
          'zh': 'zh-CN',
          'ja': 'ja-JP',
        };
        utterance.lang = langMap[lang] || 'ru-RU';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        utterance.onend = () => {
          setTtsPlaying(false);
          setTtsLoading(false);
        };
        
        utterance.onerror = () => {
          setTtsPlaying(false);
          setTtsLoading(false);
        };
        
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        setTtsPlaying(true);
      } catch (fallbackErr) {
        console.error("Fallback TTS error:", fallbackErr);
        setTtsPlaying(false);
        setTtsLoading(false);
      }
    }
  }, [stopTTS]);

  // Переворот карточки с анимацией (как в PracticePage)
  const handleFlip = useCallback(() => {
    const currentVisualCard = visualCards[visualCards.length - 1];
    if (!currentVisualCard || isAnimating) return;
    
    // Принудительная остановка TTS перед переворотом
    stopTTS();

    // Анимация переворота
    setVisualCards((prev) => {
      const last = prev[prev.length - 1];
      if (!last) return prev;
      return prev.map((vc, i) =>
        i === prev.length - 1 ? { ...vc, flipAnimating: true } : vc,
      );
    });
    
    setTimeout(() => {
      setVisualCards((prev) => {
        const last = prev[prev.length - 1];
        if (!last) return prev;
        
        const newIsFlipped = !last.isFlipped;
        
        // Авто-чтение при перевороте
        const card = cards.find((c) => c.id === last.cardId);
        if (card) {
          if (!last.isFlipped && card?.back) {
            // Переворачиваем на обратную сторону - читаем back
            const langToUse = card.back_lang || "ru";
            handleTTS(card.back, langToUse);
          } else if (last.isFlipped && card?.front) {
            // Переворачиваем на лицевую сторону - читаем front
            const langToUse = card.front_lang || "ru";
            handleTTS(card.front, langToUse);
          }
        }
        
        return prev.map((vc, i) =>
          i === prev.length - 1
            ? { ...vc, isFlipped: newIsFlipped, flipAnimating: false }
            : vc,
        );
      });
    }, 250);
  }, [visualCards, isAnimating, cards, handleTTS, stopTTS]);

  // Обработка ответа (знаю/не знаю) - как в PracticePage
  const handleAnswer = useCallback(async (isCorrect) => {
    if (isAnimating || !visualCards[visualCards.length - 1]) return;
    setIsAnimating(true);

    const exitingCardId = visualCards[visualCards.length - 1].id;
    const exitingCardCardId = visualCards[visualCards.length - 1].cardId;
    const knew = isCorrect;

    if (knew) {
      setKnewCount((prev) => prev + 1);
    } else {
      setDidntKnowCount((prev) => prev + 1);
    }

    // Анимация свайпа
    const exitOffset = knew ? 500 : -500;
    setVisualCards((prev) => {
      const last = prev[prev.length - 1];
      if (!last) return prev;
      return prev.map((vc, i) =>
        i === prev.length - 1
          ? { ...vc, dragOffset: exitOffset, swipeDirection: knew ? "right" : "left" }
          : vc,
      );
    });

    setTimeout(() => {
      // Удаляем ушедшую карточку
      setVisualCards((prev) => prev.filter((vc) => vc.id !== exitingCardId));

      // Обновляем очередь
      const newQueue = knew
        ? queue.filter((id) => id !== exitingCardCardId)
        : [
            ...queue.filter((id) => id !== exitingCardCardId),
            exitingCardCardId,
          ];

      if (newQueue.length === 0) {
        // Завершаем тренировку
        setFinished(true);
      } else {
        // Добавляем новую карточку
        setVisualCards((prev) => [
          ...prev,
          {
            id: Date.now(),
            cardId: newQueue[0],
            isFlipped: false,
            flipAnimating: false,
            dragOffset: 0,
            swipeDirection: null,
          },
        ]);
        setQueue(newQueue);
      }

      setIsAnimating(false);
    }, 300);
  }, [isAnimating, visualCards, queue]);

  // Сброс практики
  const resetPractice = useCallback(() => {
    stopTTS();
    setFinished(false);
    setKnewCount(0);
    setDidntKnowCount(0);
    setTtsPlaying(false);
    
    // Перезапускаем с первой карточкой
    if (cards.length > 0) {
      const initialQueue = cards.map((c) => c.id);
      setQueue(initialQueue);
      setVisualCards([
        {
          id: Date.now(),
          cardId: initialQueue[0],
          isFlipped: false,
          flipAnimating: false,
          dragOffset: 0,
          swipeDirection: null,
        },
      ]);
    }
  }, [cards, stopTTS]);

  // Авто-чтение лицевой стороны при смене карточки
  useEffect(() => {
    if (visualCards.length > 0 && visualCards[visualCards.length - 1]) {
      const currentVisualCard = visualCards[visualCards.length - 1];
      const card = cards.find((c) => c.id === currentVisualCard.cardId);
      
      if (card && !currentVisualCard.isFlipped && !currentVisualCard.flipAnimating) {
        // Читаем лицевую сторону при появлении новой карточки
        const timer = setTimeout(() => {
          if (card?.front) {
            const langToUse = card.front_lang || "ru";
            handleTTS(card.front, langToUse);
          }
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [visualCards, cards, handleTTS]);

  // Получаем текущую визуальную карточку и данные
  const currentVisualCard = visualCards[visualCards.length - 1];
  const currentCard = cards.find((c) => c.id === currentVisualCard?.cardId);
  const currentIndex = queue.indexOf(currentVisualCard?.cardId);
  const totalCards = cards.length;

  return {
    practiceSet,
    cards,
    currentCard,
    currentVisualCard,
    currentIndex,
    totalCards,
    visualCards,
    queue,
    knewCount,
    didntKnowCount,
    loading,
    finished,
    ttsLoading,
    ttsPlaying,
    isAnimating,
    startPractice,
    handleAnswer,
    handleFlip,
    resetPractice,
    handleTTS,
    stopTTS,
  };
}
