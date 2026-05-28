import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowsLeftRight, faKeyboard, faGear } from "../../../utils/icons";
import KeyboardShortcutsModal from "../../../components/common/KeyboardShortcutsModal";
import TrainingSettingsModal from "../../../components/common/TrainingSettingsModal";

/**
 * Matching game header with progress bar and controls.
 */
export default function MatchingHeader({
  batchIndex,
  totalBatches,
  progress,
  correctCount,
  incorrectCount,
  showKeyboardHint,
  setShowKeyboardHint,
  currentTheme
}) {
  const navigate = useNavigate();

  return (
    <div className="matching-header">
      <button onClick={() => navigate(-1)} className="matching-back-btn">
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>

      <div className="matching-progress-info">
        <div className="matching-progress-row">
          <FontAwesomeIcon
            icon={faArrowsLeftRight}
            className="matching-progress-icon"
          />
          <span className="matching-progress-text">
            Пачка {batchIndex + 1} / {totalBatches}
          </span>
        </div>
        <div className="matching-progress-bar">
          <div
            className="matching-progress-fill"
            style={{
              width: `${progress}%`,
              background: currentTheme.primary,
            }}
          />
        </div>
      </div>

      <div className="matching-header-right">
        <KeyboardShortcutsModal
          isOpen={showKeyboardHint}
          onClose={() => setShowKeyboardHint(false)}
          currentTheme={currentTheme}
        />
        
        <button
          onClick={() => setShowKeyboardHint(true)}
          className="matching-header-icon-btn"
          style={{
            background: showKeyboardHint ? currentTheme.primary : `${currentTheme.primary}15`,
            color: showKeyboardHint ? "#fff" : currentTheme.primary,
          }}
          title={showKeyboardHint ? "Скрыть подсказки" : "Показать подсказки"}
        >
          <FontAwesomeIcon icon={faKeyboard} />
        </button>

        <TrainingSettingsModal
          mode="matching"
          currentTheme={currentTheme}
          trigger={
            <button
              className="matching-header-icon-btn"
              style={{
                background: `${currentTheme.primary}15`,
                color: currentTheme.primary,
              }}
              title="Настройки тренировки"
            >
              <FontAwesomeIcon icon={faGear} />
            </button>
          }
        />
        <span className="matching-score-correct">{correctCount}</span>
        <span className="matching-score-incorrect">{incorrectCount}</span>
      </div>
    </div>
  );
}
