import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";

const CompletionScreen = ({
  trainingMode,
  selectedSet,
  progress,
  onRestart,
  onSelectNewSet,
}) => {
  const { t } = useLanguage();

  const getCompletionMessage = () => {
    if (!progress) return "Тренировка завершена!";

    if (progress.score !== undefined) {
      const percentage = Math.round((progress.score / progress.total) * 100);

      if (percentage >= 90) return "Отличный результат! 🎉";
      if (percentage >= 70) return "Хорошая работа! 👍";
      if (percentage >= 50) return "Неплохо! 😊";
      return "Продолжайте тренироваться! 💪";
    }

    return "Тренировка завершена!";
  };

  return (
    <div className="training-container completion-screen container-tp6">
      <h2>{getCompletionMessage()}</h2>

      <div className="completion-stats">
        <div className="stat-item">
          <span className="stat-label">Режим</span>
          <span className="stat-value">{trainingMode?.name}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Набор</span>
          <span className="stat-value">{selectedSet?.title}</span>
        </div>

        {progress && (
          <>
            {progress.completed !== undefined &&
              progress.total !== undefined && (
                <div className="stat-item">
                  <span className="stat-label">Прогресс</span>
                  <span className="stat-value">
                    {progress.completed}/{progress.total}
                  </span>
                </div>
              )}

            {progress.score !== undefined && (
              <div className="stat-item">
                <span className="stat-label">Результат</span>
                <span className="stat-value">
                  {progress.score} из {progress.total}(
                  {Math.round((progress.score / progress.total) * 100)}%)
                </span>
              </div>
            )}

            {progress.timeLeft !== undefined && (
              <div className="stat-item">
                <span className="stat-label">Оставшееся время</span>
                <span className="stat-value">{progress.timeLeft} сек</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="completion-actions">
        <button className="btn-tp1" onClick={onRestart}>
          🔄 {t("training.restart")}
        </button>
        <button className="btn-tp3" onClick={onSelectNewSet}>
          📚 {t("training.choose.another")}
        </button>
      </div>
    </div>
  );
};

export default CompletionScreen;
