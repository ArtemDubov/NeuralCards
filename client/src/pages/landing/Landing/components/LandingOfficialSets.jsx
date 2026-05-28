import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup, faPlay, faUsers, faStar } from '../../../../utils/icons';

/**
 * Компонент секции публичных наборов карточек
 */
export default function LandingOfficialSets({ 
  currentTheme,
  sets,
  onStartPractice 
}) {
  const t = currentTheme;

  if (!sets || sets.length === 0) {
    return null;
  }

  return (
    <section className="landing-official-sets" style={{ background: t.background }}>
      <div className="landing-section-header">
        <h2 className="landing-section-title">Готовые наборы для практики</h2>
        <p className="landing-section-subtitle">
          Выберите любой публичный набор и начните обучение прямо сейчас
        </p>
      </div>
      
      <div className="landing-sets-grid">
        {sets.slice(0, 6).map((set, index) => (
          <div 
            key={set.id}
            className="landing-set-card"
            style={{ 
              background: t.surface,
              borderColor: t.border,
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div className="landing-set-header">
              <div className="landing-set-icon-wrapper">
                <FontAwesomeIcon 
                  icon={set.is_official ? faStar : faLayerGroup} 
                  className="landing-set-icon"
                  style={{ 
                    color: set.is_official ? 'var(--nt-warning)' : t.primary 
                  }}
                />
              </div>
              <h3 className="landing-set-title">{set.title}</h3>
            </div>
            
            {set.description && (
              <p className="landing-set-description">{set.description}</p>
            )}
            
            <div className="landing-set-footer">
              <div className="landing-set-meta">
                <span className="landing-set-count">
                  {set.cards_count || 0} карточек
                </span>
                {!set.is_official && (
                  <span className="landing-set-badge" style={{ 
                    background: `${t.primary}15`,
                    color: t.primary
                  }}>
                    <FontAwesomeIcon icon={faUsers} size="xs" />
                    От сообщества
                  </span>
                )}
              </div>
              <button
                onClick={() => onStartPractice(set.id)}
                className="landing-set-btn"
                style={{ 
                  background: `${t.primary}15`,
                  color: t.primary
                }}
              >
                <FontAwesomeIcon icon={faPlay} />
                Практика
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
