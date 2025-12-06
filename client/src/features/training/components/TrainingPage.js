import React, { useState } from "react";
import { useTrainingStore } from "../../../shared/stores/training-legacy-adapter";
import { useTrainingSession } from "../hooks/useTrainingSession";
import { ModeSelection } from "./ModeSelection";
import { SetSelection } from "./SetSelection";
import { SessionWrapper } from "./sessions/SessionWrapper";
import { CompletionScreen } from "./CompletionScreen";

export const TrainingPage = ({ cardsets, onBackToSets }) => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedSet, setSelectedSet] = useState(null);

  const { startSession } = useTrainingStore();
  const session = useTrainingSession();

  // Единая функция возврата - как в других местах
  const handleBack = () => {
    if (onBackToSets) {
      onBackToSets();
    }
  };

  if (!selectedMode) {
    return <ModeSelection onSelectMode={setSelectedMode} onBack={handleBack} />;
  }

  if (selectedMode && !selectedSet) {
    return (
      <SetSelection
        cardsets={cardsets}
        modeId={selectedMode}
        onSelectSet={(set) => {
          setSelectedSet(set);
          startSession(selectedMode, set);
        }}
        onBack={() => setSelectedMode(null)}
      />
    );
  }

  if (session.isActive) {
    return (
      <SessionWrapper
        mode={selectedMode}
        cards={session.cards}
        onAnswer={session.handleAnswer}
        onEnd={() => {
          session.endSession();
          setSelectedMode(null);
          setSelectedSet(null);
        }}
        onBack={handleBack}
      />
    );
  }

  if (session.isCompleted) {
    return (
      <CompletionScreen
        modeId={selectedMode}
        set={selectedSet}
        stats={session.session?.stats}
        onRestart={() => {
          session.endSession();
          session.startSession(selectedMode, selectedSet);
        }}
        onNewSet={() => {
          session.endSession();
          setSelectedMode(null);
          setSelectedSet(null);
        }}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="-loader">
      <div className="-loader__spinner"></div>
      <p>Загрузка...</p>
    </div>
  );
};
