import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";

const SetSelection = ({ cardsets, trainingMode, onSelectSet, onBack }) => {
  const { t } = useLanguage();

  return (
    <div className="training-container container-tp6">
      <div className="training-header">
        <button className="btn-tp3" onClick={onBack}>
          ← {t("sets.back")}
        </button>
        <h2>
          {trainingMode?.name || t("training.set.selection.title")} -{" "}
          {t("sets.view")}
        </h2>
      </div>

      <div className="sets-selection">
        <div className="training-info">
          <p>{trainingMode?.description}</p>
          <div className="requirements">
            {t("training.min_cards")}: {trainingMode?.minCards || 1}
          </div>
        </div>

        <div className="sets-grid">
          {cardsets.map((set) => {
            const cardCount = set.cards?.length || 0;
            const canStart = cardCount >= (trainingMode?.minCards || 1);

            return (
              <div key={set.id} className="training-set-card container-tp4">
                <h4>{set.title}</h4>
                <p className="cards-count">
                  {t("sets.cards_count")}: {cardCount}
                </p>

                {!canStart && (
                  <div className="warning-message">
                    ⚠️ {t("training.minimum.cards")} {trainingMode?.minCards}
                  </div>
                )}

                <button
                  className={`btn-tp1 ${!canStart ? "disabled" : ""}`}
                  onClick={() => canStart && onSelectSet(set)}
                  disabled={!canStart}
                >
                  {t("training.start")}
                </button>
              </div>
            );
          })}
        </div>

        {cardsets.length === 0 && (
          <div className="empty-state">
            <p>{t("sets.empty")}</p>
            <p>{t("training.create.set.hint")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetSelection;
