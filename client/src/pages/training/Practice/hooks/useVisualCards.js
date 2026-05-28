import { useState, useCallback } from 'react';

/**
 * Хук для управления визуальными карточками (анимации, свайпы)
 */
export function useVisualCards() {
  const [visualCards, setVisualCards] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Инициализация первой карточки
  const initFirstCard = useCallback((cardId) => {
    setVisualCards([
      {
        id: Date.now(),
        cardId: cardId,
        isFlipped: false,
        flipAnimating: false,
        dragOffset: 0,
        swipeDirection: null,
      },
    ]);
  }, []);

  // Переворот карточки
  const handleFlip = useCallback((trainingSettings, cards, playedSides, setPlayedSides, handleTTS, stopTTS) => {
    const currentVisualCard = visualCards[visualCards.length - 1];
    
    // Блокируем переворот если идет анимация
    if (!currentVisualCard || isAnimating) return;
    
    // ПРИНУДИТЕЛЬНАЯ остановка TTS перед переворотом
    console.log("🛑 ПРИНУДИТЕЛЬНАЯ остановка TTS перед переворотом");
    stopTTS();

    if (trainingSettings.flipAnimation) {
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
          
          // Авто-чтение при перевороте карточки
          if (trainingSettings.autoReadTTS) {
            const card = cards.find((c) => c.id === last.cardId);
            if (card) {
              const sideKey = `${card.id}_${newIsFlipped ? 'back' : 'front'}`;
              
              if (!playedSides.has(sideKey)) {
                if (!last.isFlipped && card?.back) {
                  const langToUse = card.back_lang || "es";
                  setPlayedSides(prev => new Set([...prev, sideKey]));
                  handleTTS(card.back, langToUse, true);
                } else if (last.isFlipped && card?.front) {
                  const langToUse = card.front_lang || "es";
                  setPlayedSides(prev => new Set([...prev, sideKey]));
                  handleTTS(card.front, langToUse, true);
                }
              }
            }
          }
          
          return prev.map((vc, i) =>
            i === prev.length - 1
              ? { ...vc, isFlipped: newIsFlipped, flipAnimating: false }
              : vc,
          );
        });
      }, 250);
    } else {
      setVisualCards((prev) => {
        const last = prev[prev.length - 1];
        if (!last) return prev;
        
        const newIsFlipped = !last.isFlipped;
        
        // Авто-чтение при перевороте карточки (без анимации)
        if (trainingSettings.autoReadTTS) {
          const card = cards.find((c) => c.id === last.cardId);
          if (card) {
            const sideKey = `${card.id}_${newIsFlipped ? 'back' : 'front'}`;
            
            if (!playedSides.has(sideKey)) {
              if (!last.isFlipped && card?.back) {
                const langToUse = card.back_lang || "es";
                setPlayedSides(prev => new Set([...prev, sideKey]));
                handleTTS(card.back, langToUse, true);
              } else if (last.isFlipped && card?.front) {
                const langToUse = card.front_lang || "es";
                setPlayedSides(prev => new Set([...prev, sideKey]));
                handleTTS(card.front, langToUse, true);
              }
            }
          }
        }
        
        return prev.map((vc, i) =>
          i === prev.length - 1 ? { ...vc, isFlipped: newIsFlipped } : vc,
        );
      });
    }
  }, [visualCards, isAnimating]);

  // Добавление новой карточки в стек
  const addNewCard = useCallback((cardId) => {
    setVisualCards((prev) => [
      ...prev,
      {
        id: Date.now(),
        cardId: cardId,
        isFlipped: false,
        flipAnimating: false,
        dragOffset: 0,
        swipeDirection: null,
      },
    ]);
  }, []);

  // Удаление карточки из стека (после свайпа)
  const removeCard = useCallback((cardId) => {
    setVisualCards((prev) => prev.filter((vc) => vc.id !== cardId));
  }, []);

  // Обновление состояния перетаскивания
  const updateDragState = useCallback((offset, direction = null) => {
    setDragOffset(offset);
    if (direction) {
      setVisualCards((prev) => {
        const last = prev[prev.length - 1];
        if (!last) return prev;
        return prev.map((vc, i) =>
          i === prev.length - 1 ? { ...vc, dragOffset: offset, swipeDirection: direction } : vc,
        );
      });
    } else {
      setVisualCards((prev) => {
        const last = prev[prev.length - 1];
        if (!last) return prev;
        return prev.map((vc, i) =>
          i === prev.length - 1 ? { ...vc, dragOffset: offset } : vc,
        );
      });
    }
  }, []);

  return {
    visualCards,
    setVisualCards,
    isAnimating,
    setIsAnimating,
    dragOffset,
    isDragging,
    setIsDragging,
    initFirstCard,
    handleFlip,
    addNewCard,
    removeCard,
    updateDragState
  };
}
