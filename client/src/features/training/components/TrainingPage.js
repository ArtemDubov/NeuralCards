import React, { useEffect } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useTraining } from "../../../hooks/useTraining";
import TrainingSession from "./TrainingSession";
import ModeSelection from "./ModeSelection";
import SetSelection from "./SetSelection";
import CompletionScreen from "./CompletionScreen";
import "./TrainingPage.css";

export function TrainingPage({ cardsets, selectedSetForTraining }) {
  const { t } = useLanguage();
  const training = useTraining();

  // Используем локальное состояние для режима и набора
  const [activeMode, setActiveMode] = React.useState(null);
  const [selectedSet, setSelectedSet] = React.useState(selectedSetForTraining);

  // Автовыбор набора если передан пропс
  useEffect(() => {
    if (selectedSetForTraining && !selectedSet) {
      setSelectedSet(selectedSetForTraining);
    }
  }, [selectedSetForTraining, selectedSet]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => training.cleanup();
  }, [training]);

  // Рендер разных экранов в зависимости от состояния

  // 1. Выбор режима тренировки
  if (!activeMode && !training.isTraining) {
    return (
      <ModeSelection
        trainingModes={training.getTrainingModes()}
        onSelectMode={(modeId) => {
          setActiveMode(modeId);
        }}
        onBack={() => window.history.back()}
      />
    );
  }

  // 2. Выбор набора карточек
  if (activeMode && !selectedSet && !training.isTraining) {
    return (
      <SetSelection
        cardsets={cardsets}
        trainingMode={training.getTrainingMode(activeMode)}
        onSelectSet={(set) => {
          setSelectedSet(set);
          training.startTraining(activeMode, set);
        }}
        onBack={() => setActiveMode(null)}
      />
    );
  }

  // 3. Экран завершения тренировки
  if (!training.isTraining && training.engineState.completed) {
    return (
      <CompletionScreen
        trainingMode={training.getTrainingMode(activeMode)}
        selectedSet={selectedSet}
        progress={training.getProgress()}
        onRestart={() => training.startTraining(activeMode, selectedSet)}
        onSelectNewSet={() => {
          training.endTraining();
          setActiveMode(null);
          setSelectedSet(null);
        }}
      />
    );
  }

  // 4. Активная тренировка
  if (training.isTraining && selectedSet) {
    return (
      <TrainingSession
        training={training}
        selectedSet={selectedSet}
        activeMode={activeMode}
        onAnswer={training.submitAnswer}
        onEnd={training.endTraining}
      />
    );
  }

  // 5. Загрузка
  if (training.loading) {
    return (
      <div className="training-container container-tp6">
        <div className="loading">Загрузка тренировки...</div>
      </div>
    );
  }

  // 6. Ошибка
  if (training.error) {
    return (
      <div className="training-container container-tp6">
        <div className="error-message">{training.error}</div>
        <button className="btn-tp3" onClick={training.endTraining}>
          Назад
        </button>
      </div>
    );
  }

  return (
    <div className="training-container container-tp6">
      <div className="loading">Подготовка тренировки...</div>
    </div>
  );
}
