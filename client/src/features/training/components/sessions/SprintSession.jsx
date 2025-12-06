import React from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useSprintMode } from "../../hooks/useSprintMode";

export const SprintSession = ({ cards, onAnswer, onEnd }) => {
  const { t } = useAppStore();
  const sprint = useSprintMode(cards, onAnswer);

  // Форматирование времени
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="nt-training-container">
        <div className="nt-training-empty-state">
          <div className="nt-training-empty-icon">📭</div>
          <h3 className="nt-util__text-center">
            {t("training.no_cards.title") || "Нет карточек"}
          </h3>
          <p className="nt-util__text-secondary nt-util__text-center">
            {t("training.no_cards.message") || "Добавьте карточки в набор"}
          </p>
        </div>
      </div>
    );
  }

  // Если спринт завершен
  if (!sprint.isActive && sprint.timeLeft <= 0) {
    return (
      <div className="nt-training-container">
        <div className="nt-training-completion">
          <div className="nt-training-completion-icon">⚡</div>
          <h2 className="nt-training-completion-title">
            {t("training.sprint.completed") || "Спринт завершен!"}
          </h2>
          <div className="nt-training-completion-stats">
            <div className="nt-training-stat-row">
              <span className="nt-training-stat-label">Набрано очков:</span>
              <span className="nt-training-stat-value nt-training-stat-value--excellent">
                {sprint.score}
              </span>
            </div>
            <div className="nt-training-stat-row">
              <span className="nt-training-stat-label">
                Правильных ответов:
              </span>
              <span className="nt-training-stat-value">
                {sprint.correctAnswers}
              </span>
            </div>
            <div className="nt-training-stat-row">
              <span className="nt-training-stat-label">
                Неправильных ответов:
              </span>
              <span className="nt-training-stat-value">
                {sprint.incorrectAnswers}
              </span>
            </div>
          </div>
          <div className="nt-training-completion-actions">
            <button onClick={sprint.reset} className="nt-btn nt-btn--secondary">
              🔄 {t("training.restart") || "Начать заново"}
            </button>
            <button onClick={onEnd} className="nt-btn nt-btn--primary">
              {t("training.finish") || "Завершить"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!sprint.currentCard) {
    return (
      <div className="nt-training-container">
        <div className="nt-training-empty-state">
          <div className="nt-training-empty-icon">⏳</div>
          <h3 className="nt-util__text-center">
            {t("training.sprint.preparing") || "Подготовка спринта..."}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="nt-training-container">
      {/* Шапка спринта */}
      <div className="nt-training-header">
        <button
          onClick={onEnd}
          className="nt-btn nt-btn--secondary nt-btn--icon"
          title={t("training.end_session") || "Завершить тренировку"}
        >
          ✕
        </button>
        <div className="nt-training-title">
          <span className="nt-training-icon">⚡</span>
          <span>{t("training.mode.sprint") || "Спринт"}</span>
        </div>
        <div className="nt-util__flex nt-util__gap-lg">
          <div className="nt-training-progress nt-util__flex nt-util__items-center nt-util__gap-sm">
            <span className="nt-training-icon">⏱️</span>
            <span>{formatTime(sprint.timeLeft)}</span>
          </div>
          <div className="nt-training-progress nt-util__flex nt-util__items-center nt-util__gap-sm">
            <span className="nt-training-icon">🏆</span>
            <span>
              {sprint.score} {t("training.sprint.points") || "очков"}
            </span>
          </div>
        </div>
      </div>

      {/* Карточка спринта */}
      <div className="nt-training-content">
        <div className="nt-training-card">
          <div className="nt-training-card-label">
            <span className="nt-training-card-label-icon">⚡</span>
            <span className="nt-training-card-label-text">
              {t("training.card.question") || "Вопрос"}
            </span>
          </div>

          <div className="nt-training-card-text nt-training-text-xlarge nt-util__text-center">
            {sprint.currentCard.front}
          </div>

          {/* Прогресс спринта */}
          <div className="nt-util__mt-lg">
            <div className="nt-util__h-2 nt-util__bg-secondary nt-util__rounded-full nt-util__overflow-hidden">
              <div
                className="nt-util__h-full nt-util__bg-accent nt-util__transition-base"
                style={{
                  width: `${
                    ((sprint.totalTime - sprint.timeLeft) / sprint.totalTime) *
                    100
                  }%`,
                }}
              ></div>
            </div>
            <p className="nt-util__text-secondary nt-util__text-center nt-util__text-sm nt-util__mt-sm">
              {t("training.sprint.instructions") ||
                "Отвечайте быстро! Каждая секунда на счету!"}
            </p>
          </div>
        </div>

        {/* Кнопки ответов */}
        <div className="nt-util__grid nt-grid--2cols nt-grid--gap-lg nt-util__mt-xl">
          <button
            className="nt-btn nt-btn--training nt-btn--training-wrong"
            onClick={sprint.handleWrong}
            disabled={!sprint.isActive}
          >
            <span className="nt-training-icon nt-util__mr-sm">❌</span>
            <span className="nt-training-text">
              {t("training.sprint.wrong") || "Неправильно"}
            </span>
          </button>

          <button
            className="nt-btn nt-btn--training nt-btn--training-correct"
            onClick={sprint.handleCorrect}
            disabled={!sprint.isActive}
          >
            <span className="nt-training-icon nt-util__mr-sm">✅</span>
            <span className="nt-training-text">
              {t("training.sprint.correct") || "Правильно"}
            </span>
          </button>
        </div>
      </div>

      {/* Статистика спринта */}
      <div className="nt-training-stats nt-util__mt-xl">
        <div className="nt-util__grid nt-grid--3cols nt-grid--gap-md">
          <div className="nt-training-stat-box">
            <div className="nt-training-stat-label">
              {t("training.sprint.correctAnswers") || "Правильно"}
            </div>
            <div className="nt-training-stat-value nt-training-stat-value--excellent">
              {sprint.correctAnswers}
            </div>
          </div>
          <div className="nt-training-stat-box">
            <div className="nt-training-stat-label">
              {t("training.sprint.incorrectAnswers") || "Неправильно"}
            </div>
            <div className="nt-training-stat-value nt-training-stat-value--poor">
              {sprint.incorrectAnswers}
            </div>
          </div>
          <div className="nt-training-stat-box">
            <div className="nt-training-stat-label">
              {t("training.sprint.speed") || "Скорость"}
            </div>
            <div className="nt-training-stat-value nt-training-stat-value--good">
              {sprint.totalAnswers > 0
                ? Math.round(
                    sprint.totalAnswers /
                      ((sprint.totalTime - sprint.timeLeft) / 60)
                  )
                : 0}{" "}
              {t("training.sprint.perMinute") || "карт/мин"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
