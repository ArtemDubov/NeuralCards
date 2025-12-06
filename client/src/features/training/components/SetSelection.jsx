import React from "react";
import { useAppStore } from "../../../shared/stores/appStore";
import { useTrainingStore } from "../../../shared/stores/training-legacy-adapter";

export const SetSelection = ({ cardsets, modeId, onSelectSet, onBack }) => {
  const { t } = useAppStore();
  const { modes } = useTrainingStore();
  const mode = modes[modeId];

  if (!mode) {
    return (
      <div className="nt-page__container">
        <div className="nt-content__card">
          <p className="nt-util__text-error">Режим не найден</p>
        </div>
      </div>
    );
  }

  const availableSets = cardsets.filter((set) => {
    const cardCount = set.cards?.length || 0;
    return cardCount >= mode.minCards;
  });

  if (cardsets.length === 0) {
    return (
      <div className="nt-training-selection">
        <div className="nt-page__header">
          <h2 className="nt-page__title">
            🎯 {t(mode.nameKey)} - {t("training.choose.set")}
          </h2>
          <div className="nt-page__header-controls">
            <button onClick={onBack} className="nt-btn nt-btn--secondary">
              {t("training.choose.another.mode")}
            </button>
          </div>
        </div>

        <div className="nt-util__empty-state">
          <div className="nt-util__empty-icon">📚</div>
          <h3 className="nt-util__empty-title">
            {t("training.no_sets.title")}
          </h3>
          <p className="nt-util__empty-text">{t("training.no_sets.message")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nt-training-selection">
      <div className="nt-page__header">
        <h2 className="nt-page__title">
          🎯 {t(mode.nameKey)} - {t("training.choose.set")}
        </h2>
        <div className="nt-page__header-controls">
          <button onClick={onBack} className="nt-btn nt-btn--secondary">
            {t("training.choose.another.mode")}
          </button>
        </div>
      </div>

      <div className="nt-training-requirements">
        <div className="nt-training-requirement-item">
          <span className="nt-training-requirement-label">
            {t("training.min_cards")}:
          </span>
          <span className="nt-training-requirement-value">{mode.minCards}</span>
        </div>
        <div className="nt-training-requirement-item">
          <span className="nt-training-requirement-label">
            {t("training.available_sets")}:
          </span>
          <span
            className={`nt-training-requirement-value ${
              availableSets.length === 0
                ? "nt-training-requirement-value--warning"
                : ""
            }`}
          >
            {availableSets.length} из {cardsets.length}
          </span>
        </div>
      </div>

      <div className="nt-training-modes-grid">
        {cardsets.map((set) => {
          const cardCount = set.cards?.length || 0;
          const canStart = cardCount >= mode.minCards;

          const getTagsArray = () => {
            if (!set.tags) return [];
            if (Array.isArray(set.tags)) {
              return set.tags.map((tag) =>
                typeof tag === "string" ? tag : tag.name || tag
              );
            }
            if (typeof set.tags === "string") {
              return set.tags.split(",").map((tag) => tag.trim());
            }
            return [];
          };

          const tagsArray = getTagsArray();
          const hasImages = set.cards?.some(
            (card) => card.imageUrl || card.backImageUrl
          );
          const hasAudio = set.cards?.some(
            (card) => card.audioUrl || card.backAudioUrl
          );

          return (
            <div
              key={set.id}
              className={`nt-training-mode-card ${
                !canStart ? "nt-training-set-item disabled" : ""
              }`}
              onClick={() => canStart && onSelectSet(set)}
            >
              <div className="nt-util__flex nt-util__justify-between nt-util__items-center nt-util__w-full">
                <h3 className="nt-training-mode-title nt-util__truncate">
                  {set.title}
                </h3>
                <div
                  className={`nt-training-availability ${
                    canStart
                      ? "nt-training-availability--yes"
                      : "nt-training-availability--no"
                  }`}
                  title={
                    canStart
                      ? t("training.set.available")
                      : t("training.set.not_enough_cards", {
                          min: mode.minCards,
                        })
                  }
                >
                  {canStart ? "✓" : "!"}
                </div>
              </div>

              <p className="nt-training-mode-description nt-util__line-clamp-2">
                {set.description || t("sets.no_description")}
              </p>

              <div className="nt-util__flex nt-util__justify-between nt-util__items-center nt-util__mt-md">
                <span className="nt-training-mode-requirements">
                  {cardCount} {t("sets.cards_count") || "карточек"}
                </span>
                {(hasImages || hasAudio) && (
                  <div className="nt-util__flex nt-util__gap-xs">
                    {hasImages && <span className="tag">🖼️</span>}
                    {hasAudio && <span className="tag">🎵</span>}
                  </div>
                )}
              </div>

              {tagsArray.length > 0 && (
                <div className="nt-util__flex nt-util__gap-xs nt-util__mt-sm">
                  {tagsArray.slice(0, 2).map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                  {tagsArray.length > 2 && (
                    <span className="tag nt-util__bg-secondary">
                      +{tagsArray.length - 2}
                    </span>
                  )}
                </div>
              )}

              {!canStart && (
                <div className="nt-training-warning nt-util__mt-sm">
                  ⚠️{" "}
                  {t("training.set.not_enough_cards", { min: mode.minCards })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
