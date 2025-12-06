import React from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useMemoryMode } from "../../hooks/useMemoryMode";

export const MemorySession = ({ cards, onAnswer, onEnd }) => {
  const { t } = useAppStore();
  const memory = useMemoryMode(cards, onAnswer);

  if (!memory.gameStarted || cards.length < 6) {
    return (
      <div className="nt-training-container">
        <div className="nt-training-empty-state">
          <div className="nt-training-empty-icon">⚠️</div>
          <h3 className="nt-util__text-center">
            {t("training.memory.insufficient_cards") || "Недостаточно карточек"}
          </h3>
          <p className="nt-util__text-secondary nt-util__text-center">
            {t("training.memory.min_required") ||
              "Для игры в 'Память' нужно минимум 6 карточек (3 пары)"}
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

  const getCardClass = (card) => {
    let className = "nt-memory-card";
    if (
      memory.flipped.includes(card.id) ||
      memory.matched.includes(card.pairId)
    ) {
      className += " nt-memory-card--flipped";
    }
    if (memory.matched.includes(card.pairId)) {
      className += " nt-memory-card--matched";
    }
    return className;
  };

  return (
    <div className="nt-training-container">
      {/* Заголовок и статистика */}
      <div className="nt-training-header">
        <button
          onClick={onEnd}
          className="nt-btn nt-btn--secondary nt-btn--icon"
          title={t("training.end_session") || "Завершить тренировку"}
        >
          ✕
        </button>
        <div className="nt-training-title">
          <span className="nt-training-icon">🧠</span>
          <span>{t("training.mode.memory") || "Память"}</span>
        </div>
        <div className="nt-util__flex nt-util__gap-lg">
          <div className="nt-training-progress">
            {t("training.memory.pairs") || "Пары"}: {memory.stats.pairsFound} /{" "}
            {memory.stats.totalPairs}
          </div>
        </div>
      </div>

      {/* Инструкции */}
      <div className="nt-util__text-center nt-util__mb-xl">
        <div className="nt-util__flex nt-util__justify-center nt-util__gap-md">
          <div className="nt-util__flex nt-util__items-center nt-util__gap-sm">
            <span className="nt-training-icon">🎲</span>
            <span className="nt-util__text-secondary">
              {t("training.memory.instructions") ||
                "Найди пары: вопрос → ответ"}
            </span>
          </div>
        </div>
        <p className="nt-util__text-muted nt-util__text-sm nt-util__mt-sm">
          {t("training.memory.hint") ||
            "Открывай по две карточки и ищи совпадения!"}
        </p>
      </div>

      {/* Игровое поле */}
      <div className="nt-memory-board">
        {memory.board.map((card) => (
          <div
            key={card.id}
            className={getCardClass(card)}
            onClick={() => memory.handleCardClick(card.id)}
          >
            <div className="nt-memory-card-front">
              <div className="nt-memory-card-icon">
                {card.type === "question" ? "❓" : "💡"}
              </div>
              <div className="nt-memory-card-label">
                {card.type === "question" ? "ВОПРОС" : "ОТВЕТ"}
              </div>
            </div>
            <div className="nt-memory-card-back">
              <div className="nt-memory-card-content nt-util__text-center">
                {card.content}
              </div>
              <div className="nt-memory-card-type nt-util__text-center nt-util__text-xs nt-util__mt-sm">
                {card.type === "question" ? "❓ ВОПРОС" : "💡 ОТВЕТ"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Статистика */}
      <div className="nt-training-stats nt-util__mt-xl">
        <div className="nt-util__grid nt-grid--3cols nt-grid--gap-md">
          <div className="nt-training-stat-box">
            <div className="nt-training-stat-label">
              {t("training.memory.moves") || "Ходы"}
            </div>
            <div className="nt-training-stat-value">{memory.moves}</div>
          </div>
          <div className="nt-training-stat-box">
            <div className="nt-training-stat-label">
              {t("training.memory.accuracy") || "Точность"}
            </div>
            <div className="nt-training-stat-value nt-training-stat-value--good">
              {memory.stats.accuracy}%
            </div>
          </div>
          <div className="nt-training-stat-box">
            <div className="nt-training-stat-label">
              {t("training.memory.pairs_found") || "Найдено пар"}
            </div>
            <div className="nt-training-stat-value nt-training-stat-value--excellent">
              {memory.stats.pairsFound}
            </div>
          </div>
        </div>
      </div>

      {/* Действия */}
      <div className="nt-util__flex nt-util__justify-center nt-util__gap-md nt-util__mt-xl">
        <button onClick={memory.resetGame} className="nt-btn nt-btn--secondary">
          🔄 {t("training.restart") || "Заново"}
        </button>
        <button onClick={onEnd} className="nt-btn nt-btn--primary">
          {t("training.finish") || "Завершить"}
        </button>
      </div>

      {/* Экран завершения */}
      {memory.isCompleted && (
        <div className="nt-training-overlay">
          <div className="nt-training-completion">
            <div className="nt-training-completion-icon">🎉</div>
            <h2 className="nt-training-completion-title">
              {t("training.memory.completed") ||
                "Поздравляем! Все пары найдены!"}
            </h2>
            <div className="nt-training-completion-stats">
              <div className="nt-training-stat-row">
                <span className="nt-training-stat-label">Ходов сделано:</span>
                <span className="nt-training-stat-value">{memory.moves}</span>
              </div>
              <div className="nt-training-stat-row">
                <span className="nt-training-stat-label">Точность:</span>
                <span className="nt-training-stat-value nt-training-stat-value--excellent">
                  {memory.stats.accuracy}%
                </span>
              </div>
            </div>
            <div className="nt-training-completion-actions">
              <button
                onClick={memory.resetGame}
                className="nt-btn nt-btn--secondary"
              >
                🔄 {t("training.play_again") || "Играть снова"}
              </button>
              <button onClick={onEnd} className="nt-btn nt-btn--primary">
                {t("training.finish") || "Завершить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
