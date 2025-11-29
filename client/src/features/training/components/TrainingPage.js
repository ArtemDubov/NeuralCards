import React, { useEffect } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useTraining } from "../../../hooks/useTraining";
import TrainingSession from "./TrainingSession";
import ModeSelection from "./ModeSelection";
import SetSelection from "./SetSelection";
import CompletionScreen from "./CompletionScreen";

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
      <div className="page-container training-page">
        <div className="page-header">
          <h2>🎯 {t("training.choose.mode")}</h2>
          <div className="sets-header-controls">
            <button className="btn-tp3" onClick={() => window.history.back()}>
              {t("sets.back")}
            </button>
          </div>
        </div>
        <div className="content-card">
          <ModeSelection
            trainingModes={training.getTrainingModes()}
            onSelectMode={(modeId) => {
              setActiveMode(modeId);
            }}
            onBack={() => window.history.back()}
          />
        </div>
      </div>
    );
  }

  // 2. Выбор набора карточек
  if (activeMode && !selectedSet && !training.isTraining) {
    return (
      <div className="page-container training-page">
        <div className="page-header">
          <h2>🎯 Выбор набора</h2>
          <div className="progress-info">
            Режим: {training.getTrainingMode(activeMode)?.name}
          </div>
        </div>
        <div className="content-card">
          <SetSelection
            cardsets={cardsets}
            trainingMode={training.getTrainingMode(activeMode)}
            onSelectSet={(set) => {
              setSelectedSet(set);
              training.startTraining(activeMode, set);
            }}
            onBack={() => setActiveMode(null)}
          />
        </div>
      </div>
    );
  }

  // 3. Экран завершения тренировки
  if (!training.isTraining && training.engineState.completed) {
    return (
      <div className="page-container training-page">
        <div className="content-card">
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
        </div>
      </div>
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
      <div className="page-container training-page">
        <div className="content-card">
          <div className="loading">Загрузка тренировки...</div>
        </div>
      </div>
    );
  }

  // 6. Ошибка
  if (training.error) {
    return (
      <div className="page-container training-page">
        <div className="content-card">
          <div className="error-message">{training.error}</div>
          <button className="btn-tp3" onClick={training.endTraining}>
            {t("sets.back")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container training-page">
      <div className="content-card">
        <div className="loading">Подготовка тренировки...</div>
      </div>
    </div>
  );
}
