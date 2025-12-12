import React from "react";
import { useAppStore } from "../../../shared/stores/appStore";
import { useTrainingStore } from "../../../shared/stores/training-legacy-adapter";

export const CompletionScreen = ({
  modeId,
  set,
  stats,
  onRestart,
  onNewSet,
}) => {
  const { t } = useAppStore();
  const { modes } = useTrainingStore();
  const mode = modes[modeId];

  const getScorePercentage = () => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.correct / stats.total) * 100);
  };

  const scorePercentage = getScorePercentage();

  const getProgressLevel = () => {
    if (scorePercentage >= 90) return "excellent";
    if (scorePercentage >= 70) return "good";
    if (scorePercentage >= 50) return "average";
    return "needs-improvement";
  };

  const progressLevel = getProgressLevel();

  const getProgressData = () => {
    switch (progressLevel) {
      case "excellent":
        return {
          color: "var(--nt-color-success)",
          emoji: "🏆",
          title: "Отличный результат!",
          badgeClass: "nt-badge--success",
        };
      case "good":
        return {
          color: "var(--nt-color-warning)",
          emoji: "⭐",
          title: "Хорошая работа!",
          badgeClass: "nt-badge--warning",
        };
      case "average":
        return {
          color: "var(--nt-color-info)",
          emoji: "📊",
          title: "Нормально, можно лучше",
          badgeClass: "nt-badge--info",
        };
      default:
        return {
          color: "var(--nt-color-error)",
          emoji: "📈",
          title: "Повторите материал",
          badgeClass: "nt-badge--error",
        };
    }
  };

  const progressData = getProgressData();

  return (
    <div className="nt-training-completion-overlay">
      <div className="nt-modal nt-modal--large nt-modal--animate-in">
        {/* ЗАГОЛОВОК С ГАЛОЧКОЙ */}
        <div className="nt-training-completion-header">
          <div className="nt-training-completion-icon-container">
            <div className="nt-training-completion-icon">
              <div className="nt-training-completion-icon-check"></div>
            </div>
          </div>

          <div className="nt-training-completion-title-section">
            <h2 className="nt-modal__title nt-util__text-center">
              {t("training.completed.title")}
            </h2>
            <div className="nt-training-completion-subtitle">
              {t("training.completed.subtitle")}
            </div>
          </div>
        </div>

        {/* ОСНОВНОЕ СОДЕРЖИМОЕ */}
        <div className="nt-modal__content">
          {/* ИНФОРМАЦИОННЫЕ БЛОКИ */}
          <div
            className="nt-content__grid nt-util__mb-xl"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "var(--nt-space-lg)",
            }}
          >
            <div className="nt-content__card">
              <div className="nt-card__content">
                <div className="nt-card__header">
                  <span className="nt-card__subtitle">
                    🎮 {t("training.completed.mode")}
                  </span>
                </div>
                <div className="nt-card__body">
                  <p className="nt-card__title nt-util__line-clamp-2">
                    {t(mode?.nameKey || "")}
                  </p>
                </div>
              </div>
            </div>

            <div className="nt-content__card">
              <div className="nt-card__content">
                <div className="nt-card__header">
                  <span className="nt-card__subtitle">
                    📚 {t("training.completed.set")}
                  </span>
                </div>
                <div className="nt-card__body">
                  <p className="nt-card__title nt-util__line-clamp-2">
                    {set?.title || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* РЕЗУЛЬТАТЫ В ТАБЛИЧНОМ ФОРМАТЕ */}
          {stats && (
            <div className="nt-content__card nt-util__mb-xl">
              <div className="nt-card__header nt-util__mb-lg">
                <h3 className="nt-card__title">📊 Результаты тренировки</h3>
              </div>

              <div className="nt-training-results-list">
                {/* ВЫУЧЕНО КАРТОЧЕК */}
                <div className="nt-training-result-item">
                  <div className="nt-training-result-label-container">
                    <div className="nt-training-result-icon">✅</div>
                    <div>
                      <div className="nt-training-result-label">
                        Выучено карточек
                      </div>
                      <div className="nt-training-result-subtitle">
                        Правильные ответы из общего числа
                      </div>
                    </div>
                  </div>
                  <div className="nt-training-result-value-container">
                    <div className="nt-training-result-value">
                      <span className="nt-training-result-main-value nt-util__text-success">
                        {stats.correct}
                      </span>
                      <span className="nt-training-result-secondary-value">
                        из {stats.total}
                      </span>
                    </div>
                    <div className="nt-training-result-progress-bar">
                      <div
                        className="nt-training-result-progress-fill"
                        style={{
                          width: `${(stats.correct / stats.total) * 100}%`,
                          background: progressData.color,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* КОЛИЧЕСТВО ПОВТОРЕНИЙ */}
                <div className="nt-training-result-item">
                  <div className="nt-training-result-label-container">
                    <div className="nt-training-result-icon">🔄</div>
                    <div>
                      <div className="nt-training-result-label">
                        Количество повторений
                      </div>
                      <div className="nt-training-result-subtitle">
                        Сколько раз проходили этот набор
                      </div>
                    </div>
                  </div>
                  <div className="nt-training-result-value-container">
                    <div className="nt-training-result-value">
                      <span className="nt-training-result-main-value">
                        {stats.repetitions || 0}
                      </span>
                    </div>
                    <div className="nt-training-result-hint">
                      {stats.repetitions === 0
                        ? "Первый раз проходите"
                        : `Повторено ${stats.repetitions} раз`}
                    </div>
                  </div>
                </div>

                {/* ПРОГРЕСС */}
                <div className="nt-training-result-item">
                  <div className="nt-training-result-label-container">
                    <div className="nt-training-result-icon">
                      {progressData.emoji}
                    </div>
                    <div>
                      <div className="nt-training-result-label">Прогресс</div>
                      <div className="nt-training-result-subtitle">
                        Общая эффективность тренировки
                      </div>
                    </div>
                  </div>
                  <div className="nt-training-result-value-container">
                    <div className="nt-training-result-value">
                      <span
                        className={`nt-badge ${progressData.badgeClass} nt-badge--large`}
                      >
                        {scorePercentage}%
                      </span>
                    </div>
                    <div className="nt-training-result-assessment">
                      {progressData.title}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* СОВЕТ */}
          <div className="nt-content__card nt-card--highlight">
            <div className="nt-card__content">
              <div className="nt-card__header">
                <span className="nt-card__subtitle">
                  💡 Совет для лучшего запоминания
                </span>
              </div>
              <div className="nt-card__body">
                <p className="nt-card__text">
                  {scorePercentage >= 80
                    ? "Отлично! Для закрепления материала повторите через 2-3 дня."
                    : scorePercentage >= 60
                    ? "Хороший результат! Повторите сложные карточки через день."
                    : "Рекомендуем повторить тренировку завтра для лучшего запоминания."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* КНОПКИ ДЕЙСТВИЙ */}
        <div className="nt-modal__footer">
          <div className="nt-modal__actions">
            <button className="nt-btn nt-btn--primary" onClick={onRestart}>
              🔄 {t("training.restart")}
            </button>

            <button className="nt-btn nt-btn--secondary" onClick={onNewSet}>
              📚 {t("training.choose.another")}
            </button>

            <button
              className="nt-btn nt-btn--ghost"
              onClick={() => (window.location.href = "/training")}
            >
              🏠 {t("training.back.home")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
