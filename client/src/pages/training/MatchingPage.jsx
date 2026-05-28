import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "../../contexts/ThemeContext";
import { faLink } from "../../utils/icons";
import PageShell from "../../components/layout/PageShell";
import { useMatchingLogic } from "./matching/useMatchingLogic";
import MatchingHeader from "./matching/MatchingHeader";
import MatchingColumn from "./matching/MatchingColumn";
import MatchingArrows from "./matching/MatchingArrows";
import MatchingCompleteScreen from "./matching/MatchingCompleteScreen";

export default function MatchingPage() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  
  // Keyboard shortcuts hint
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);

  // Use custom hook for matching logic
  const {
    loading,
    finished,
    leftItems,
    rightItems,
    connections,
    selectedLeft,
    selectedRight,
    feedback,
    correctCount,
    incorrectCount,
    isSubmitting,
    batchIndex,
    totalBatches,
    progress,
    ttsLoading,
    ttsPlaying,
    trainingSettings,
    handleLeftClick,
    handleRightClick,
    handleTTS,
    getConnectedRightId,
    stopTTS,
  } = useMatchingLogic(setId, navigate);

  if (loading) {
    return (
      <PageShell currentTheme={currentTheme}>
        <div className="training-loading">Загрузка соответствий...</div>
      </PageShell>
    );
  }

  if (finished) {
    const accuracy =
      correctCount + incorrectCount > 0
        ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
        : 0;

    return (
      <MatchingCompleteScreen
        correctCount={correctCount}
        incorrectCount={incorrectCount}
        totalBatches={totalBatches}
        currentTheme={currentTheme}
      />
    );
  }

  return (
    <PageShell currentTheme={currentTheme} showBackButton backTo="/dashboard">
      <div className="matching-container">
        {/* Header */}
        <MatchingHeader
          batchIndex={batchIndex}
          totalBatches={totalBatches}
          progress={progress}
          correctCount={correctCount}
          incorrectCount={incorrectCount}
          showKeyboardHint={showKeyboardHint}
          setShowKeyboardHint={setShowKeyboardHint}
          currentTheme={currentTheme}
        />

        {/* Matching area */}
        <div className="matching-area">
          {/* Left column */}
          <MatchingColumn
            items={leftItems}
            side="left"
            selectedId={selectedLeft}
            connections={connections}
            feedback={feedback}
            isSubmitting={isSubmitting}
            onItemClick={handleLeftClick}
            getConnectedRightId={getConnectedRightId}
            trainingSettings={trainingSettings}
            handleTTS={handleTTS}
            currentTheme={currentTheme}
          />

          {/* Connection arrows (center column) */}
          <MatchingArrows leftItems={leftItems} />

          {/* Right column */}
          <MatchingColumn
            items={rightItems}
            side="right"
            selectedId={selectedRight}
            connections={connections}
            feedback={feedback}
            isSubmitting={isSubmitting}
            onItemClick={handleRightClick}
            getConnectedRightId={getConnectedRightId}
            trainingSettings={trainingSettings}
            handleTTS={handleTTS}
            currentTheme={currentTheme}
          />
        </div>

      </div>
    </PageShell>
  );
}

// Стили перенесены в training.css
