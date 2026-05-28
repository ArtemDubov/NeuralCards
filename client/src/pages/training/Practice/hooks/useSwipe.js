import { useRef, useCallback } from 'react';

/**
 * Хук для управления свайпами (drag & drop)
 */
export function useSwipe(SWIPE_THRESHOLD = 60, MAX_DRAG = 150) {
  const startXRef = useRef(0);
  const hasMovedRef = useRef(false);
  const dragStartTimeRef = useRef(0);

  // Начало перетаскивания
  const handlePointerDown = useCallback((e, setIsDragging, setDragStartTime) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX;
    setDragStartTime(Date.now());
    hasMovedRef.current = false;
    setIsDragging(true);
  }, []);

  // Движение при перетаскивании
  const handlePointerMove = useCallback((e, isDragging, setDragOffset, updateDragState) => {
    if (!isDragging) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const diff = clientX - startXRef.current;

    if (Math.abs(diff) > 5) {
      hasMovedRef.current = true;
    }

    const clamped = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, diff));
    setDragOffset(clamped);
    updateDragState(clamped);
  }, [MAX_DRAG]);

  // Конец перетаскивания
  const handlePointerUp = useCallback((
    isDragging, 
    dragOffset, 
    currentVisualCard, 
    handleFlip, 
    handleSwipeAction,
    setIsDragging,
    updateDragState
  ) => {
    if (!isDragging) return;
    setIsDragging(false);

    const elapsed = Date.now() - dragStartTimeRef.current;
    const isClick = !hasMovedRef.current && elapsed < 300;

    // Если перетащили достаточно далеко - свайп
    if (Math.abs(dragOffset) > SWIPE_THRESHOLD) {
      const direction = dragOffset > 0 ? "right" : "left";
      
      // Если карточка не перевернута - сначала переворачиваем, потом свайпаем
      if (!currentVisualCard?.isFlipped) {
        const currentText = currentVisualCard.isFlipped ? null : null; // Текст будет определён в компоненте
        
        setTimeout(() => {
          handleSwipeAction(direction);
        }, 200);
      } else {
        // Карточка уже перевернута - сразу свайпаем
        handleSwipeAction(direction);
      }
      return;
    }

    // Если это был клик или малое движение - просто переворачиваем
    if (isClick || Math.abs(dragOffset) < 10) {
      handleFlip();
      updateDragState(0);
      return;
    }

    // Возврат на место при недостаточном свайпе
    updateDragState(0);
  }, [SWIPE_THRESHOLD]);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    hasMovedRef
  };
}
