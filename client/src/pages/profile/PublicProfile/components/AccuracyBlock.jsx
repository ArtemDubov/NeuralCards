import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye } from "../../../../utils/icons";

export default function AccuracyBlock({ accuracy, currentTheme }) {
  const acc = accuracy || 0;
  
  const getMessage = () => {
    if (acc >= 90) return 'Отличный результат! Мастерское владение материалом';
    if (acc >= 75) return 'Хороший уровень! Продолжайте в том же духе';
    if (acc >= 60) return 'Неплохо, но есть куда расти';
    return 'Рекомендуем повторить материал';
  };

  return (
    <div className="accuracy-block">
      <div className="accuracy-content">
        <div className="accuracy-icon">
          <FontAwesomeIcon 
            icon={faBullseye} 
            style={{ fontSize: "32px", color: currentTheme?.success || "var(--nt-success)" }} 
          />
        </div>
        <div className="accuracy-info">
          <div className="accuracy-title">Точность ответов</div>
          <div className="accuracy-percentage">{acc}%</div>
          <div className="accuracy-bar">
            <div 
              className="accuracy-bar-fill"
              style={{
                width: `${acc}%`,
                background: `linear-gradient(90deg, var(--nt-success) 0%, ${acc > 80 ? 'var(--nt-success-light)' : 'var(--nt-warning)'} 100%)`
              }}
            />
          </div>
          <div className="accuracy-description">{getMessage()}</div>
        </div>
      </div>
    </div>
  );
}
