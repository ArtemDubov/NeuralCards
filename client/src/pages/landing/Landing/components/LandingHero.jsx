import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap } from '../../../../utils/icons';

/**
 * Компонент Hero секции лендинга (минималистичный)
 */
export default function LandingHero({ currentTheme }) {
  const t = currentTheme;

  return (
    <section className="landing-hero" style={{ background: t.background }}>
      <div className="landing-hero-content">
        {/* Пустая секция для визуального баланса */}
      </div>
    </section>
  );
}
