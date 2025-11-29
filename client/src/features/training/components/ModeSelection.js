import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";

const ModeSelection = ({ trainingModes, onSelectMode, onBack }) => {
  const { t } = useLanguage();

  return (
    <div>
      <div className="sets-grid">
        {trainingModes.map((mode) => (
          <div
            key={mode.id}
            className="cardset-item"
            onClick={() => onSelectMode(mode.id)}
          >
            <div className="set-header">
              <div
                className="mode-content"
                style={{ cursor: "default", flex: 1 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div className="mode-icon" style={{ fontSize: "2rem" }}>
                    {mode.icon}
                  </div>
                  <h3>{mode.name}</h3>
                </div>
                <p
                  style={{
                    margin: "0.5rem 0",
                    color: "var(--color-text-secondary)",
                    lineHeight: "1.4",
                  }}
                >
                  {mode.description}
                </p>
                <div className="cards-count">
                  {t("training.min_cards")}: {mode.minCards}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModeSelection;
