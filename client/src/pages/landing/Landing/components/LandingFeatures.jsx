import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBrain, 
  faChartLine, 
  faUsers, 
  faPalette,
  faHeadphones,
  faTrophy
} from '../../../../utils/icons';

/**
 * Компонент секции преимуществ (Features)
 */
export default function LandingFeatures({ currentTheme }) {
  const t = currentTheme;

  const features = [
    {
      icon: faBrain,
      title: 'ИИ-адаптация',
      description: 'Система подстраивается под ваш уровень и темп обучения'
    },
    {
      icon: faChartLine,
      title: 'Аналитика прогресса',
      description: 'Детальная статистика и отслеживание успехов'
    },
    {
      icon: faUsers,
      title: 'Социальное обучение',
      description: 'Делитесь наборами и соревнуйтесь с друзьями'
    },
    {
      icon: faPalette,
      title: 'Персонализация',
      description: 'Настраивайте интерфейс под свои предпочтения'
    },
    {
      icon: faHeadphones,
      title: 'TTS озвучка',
      description: 'Прослушивайте произношение на разных языках'
    },
    {
      icon: faTrophy,
      title: 'Геймификация',
      description: 'Зарабатывайте очки и достижения за обучение'
    }
  ];

  return (
    <section className="landing-features" style={{ background: t.backgroundSecondary }}>
      <div className="landing-section-header">
        <h2 className="landing-section-title">Возможности платформы</h2>
        <p className="landing-section-subtitle">
          Всё необходимое для эффективного изучения языков
        </p>
      </div>
      
      <div className="landing-features-grid">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="landing-feature-card"
            style={{ 
              background: t.surface,
              borderColor: t.border
            }}
          >
            <div 
              className="landing-feature-icon"
              style={{ 
                background: `${t.primary}15`,
                color: t.primary
              }}
            >
              <FontAwesomeIcon icon={feature.icon} />
            </div>
            <h3 className="landing-feature-title">{feature.title}</h3>
            <p className="landing-feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
