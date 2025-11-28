import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";

const ModeSelection = ({ trainingModes, onSelectMode, onBack }) => {
  const { t } = useLanguage();

  return (
    <div className="training-container container-tp6">
      <div className="training-header">
        {onBack && (
          <button className="btn-tp3" onClick={onBack}>
            {t("sets.back")}
          </button>
        )}
        <h2>{t("training.choose.mode")}</h2>
      </div>

      <div className="mode-selection">
        {trainingModes.map((mode) => (
          <div
            key={mode.id}
            className="mode-card"
            onClick={() => onSelectMode(mode.id)}
          >
            <div className="mode-icon">{mode.icon}</div>
            <h3>{mode.name}</h3>
            <p>{mode.description}</p>
            <div className="mode-requirements">
              Минимум карточек: {mode.minCards}
            </div>
          </div>
        ))}
      </div>

      {/* 🎯 МЕСТО ДЛЯ БУДУЩИХ РЕЖИМОВ - просто добавляем в массив trainingModes */}
    </div>
  );
};

export default ModeSelection;
