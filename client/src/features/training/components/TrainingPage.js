import React, { useState, useEffect } from "react";
import { useTrainingStore } from "../../../shared/stores/training-legacy-adapter";
import { useTrainingSession } from "../hooks/useTrainingSession";
import { ModeSelection } from "./ModeSelection";
import { SetSelection } from "./SetSelection";
import { SessionWrapper } from "./sessions/SessionWrapper";
import { CompletionScreen } from "./CompletionScreen";

export const TrainingPage = ({
  cardSets,
  selectedSetForTraining,
  onBackToSets,
}) => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedSet, setSelectedSet] = useState(null);
  const [isStartingSession, setIsStartingSession] = useState(false); // ← новое состояние

  const { startSession } = useTrainingStore();
  const session = useTrainingSession();

  // Единая функция возврата
  const handleBack = () => {
    if (onBackToSets) {
      onBackToSets();
    }
  };

  // Логика для автоматического старта сессии при предвыбранном наборе
  useEffect(() => {
    console.log("🔍 TrainingPage состояние:", {
      selectedMode,
      selectedSetForTraining,
      selectedSet, // ← сейчас здесь уже есть набор!
      isStartingSession,
    });

    // ИЗМЕНИ УСЛОВИЕ:
    if (selectedMode && selectedSetForTraining && !isStartingSession) {
      console.log("🚀 Старт сессии:", {
        mode: selectedMode,
        set: selectedSetForTraining,
      });

      setIsStartingSession(true);
      startSession(selectedMode, selectedSetForTraining);
      setSelectedSet(selectedSetForTraining); // ← теперь установится

      const timer = setTimeout(() => setIsStartingSession(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [
    selectedMode,
    selectedSetForTraining,
    selectedSet,
    isStartingSession,
    startSession,
  ]);

  // Если выбран режим и есть предвыбранный набор, но сессия еще не активна
  if (
    selectedMode &&
    selectedSetForTraining &&
    !session.isActive &&
    !session.isCompleted
  ) {
    return (
      <div className="-loader">
        <div className="-loader__spinner"></div>
        <p>Запуск тренировки...</p>
      </div>
    );
  }

  // Остальная логика без изменений
  if (!selectedMode) {
    return <ModeSelection onSelectMode={setSelectedMode} onBack={handleBack} />;
  }

  if (selectedMode && !selectedSet && !selectedSetForTraining) {
    return (
      <SetSelection
        cardSets={cardSets}
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
