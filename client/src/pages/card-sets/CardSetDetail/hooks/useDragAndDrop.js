import { useCallback, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { cardSetsApi } from '../../../../features/cardSets/api/cardSetsApi';

/**
 * Хук для управления drag & drop карточек
 * @param {Array} cards - массив карточек
 * @param {function} setCards - функция обновления карточек
 * @param {string} setId - ID набора
 * @param {boolean} isDragDisabled - флаг отключения drag
 * @param {object} toast - объект toast
 * @returns {object} { sensors, handleDragEnd, isDragDisabled }
 */
export function useDragAndDrop(cards, setCards, setId, isDragDisabled, toast) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150, // Задержка 150мс перед началом drag
        tolerance: 5, // Максимальное смещение во время задержки
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const previousCardsRef = useRef(cards);

  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = cards.findIndex((card) => card.id === active.id);
    const newIndex = cards.findIndex((card) => card.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Вычисляем новый порядок
    const newCards = arrayMove(cards, oldIndex, newIndex);
    
    // Обновляем UI СРАЗУ для плавной анимации
    setCards(newCards);

    try {
      // Обновляем порядок на сервере
      const cardIds = newCards.map((card) => card.id);
      
      await cardSetsApi.reorderCards(setId, cardIds);
      toast.success("Порядок карточек обновлен");
    } catch (error) {
      // Откат при ошибке
      setCards(cards);
      toast.error("Ошибка при обновлении порядка карточек");
      console.error("Error reordering cards:", error);
    }
  }, [cards, setCards, setId, toast]);

  return {
    sensors,
    handleDragEnd,
    isDragDisabled,
  };
}