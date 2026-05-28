import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "../../../utils/icons";
import { mediaApi } from "../../../features/media";
import MiniAudioPlayer from "../../../features/media/components/MiniAudioPlayer";

/**
 * Matching column component - displays left or right column of cards.
 * Handles selection, connection state, and media display.
 */
export default function MatchingColumn({
  items,
  side, // 'left' or 'right'
  selectedId,
  connections,
  feedback,
  isSubmitting,
  onItemClick,
  getConnectedRightId,
  trainingSettings,
  handleTTS,
  currentTheme
}) {
  return (
    <div className="matching-column">
      {items.map((item) => {
        const connectedRightId = side === 'left' ? getConnectedRightId(item.id) : null;
        const isSelected = selectedId === item.id;
        
        // Для левой колонки используем обычный feedback, для правой - feedback с префиксом 'right_'
        const feedbackKey = side === 'left' ? item.id : `right_${item.id}`;
        const feedbackState = feedback[feedbackKey];
        
        const isConnected = side === 'left' 
          ? connectedRightId !== null 
          : connections.some((c) => c.rightId === item.id);

        let bgColor = currentTheme.backgroundSecondary || "var(--nt-background-secondary)";
        let borderColor = currentTheme.border || "#e0e0e0";
        let textColor = currentTheme.text || "#333";
        let itemOpacity = 1;
        let itemCursor = isSubmitting ? "not-allowed" : "pointer";

        if (isSelected) {
          bgColor = `${currentTheme.primary}20`;
          borderColor = currentTheme.primary;
          textColor = currentTheme.primary;
        } else if (isConnected) {
          if (side === 'left') {
            itemOpacity = 0.3;
            itemCursor = "default";
            if (feedbackState === "correct") {
              bgColor = "rgba(39,174,96,0.15)";
              borderColor = "#27ae60";
              textColor = "#27ae60";
            } else if (feedbackState === "incorrect") {
              bgColor = "rgba(231,76,60,0.15)";
              borderColor = "#e74c3c";
              textColor = "#e74c3c";
            }
          } else {
            // Правая колонка - показываем цвет обратной связи
            if (feedbackState === "correct") {
              bgColor = "rgba(39,174,96,0.15)";
              borderColor = "#27ae60";
              textColor = "#27ae60";
            } else if (feedbackState === "incorrect") {
              bgColor = "rgba(231,76,60,0.15)";
              borderColor = "#e74c3c";
              textColor = "#e74c3c";
            } else {
              // Если нет feedback, но карточка соединена - показываем бледно-зелёный
              bgColor = "rgba(39,174,96,0.1)";
              borderColor = "rgba(39,174,96,0.3)";
              textColor = "rgba(39,174,96,0.6)";
            }
          }
        }

        return (
          <button
            key={item.id}
            onClick={() => {
              const isCurrentlySelected = selectedId === item.id;
              if (!isCurrentlySelected && item.text && trainingSettings.autoReadTTS) {
                handleTTS(item.text, item.lang || "ru");
              }
              onItemClick(item.id);
            }}
            disabled={isConnected || isSubmitting}
            className={`matching-item ${isSelected ? 'matching-item-selected' : ''} ${isConnected ? 'matching-item-connected' : ''}`}
            style={{
              background: bgColor,
              borderColor,
              color: textColor,
              opacity: side === 'left' ? itemOpacity : (isConnected || isSubmitting ? 0.5 : 1),
              cursor: side === 'left' ? itemCursor : (isConnected || isSubmitting ? "not-allowed" : "pointer"),
              pointerEvents: side === 'left' && isConnected ? "none" : "auto",
              transform: side === 'left' && feedbackState === 'correct' && trainingSettings.flipAnimation 
                ? 'scale(1.05)' 
                : (side === 'left' && feedbackState === 'incorrect' && trainingSettings.flipAnimation ? 'scale(0.95)' : 'scale(1)'),
              transition: trainingSettings.flipAnimation ? 'all 0.3s ease' : 'none',
            }}
          >
            <div className="matching-item-content">
              <span className="matching-item-text">{item.text}</span>
              
              {item.image && (
                <img
                  src={mediaApi.getMediaUrl(item.image)}
                  alt=""
                  className="matching-item-image"
                />
              )}
              {item.audio && (
                <MiniAudioPlayer audioUrl={item.audio} currentTheme={currentTheme} compact />
              )}
              {item.video && (
                <video
                  controls
                  preload="metadata"
                  src={mediaApi.getMediaUrl(item.video)}
                  className="matching-item-video"
                />
              )}
            </div>
            
            {side === 'left' && isConnected && (
              <FontAwesomeIcon
                icon={feedbackState === "correct" ? faCheck : faXmark}
                style={{
                  marginLeft: "8px",
                  fontSize: "12px",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
