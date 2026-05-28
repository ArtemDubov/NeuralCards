import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faFire } from '../../../../utils/icons';

/**
 * Компонент CTA секции (призыв к действию)
 */
export default function LandingCTA({ currentTheme, onGetStarted, onLogin }) {
  const t = currentTheme;

  return (
    <section 
      className="landing-cta"
      style={{ 
        background: `linear-gradient(135deg, ${t.primary}20, ${t.secondary}20)`
      }}
    >
      <div className="landing-cta-content">
        <FontAwesomeIcon 
          icon={faFire} 
          className="landing-cta-icon"
          style={{ color: t.primary }}
        />
        
        <h2 className="landing-cta-title">Готовы начать обучение?</h2>
        <p className="landing-cta-description">
          Присоединяйтесь к тысячам пользователей, которые уже учат языки 
          с помощью нейросетей. Это бесплатно!
        </p>
        
        <div className="landing-cta-actions">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onGetStarted();
            }}
            className="landing-btn landing-btn-primary landing-btn-large"
            style={{ 
              background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
              cursor: 'pointer',
              pointerEvents: 'auto'
            }}
            type="button"
          >
            Начать бесплатно
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onLogin();
            }}
            className="landing-btn landing-btn-outline landing-btn-large"
            style={{ 
              borderColor: t.primary, 
              color: t.primary,
              cursor: 'pointer',
              pointerEvents: 'auto'
            }}
            type="button"
          >
            Уже есть аккаунт? Войти
          </button>
        </div>
      </div>
    </section>
  );
}
