import React from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useExamMode } from "../../hooks/useExamMode";

export const ExamSession = ({ cards, onAnswer, onEnd }) => {
  const { t } = useAppStore();
  const exam = useExamMode(cards, onAnswer);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Экран результатов
  if (exam.isCompleted) {
    const results = exam.getResults();

    return (
      <div className="nt-training-container">
        <div className="nt-training-completion">
          <div className="nt-training-completion-icon">🎓</div>
          <h2 className="nt-training-completion-title">
            {t("training.exam.completed") || "Экзамен завершен!"}
          </h2>

          <div className="nt-training-completion-stats">
            <div className="nt-training-stat-row">
              <span className="nt-training-stat-label">Результат:</span>
              <span
                className={`nt-training-stat-value ${
                  results.passed
                    ? "nt-training-stat-value--excellent"
                    : "nt-training-stat-value--poor"
                }`}
              >
                {results.score}%
              </span>
            </div>
            <div className="nt-training-stat-row">
              <span className="nt-training-stat-label">
                Правильных ответов:
              </span>
              <span className="nt-training-stat-value">
                {results.correct} / {results.total}
              </span>
            </div>
            <div className="nt-training-stat-row">
              <span className="nt-training-stat-label">
                Пропущено по времени:
              </span>
              <span className="nt-training-stat-value">{results.timeouts}</span>
            </div>
            <div className="nt-training-stat-row">
              <span className="nt-training-stat-label">Минимальный порог:</span>
              <span className="nt-training-stat-value">75%</span>
            </div>
            <div className="nt-training-stat-row">
              <span className="nt-training-stat-label">Статус:</span>
              <span
                className={`nt-training-stat-value ${
                  results.passed
                    ? "nt-training-stat-value--excellent"
                    : "nt-training-stat-value--poor"
                }`}
              >
                {results.passed
                  ? t("training.exam.passed") || "СДАЛ ✅"
                  : t("training.exam.failed") || "НЕ СДАЛ ❌"}
              </span>
            </div>
          </div>

          <div className="nt-training-completion-actions">
            <button onClick={onEnd} className="nt-btn nt-btn--primary">
              {t("training.finish") || "Завершить"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Основной экран экзамена
  return (
    <div className="nt-training-container">
      {/* Заголовок */}
      <div className="nt-training-header">
        <button
          onClick={onEnd}
          className="nt-btn nt-btn--secondary nt-btn--icon"
          title={t("training.end_session") || "Завершить тренировку"}
        >
          ✕
        </button>
        <div className="nt-training-title">
          <span className="nt-training-icon">🎓</span>
          <span>{t("training.mode.exam") || "Экзамен"}</span>
        </div>
        <div className="nt-util__flex nt-util__gap-lg">
          <div className="nt-training-progress">
            {t("training.question") || "Вопрос"} {exam.stats.current} /{" "}
            {exam.stats.total}
          </div>
        </div>
      </div>

      {/* Таймер */}
      <div className="nt-util__text-center nt-util__mb-lg">
        <div
          className={`nt-util__inline-block nt-util__p-md nt-util__rounded-lg ${
            exam.stats.timeLeft < 10
              ? "nt-util__bg-error"
              : "nt-util__bg-accent"
          }`}
        >
          <div className="nt-util__flex nt-util__items-center nt-util__gap-sm">
            <span className="nt-training-icon">⏱️</span>
            <span className="nt-util__font-bold nt-util__text-lg">
              {formatTime(exam.stats.timeLeft)}
            </span>
            <span className="nt-util__text-xs">
              {t("training.exam.time_left") || "на ответ"}
            </span>
          </div>
        </div>
      </div>

      {/* Прогресс-бар */}
      <div className="nt-util__mb-xl">
        <div className="nt-util__h-2 nt-util__bg-secondary nt-util__rounded-full nt-util__overflow-hidden">
          <div
            className="nt-util__h-full nt-util__bg-accent nt-util__transition-base"
            style={{
              width: `${(exam.stats.current / exam.stats.total) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Карточка */}
      {exam.currentCard ? (
        <div className="nt-training-content">
          <div className="nt-training-card">
            <div className="nt-training-card-label">
              <span className="nt-training-card-label-icon">❓</span>
              <span className="nt-training-card-label-text">
                {t("training.exam.question") || "Экзаменационный вопрос"}
              </span>
            </div>

            <div className="nt-training-card-text nt-training-text-xlarge nt-util__text-center">
              {exam.currentCard.front}
            </div>

            <p className="nt-util__text-secondary nt-util__text-center nt-util__mt-lg">
              {t("training.exam.instructions") ||
                "У вас есть 30 секунд на ответ"}
            </p>

            {/* Кнопки ответов */}
            <div className="nt-util__grid nt-grid--2cols nt-grid--gap-lg nt-util__mt-xl">
              <button
                className="nt-btn nt-btn--training nt-btn--training-correct"
                onClick={exam.handleCorrect}
                disabled={!exam.timerActive}
              >
                <span className="nt-training-icon nt-util__mr-sm">✅</span>
                <span className="nt-training-text">
                  {t("training.exam.know") || "Знаю ответ"}
                </span>
              </button>

              <button
                className="nt-btn nt-btn--training nt-btn--training-wrong"
                onClick={exam.handleWrong}
                disabled={!exam.timerActive}
              >
                <span className="nt-training-icon nt-util__mr-sm">❌</span>
                <span className="nt-training-text">
                  {t("training.exam.dont_know") || "Не знаю"}
                </span>
              </button>
            </div>

            {/* Предупреждение */}
            <div className="nt-util__mt-lg nt-util__p-md nt-util__bg-warning nt-util__rounded-lg">
              <p className="nt-util__text-center nt-util__text-sm">
                ⚠️{" "}
                {t("training.exam.warning") ||
                  "Если время выйдет - ответ засчитается как неправильный!"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="nt-training-empty-state">
          <div className="nt-loader__spinner"></div>
          <p className="nt-util__text-secondary nt-util__mt-md">
            {t("training.exam.loading") ||
              "Загрузка экзаменационных вопросов..."}
          </p>
        </div>
      )}

      {/* Статистика */}
      <div className="nt-training-stats nt-util__mt-xl">
        <div className="nt-util__grid nt-grid--3cols nt-grid--gap-md">
          <div className="nt-training-stat-box">
            <div className="nt-training-stat-label">
              {t("training.exam.correct") || "Правильно"}
            </div>
            <div className="nt-training-stat-value nt-training-stat-value--excellent">
              {exam.stats.correct}
            </div>
          </div>
          <div className="nt-training-stat-box">
            <div className="nt-training-stat-label">
              {t("training.exam.timeouts") || "Таймаутов"}
            </div>
            <div className="nt-training-stat-value">{exam.stats.timeouts}</div>
          </div>
          <div className="nt-training-stat-box">
            <div className="nt-training-stat-label">
              {t("training.exam.current_score") || "Текущий балл"}
            </div>
            <div className="nt-training-stat-value nt-training-stat-value--good">
              {exam.score}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
