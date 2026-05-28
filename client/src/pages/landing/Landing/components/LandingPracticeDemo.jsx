import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark, faRotateRight, faVolumeHigh } from '../../../../utils/icons';

/**
 * Компонент интерактивной демо-практики на лендинге
 * Полностью идентичен обычной практике (PracticePage)
 */
export default function LandingPracticeDemo({ 
  currentTheme,
  currentCard,
  currentVisualCard,
  currentIndex,
  totalCards,
  knewCount,
  loading,
  finished,
  ttsLoading,
  ttsPlaying,
  isAnimating,
  onFlip,
  onAnswer,
  onRestart,
  onTTS
}) {
  const t = currentTheme;
  
  if (loading) {
    return (
      <div className="landing-practice-loading">
        <div className="spinner" style={{ borderTopColor: t.primary }} />
        <p>Загрузка карточек...</p>
      </div>
    );
  }

  if (finished) {
    const accuracy = totalCards > 0 ? Math.round((knewCount / totalCards) * 100) : 0;
    
    return (
      <div className="landing-practice-complete">
        <FontAwesomeIcon 
          icon={faCheck} 
          className="landing-practice-complete-icon"
        />
        <h3>Демо завершена!</h3>
        <p className="landing-practice-result">
          Правильных ответов: <strong>{knewCount}</strong> из <strong>{totalCards}</strong> ({accuracy}%)
        </p>
        <button 
          onClick={onRestart}
          className="practice-finish-btn practice-finish-btn-primary"
          style={{ 
            background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
            color: '#fff'
          }}
        >
          <FontAwesomeIcon icon={faRotateRight} />
          Пройти ещё раз
        </button>
      </div>
    );
  }

  if (!currentCard || !currentVisualCard) return null;

  // Определяем текст и язык для текущей стороны
  const text = currentVisualCard.isFlipped ? currentCard.back : currentCard.front;
  const lang = currentVisualCard.isFlipped ? (currentCard.back_lang || "ru") : (currentCard.front_lang || "ru");

  // Прогресс как в обычной практике
  const progressPercent = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  // Вычисляем стили для анимации (используем inline только для динамических значений)
  const cardTransform = currentVisualCard.flipAnimating
    ? `translateX(${currentVisualCard.dragOffset}px) rotateY(90deg)`
    : `translateX(${currentVisualCard.dragOffset}px) rotateY(0deg)`;
  
  const cardOpacity = Math.abs(currentVisualCard.dragOffset) > 30
    ? Math.max(0, 1 - Math.abs(currentVisualCard.dragOffset) / 350)
    : 1;

  return (
    <div className="landing-practice-demo">
      {/* Шапка с прогрессом как в обычной практике */}
      <div className="practice-header">
        <div className="practice-progress-info">
          <div className="practice-progress-row">
            <span className="practice-progress-text">
              {currentIndex + 1} / {totalCards}
            </span>
          </div>
          <div className="practice-progress-bar">
            <div 
              className="practice-progress-fill" 
              style={{ 
                width: `${progressPercent}%`,
                background: t.primary
              }}
            />
          </div>
        </div>
        
        <div className="practice-header-right">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTTS(text, lang);
            }}
            disabled={ttsLoading || ttsPlaying}
            className="practice-header-icon-btn"
            style={{
              background: ttsPlaying ? t.success : `${t.primary}15`,
              color: ttsPlaying ? "#fff" : t.primary,
            }}
            title="Озвучить текст"
          >
            <FontAwesomeIcon icon={faVolumeHigh} spin={ttsLoading} />
          </button>
          <span className="practice-score-knew">{knewCount}</span>
        </div>
      </div>

      {/* Карточка как в обычной практике - используем существующие классы */}
      <div 
        className="practice-card-area"
        onClick={onFlip}
      >
        {/* Верхняя карточка */}
        <div 
          className="practice-card practice-card-top"
          style={{
            transform: cardTransform,
            opacity: cardOpacity,
            transition: isAnimating
              ? "none"
              : "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease",
          }}
        >
          <div className="practice-card-text">{text}</div>
          <div className="practice-hint">
            {currentVisualCard.isFlipped
              ? "← Не помню · Помню →"
              : "Нажмите, чтобы увидеть ответ"}
          </div>
        </div>
      </div>

      {/* Кнопки действий как в обычной практике */}
      <div className="practice-buttons-row">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAnswer(false);
          }}
          disabled={isAnimating}
          className="practice-btn practice-btn-didnt-know"
          style={{ opacity: isAnimating ? 0.5 : 1 }}
        >
          <FontAwesomeIcon icon={faXmark} style={{ marginRight: "8px" }} />
          Не помню
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAnswer(true);
          }}
          disabled={isAnimating}
          className="practice-btn practice-btn-knew"
          style={{ opacity: isAnimating ? 0.5 : 1 }}
        >
          <FontAwesomeIcon icon={faCheck} style={{ marginRight: "8px" }} />
          Помню
        </button>
      </div>
    </div>
  );
}
