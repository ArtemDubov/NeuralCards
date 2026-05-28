import React from "react";
import { DndContext, closestCenter, MeasuringStrategy } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableCard from "../../SortableCard";
import InsertDivider from "../../InsertDivider";
import { mediaApi } from "../../../../features/media/api/mediaApi";
import MiniAudioPlayer from "../../../../features/media/components/MiniAudioPlayer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faVolumeHigh, faVideo } from "../../../../utils/icons";

/**
 * CardMediaPreview — компонент для отображения медиа в карточке (список)
 */
function CardMediaPreview({ image, audio, video, currentTheme }) {
  const hasAny = image || audio || video;
  if (!hasAny) return null;

  return (
    <div className="card-set-media-row">
      {image && (
        <img
          src={mediaApi.getMediaUrl(image)}
          alt=""
          className="card-set-thumb"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      )}
      {audio && (
        <MiniAudioPlayer audioUrl={audio} currentTheme={currentTheme} compact />
      )}
      {video && (
        <video
          controls
          preload="metadata"
          src={mediaApi.getMediaUrl(video)}
          className="card-set-video-thumb"
        />
      )}
    </div>
  );
}

/**
 * Компонент списка карточек (list view)
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
 * @param {function} props.handleAddCardAtIndex - обработчик добавления карточки по индексу
 */
export default function CardsList({
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
  handleAddCardAtIndex,
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
        strategy={verticalListSortingStrategy}
      >
        <div className="card-set-cards-list">
          {cards.map((card, index) => (
            <React.Fragment key={card.id}>
              {/* Плюсык перед карточкой */}
              {!isReadOnly && (
                <InsertDivider
                  onClick={() => handleAddCardAtIndex(index)}
                  currentTheme={currentTheme}
                />
              )}
              
              <SortableCard
                card={card}
                displayIndex={index + 1}
                currentTheme={currentTheme}
                showContent={showContent}
                favoriteCardIds={favoriteCardIds}
                onClick={() => onView(card)}
                onToggleFavorite={() => onToggleFavorite(card.id)}
                onEdit={isReadOnly ? null : () => onEdit(card)}
                onDelete={isReadOnly ? null : () => onDelete(card.id)}
                FrontMediaPreview={CardMediaPreview}
                BackMediaPreview={CardMediaPreview}
              />
            </React.Fragment>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
