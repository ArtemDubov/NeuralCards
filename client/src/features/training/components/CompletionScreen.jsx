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

  const getScoreClass = (percentage) => {
    if (percentage >= 80) return "nt-util__text-success";
    if (percentage >= 60) return "nt-util__text-warning";
    return "nt-util__text-error";
  };

  const getBadgeClass = (percentage) => {
    if (percentage >= 80) return "nt-util__bg-success nt-util__text-primary";
    if (percentage >= 60) return "nt-util__bg-warning nt-util__text-primary";
    return "nt-util__bg-error nt-util__text-primary";
  };

  const scorePercentage = getScorePercentage();

  return (
    <div className="nt-util__flex nt-util__flex-col nt-util__items-center nt-util__justify-center nt-util__p-xl">
      <div className="nt-card nt-util__w-full nt-util__max-w-lg nt-util__p-xl">
        {/* ЗАГОЛОВОК С АНИМАЦИЕЙ */}
        <div className="nt-util__flex nt-util__flex-col nt-util__items-center nt-util__mb-xl">
          <div
            className="nt-util__text-accent nt-util__text-center nt-util__mb-lg nt-util__animate-pulse"
            style={{ fontSize: "4rem" }}
          >
            🏆
          </div>
          <h2
            className="nt-util__text-accent nt-util__text-center nt-util__mb-md"
            style={{ fontSize: "2rem" }}
          >
            {t("training.completed.title")}
          </h2>
          <p className="nt-util__text-secondary nt-util__text-center">
            {t("training.completed.subtitle") ||
              "Тренировка успешно завершена!"}
          </p>
        </div>

        {/* СТАТИСТИКА В КАРТОЧКАХ */}
        <div className="nt-util__grid nt-util__gap-lg nt-util__mb-xl">
          {/* РЕЖИМ И НАБОР */}
          <div className="nt-util__flex nt-util__gap-md nt-util__flex-wrap">
            <div className="nt-card--set nt-util__flex-1 nt-util__min-w-200">
              <div className="nt-card__content">
                <h3 className="nt-card__subtitle">
                  {t("training.completed.mode")}
                </h3>
                <p className="nt-card__title nt-util__line-clamp-2">
                  {t(mode?.nameKey || "")}
                </p>
              </div>
            </div>
            <div className="nt-card--set nt-util__flex-1 nt-util__min-w-200">
              <div className="nt-card__content">
                <h3 className="nt-card__subtitle">
                  {t("training.completed.set")}
                </h3>
                <p className="nt-card__title nt-util__line-clamp-2">
                  {set?.title || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* ЦИФРЫ СТАТИСТИКИ */}
          {stats && (
            <div className="nt-util__grid nt-util__grid-cols-2 nt-util__gap-md">
              <div className="nt-content__card nt-util__text-center">
                <div className="nt-util__text-secondary nt-util__text-sm">
                  {t("training.completed.correct")}
                </div>
                <div className="nt-util__text-success nt-util__text-2xl nt-util__font-bold">
                  {stats.correct}
                </div>
              </div>
              <div className="nt-content__card nt-util__text-center">
                <div className="nt-util__text-secondary nt-util__text-sm">
                  {t("training.completed.total")}
                </div>
                <div className="nt-util__text-primary nt-util__text-2xl nt-util__font-bold">
                  {stats.total}
                </div>
              </div>
              <div className="nt-content__card nt-util__col-span-2 nt-util__text-center nt-util__p-lg">
                <div className="nt-util__text-secondary nt-util__mb-sm">
                  {t("training.completed.score")}
                </div>
                <div
                  className={`nt-util__text-xl nt-util__font-bold nt-util__rounded-full nt-util__p-sm ${getBadgeClass(
                    scorePercentage
                  )}`}
                >
                  {scorePercentage}%
                </div>
                <div
                  className={`nt-util__text-sm nt-util__mt-xs ${getScoreClass(
                    scorePercentage
                  )}`}
                >
                  {scorePercentage >= 80
                    ? "Отлично!"
                    : scorePercentage >= 60
                    ? "Хорошо"
                    : "Повторите материал"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ВРЕМЯ (если есть) */}
        {stats?.startTime && (
          <div className="nt-util__flex nt-util__justify-center nt-util__items-center nt-util__gap-sm nt-util__mb-xl nt-util__text-secondary">
            <span>⏱️</span>
            <span>
              {t("training.completed.time")}:{" "}
              {new Date(stats.startTime).toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* КНОПКИ ДЕЙСТВИЙ */}
        <div className="nt-util__flex nt-util__gap-lg nt-util__justify-center nt-util__flex-wrap">
          <button
            className="nt-btn nt-btn--primary nt-btn--large"
            onClick={onRestart}
          >
            <span className="nt-util__mr-sm">🔄</span>
            {t("training.restart")}
          </button>
          <button
            className="nt-btn nt-btn--secondary nt-btn--large"
            onClick={onNewSet}
          >
            <span className="nt-util__mr-sm">📚</span>
            {t("training.choose.another")}
          </button>
          <button
            className="nt-btn nt-btn--ghost nt-btn--large"
            onClick={() => (window.location.href = "/training")}
          >
            <span className="nt-util__mr-sm">🏠</span>
            {t("training.back.home") || "На главную"}
          </button>
        </div>
      </div>
    </div>
  );
};
