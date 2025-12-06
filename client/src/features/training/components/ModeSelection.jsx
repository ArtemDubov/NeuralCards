import React from "react";
import { useAppStore } from "../../../shared/stores/appStore";
import { useTrainingStore } from "../../../shared/stores/training-legacy-adapter";

export const ModeSelection = ({ onSelectMode, onBack }) => {
  const { t } = useAppStore();
  const { modes } = useTrainingStore();

  return (
    <div className="nt-training-selection">
      <div className="nt-page__header">
        <button onClick={onBack} className="nt-btn nt-btn--secondary">
          {t("sets.back")}
        </button>
        <h2 className="nt-page__title">🎯 {t("training.choose.mode")}</h2>
      </div>

      <div className="nt-training-modes-grid">
        {Object.values(modes).map((mode) => (
          <div
            key={mode.id}
            className="nt-training-mode-card"
            onClick={() => onSelectMode(mode.id)}
          >
            <div className="nt-training-mode-icon">{mode.icon}</div>
            <h3 className="nt-training-mode-title">{t(mode.nameKey)}</h3>
            <p className="nt-training-mode-description">
              {t(mode.descriptionKey)}
            </p>
            <div className="nt-training-mode-requirements">
              {t("training.min_cards")}: {mode.minCards}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
