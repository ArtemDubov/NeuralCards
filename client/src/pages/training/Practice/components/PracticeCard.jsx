import React from 'react';
import { mediaApi } from '../../../../features/media';
import MiniAudioPlayer from '../../../../features/media/components/MiniAudioPlayer';

/**
 * Компонент одной карточки практики
 */
export default function PracticeCard({ 
  vc, 
  card, 
  isTop, 
  isDragging, 
  trainingSettings,
  style 
}) {
  if (!card) return null;

  // Используем сохраненный текст при свайпе, иначе вычисляем по isFlipped
  const text = vc.swipeText || (vc.isFlipped ? card.back : card.front);
  const img = vc.isFlipped ? card.back_image : card.front_image;
  const aud = vc.isFlipped ? card.back_audio : card.front_audio;
  const vid = vc.isFlipped ? card.back_video : card.front_video;

  const bg = isTop
    ? vc.swipeDirection === "right"
      ? `rgba(39,174,96,${Math.min(Math.abs(vc.dragOffset) / 200, 0.2)})`
      : vc.swipeDirection === "left"
        ? `rgba(231,76,60,${Math.min(Math.abs(vc.dragOffset) / 200, 0.2)})`
        : "#fff"
    : "#f0f0f0";

  const transform =
    trainingSettings.flipAnimation && vc.flipAnimating
      ? `translateX(${vc.dragOffset}px) rotateY(90deg)`
      : `translateX(${vc.dragOffset}px) rotateY(0deg)`;

  const opacity = isTop
    ? Math.abs(vc.dragOffset) > 30
      ? Math.max(0, 1 - Math.abs(vc.dragOffset) / 350)
      : 1
    : 0.5;

  const cardStyle = isTop
    ? {
        transform,
        opacity,
        transition: isDragging
          ? "none"
          : "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease",
        background: bg,
        zIndex: 2,
        cursor: isDragging ? "grabbing" : "pointer",
        ...style
      }
    : {
        opacity,
        zIndex: 1,
        pointerEvents: "none",
        ...style
      };

  return (
    <div className={`practice-card ${isTop ? 'practice-card-top' : 'practice-card-back'}`} style={cardStyle}>
      <div className="practice-card-text">{text}</div>
      {img && (
        <img
          src={mediaApi.getMediaUrl(img)}
          alt=""
          className="practice-card-image"
        />
      )}
      {aud && (
        <MiniAudioPlayer audioUrl={aud} currentTheme={{}} compact />
      )}
      {vid && (
        <video
          controls
          preload="metadata"
          src={mediaApi.getMediaUrl(vid)}
          className="practice-card-video"
        />
      )}
      <div className="practice-hint">
        {vc.isFlipped
          ? "← Не помню · Помню →"
          : "Нажмите, чтобы увидеть ответ"}
      </div>
    </div>
  );
}
