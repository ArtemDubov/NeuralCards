import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLayerGroup, faVolumeHigh, faSpinner, faGear, faKeyboard } from '../../../../utils/icons';
import TrainingSettingsModal from '../../../../components/common/TrainingSettingsModal';

/**
 * Компонент шапки страницы практики
 */
export default function PracticeHeader({ 
  currentTheme,
  knewCount,
  didntKnowCount,
  answered,
  totalCards,
  progress,
  showKeyboardHint,
  setShowKeyboardHint,
  ttsLoading,
  isTtsPlaying,
  currentVisualCard,
  currentCard,
  handleTTS,
  trainingSettings
}) {
  const navigate = useNavigate();

  return (
    <div className="practice-header">
      <button onClick={() => navigate(-1)} className="practice-back-btn">
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>

      <div className="practice-progress-info">
        <div className="practice-progress-row">
          <FontAwesomeIcon icon={faLayerGroup} className="practice-progress-icon" />
          <span className="practice-progress-text">
            {answered} / {totalCards}
          </span>
        </div>
        <div className="practice-progress-bar">
          <div
            className="practice-progress-fill"
            style={{
              width: `${progress}%`,
              background: currentTheme.primary,
            }}
          />
        </div>
      </div>

      <div className="practice-header-right">
        <button
          onClick={() => setShowKeyboardHint(!showKeyboardHint)}
          className="practice-header-icon-btn"
          style={{
            background: showKeyboardHint ? currentTheme.primary : `${currentTheme.primary}15`,
            color: showKeyboardHint ? "#fff" : currentTheme.primary,
          }}
          title={showKeyboardHint ? "Скрыть подсказки" : "Показать подсказки"}
        >
          <FontAwesomeIcon icon={faKeyboard} />
        </button>
        <button
          onClick={() => {
            const lang = currentVisualCard.isFlipped
              ? (currentCard.back_lang || "es")
              : (currentCard.front_lang || "es");
            const text = currentVisualCard.isFlipped
              ? currentCard.back
              : currentCard.front;
            handleTTS(text, lang);
          }}
          disabled={ttsLoading || isTtsPlaying}
          className="practice-header-icon-btn"
          style={{
            background: isTtsPlaying ? currentTheme.success : `${currentTheme.primary}15`,
            color: isTtsPlaying ? "#fff" : currentTheme.primary,
          }}
          title="Озвучить текст"
        >
          <FontAwesomeIcon icon={ttsLoading || isTtsPlaying ? faSpinner : faVolumeHigh} spin={ttsLoading || isTtsPlaying} />
        </button>
        <TrainingSettingsModal
          mode="practice"
          currentTheme={currentTheme}
          trigger={
            <button
              className="practice-header-icon-btn"
              style={{
                background: `${currentTheme.primary}15`,
                color: currentTheme.primary,
              }}
              title="Настройки тренировки"
            >
              <FontAwesomeIcon icon={faGear} />
            </button>
          }
        />
        <span className="practice-score-knew">{knewCount}</span>
        <span className="practice-score-didnt-know">{didntKnowCount}</span>
      </div>
    </div>
  );
}
