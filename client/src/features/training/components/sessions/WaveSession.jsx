import React from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useWaveMode } from "../../hooks/useWaveMode";

export const WaveSession = ({ cards, onAnswer, onEnd }) => {
  const { t } = useAppStore();
  const wave = useWaveMode(cards, onAnswer);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getWaveDifficulty = (waveNumber) => {
    if (waveNumber === 1) return t("training.wave.easy") || "🌊 Легкая волна";
    if (waveNumber === 2)
      return t("training.wave.medium") || "🌊🌊 Средняя волна";
    return t("training.wave.hard") || "🌊🌊🌊 Сложная волна";
  };

  if (!cards || cards.length < 8) {
    return (
      <div className="nt-training-container">
        <div className="nt-training-empty-state">
          <div className="nt-training-empty-icon">⚠️</div>
          <h3 className="nt-util__text-center">
            {t("training.wave.insufficient_cards") || "Недостаточно карточек"}
          </h3>
          <p className="nt-util__text-secondary nt-util__text-center">
            {t("training.wave.min_required") ||
              "Для режима 'Волна' нужно минимум 8 карточек"}
          </p>
          <div className="nt-util__mt-lg">
            <button onClick={onEnd} className="nt-btn nt-btn--secondary">
              {t("sets.back") || "Назад"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Если волна завершена
  if (wave.isCompleted) {
    return (
      <div className="nt-training-container">
        <div className="nt-training-completion">
          <div className="nt-training-completion-icon">🏆</div>
          <h2 className="nt-training-completion-title">
            {t("training.wave.completed") || "Все волны пройдены!"}
          </h2>
          <div className="nt-training-completion-stats">
            <div className="nt-training-stat-row">
              <span className="nt-training-stat-label">Итоговый счет:</span>
              <span className="nt-training-stat-value nt-training-stat-value--excellent">
                {wave.stats.score}
              </span>
            </div>
            <div className="nt-training-stat-row">
              <span className="nt-training-stat-label">Волн пройдено:</span>
              <span className="nt-training-stat-value">
                {wave.stats.wavesCompleted}
              </span>
            </div>
            <div className="nt-training-stat-row">
              <span className="nt-training-stat-label">Карточек всего:</span>
              <span className="nt-training-stat-value">{cards.length}</span>
            </div>
          </div>
          <div className="nt-training-completion-actions">
            <button onClick={onEnd} className="nt-btn nt-btn--primary">
              {t("training.finish") || "Завершить тренировку"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Состояние между волнами
  if (!wave.gameActive && !wave.isCompleted) {
    return (
      <div className="nt-training-container">
        <div className="nt-training-content nt-util__flex-col nt-util__items-center nt-util__justify-center">
          <div className="nt-training-card nt-util__text-center">
            <div className="nt-training-card-icon nt-util__text-4xl nt-util__mb-md">
              🌊
            </div>
            <h3 className="nt-training-card-title">
              {t("training.wave.completed_wave") ||
                `Волна ${wave.waveProgress.current} завершена!`}
            </h3>
            <p className="nt-util__text-secondary nt-util__mt-sm">
              {t("training.wave.preparing_next") ||
                "Подготовка к следующей волне..."}
            </p>
            <div className="nt-util__text-5xl nt-util__font-bold nt-util__text-accent nt-util__mt-lg">
              {wave.waveProgress.current < wave.waveProgress.total ? 3 : 0}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Основной игровой экран
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
          <span className="nt-training-icon">🌊</span>
          <span>{getWaveDifficulty(wave.waveProgress.current)}</span>
        </div>
        <div className="nt-util__flex nt-util__gap-lg">
          <div className="nt-training-progress">
            {wave.waveProgress.current} / {wave.waveProgress.total}
          </div>
        </div>
      </div>

      {/* Прогресс волны */}
      <div className="nt-training-content">
        <div className="nt-util__text-center nt-util__mb-xl">
          <div className="nt-util__flex nt-util__justify-center nt-util__gap-lg">
            <div className="nt-training-stat-box">
              <div className="nt-training-stat-label">Время</div>
              <div
                className={`nt-training-stat-value ${
                  wave.waveProgress.timeLeft < 10
                    ? "nt-training-stat-value--poor"
                    : "nt-training-stat-value--good"
                }`}
              >
                {formatTime(wave.waveProgress.timeLeft)}
              </div>
            </div>
            <div className="nt-training-stat-box">
              <div className="nt-training-stat-label">Очки</div>
              <div className="nt-training-stat-value nt-training-stat-value--excellent">
                {wave.stats.score}
              </div>
            </div>
            <div className="nt-training-stat-box">
              <div className="nt-training-stat-label">Карточка</div>
              <div className="nt-training-stat-value">
                {wave.waveProgress.currentCardInWave} /{" "}
                {wave.waveProgress.cardsInWave}
              </div>
            </div>
          </div>

          <p className="nt-util__text-secondary nt-util__mt-md">
            {wave.waveProgress.current === 1 &&
              (t("training.wave.first_instructions") ||
                "Первая волна: 3 карточки, 30 секунд")}
            {wave.waveProgress.current === 2 &&
              (t("training.wave.second_instructions") ||
                "Вторая волна: 5 карточек, 30 секунд (x2 очков!)")}
            {wave.waveProgress.current === 3 &&
              (t("training.wave.third_instructions") ||
                "Третья волна: 7 карточек, 30 секунд (x3 очков!)")}
          </p>
        </div>

        {/* Карточка */}
        {wave.currentCard ? (
          <div className="nt-training-card">
            <div className="nt-training-card-label">
              <span className="nt-training-card-label-icon">⚡</span>
              <span className="nt-training-card-label-text">
                {t("training.card.question") || "Вопрос"}
              </span>
            </div>

            <div className="nt-training-card-text nt-training-text-xlarge nt-util__text-center">
              {wave.currentCard.front}
            </div>

            <p className="nt-util__text-secondary nt-util__text-center nt-util__mt-lg">
              {t("training.wave.know_answer") || "Знаешь ответ?"}
            </p>

            {/* Кнопки ответов */}
            <div className="nt-util__grid nt-grid--2cols nt-grid--gap-lg nt-util__mt-xl">
              <button
                className="nt-btn nt-btn--training nt-btn--training-correct"
                onClick={wave.handleCorrect}
                disabled={!wave.gameActive}
              >
                <span className="nt-training-icon nt-util__mr-sm">✅</span>
                <span className="nt-training-text">
                  {t("training.know") || "Знаю!"}
                </span>
                <span className="nt-util__text-xs nt-util__ml-sm">
                  (+{10 * wave.waveProgress.current})
                </span>
              </button>

              <button
                className="nt-btn nt-btn--training nt-btn--training-wrong"
                onClick={wave.handleWrong}
                disabled={!wave.gameActive}
              >
                <span className="nt-training-icon nt-util__mr-sm">❌</span>
                <span className="nt-training-text">
                  {t("training.dont_know") || "Не знаю"}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="nt-training-empty-state">
            <div className="nt-loader__spinner"></div>
            <p className="nt-util__text-secondary nt-util__mt-md">
              {t("training.wave.loading") ||
                `Загрузка карточек для волны ${wave.waveProgress.current}...`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
