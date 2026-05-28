import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faRotateRight, faArrowLeft } from '../../../../utils/icons';

/**
 * Компонент экрана завершения практики
 */
export default function PracticeFinish({ 
  currentTheme,
  knewCount,
  didntKnowCount,
  handleRestart
}) {
  const navigate = useNavigate();
  
  const accuracy =
    knewCount + didntKnowCount > 0
      ? Math.round((knewCount / (knewCount + didntKnowCount)) * 100)
      : 0;

  return (
    <div className="practice-finish-container">
      <div className="practice-finish-card">
        <FontAwesomeIcon icon={faTrophy} className="practice-finish-icon" />
        <h2 className="practice-finish-title">Практика завершена!</h2>
        <p className="practice-finish-subtitle">Вы прошли все карточки</p>

        <div className="practice-finish-stats">
          <div className="practice-finish-stat">
            <span className="practice-finish-stat-value practice-finish-stat-correct">
              {knewCount}
            </span>
            <span className="practice-finish-stat-label">Помню</span>
          </div>
          <div className="practice-finish-stat">
            <span className="practice-finish-stat-value practice-finish-stat-incorrect">
              {didntKnowCount}
            </span>
            <span className="practice-finish-stat-label">Не помню</span>
          </div>
          <div className="practice-finish-stat">
            <span className="practice-finish-stat-value practice-finish-stat-accuracy">
              {accuracy}%
            </span>
            <span className="practice-finish-stat-label">Точность</span>
          </div>
        </div>

        <div className="practice-finish-actions">
          <button
            onClick={handleRestart}
            className="practice-finish-btn practice-finish-btn-primary"
          >
            <FontAwesomeIcon
              icon={faRotateRight}
              style={{ marginRight: "6px" }}
            />
            Пройти снова
          </button>
          <button
            onClick={() => navigate(-1)}
            className="practice-finish-btn practice-finish-btn-secondary"
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              style={{ marginRight: "6px" }}
            />
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}
