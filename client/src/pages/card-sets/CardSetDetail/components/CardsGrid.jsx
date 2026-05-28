import React from 'react';
import {
  DndContext,
  closestCenter,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import SortableGridCard from '../../SortableGridCard';

/**
 * Компонент сетки карточек (grid view)
 * @param {object} props
 * @param {Array} props.cards - массив карточек
 * @param {boolean} props.showContent - показывать ли содержимое
 * @param {boolean} props.isReadOnly - режим только для чтения
 * @param {boolean} props.isDragDisabled - отключен ли drag & drop
 * @param {object} props.sensors - сенсоры для dnd-kit
 * @param {function} props.handleDragEnd - обработчик окончания перетаскивания
 * @param {function} props.onEdit - обработчик редактирования
 * @param {function} props.onDelete - обработчик удаления
 * @param {function} props.onView - обработчик просмотра
 * @param {function} props.onToggleFavorite - обработчик переключения избранного
 * @param {Set} props.favoriteCardIds - ID избранных карточек
 * @param {object} props.currentTheme - текущая тема
 */
export default function CardsGrid({
  cards,
  showContent,
  isReadOnly,
  isDragDisabled,
  sensors,
  handleDragEnd,
  onEdit,
  onDelete,
  onView,
  onToggleFavorite,
  favoriteCardIds,
  currentTheme,
}) {
  if (cards.length === 0) {
    return (
      <div className="card-set-empty-state">
        <p>Нет карточек</p>
        <p>Добавьте первую карточку!</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
    >
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={rectSortingStrategy}
      >
        <div className="cards-grid">
          {cards.map((card, index) => (
            <SortableGridCard
              key={card.id}
              card={card}
              displayIndex={index + 1}
              currentTheme={currentTheme}
              showContent={showContent}
              favoriteCardIds={favoriteCardIds}
              onClick={() => onView(card)}
              onToggleFavorite={() => onToggleFavorite(card.id)}
              onEdit={isReadOnly ? null : () => onEdit(card)}
              onDelete={isReadOnly ? null : () => onDelete(card.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
