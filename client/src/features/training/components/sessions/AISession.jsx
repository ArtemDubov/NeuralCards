import React from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useAIMode } from "../../hooks/useAIMode";

export const AISession = ({ cards, onAnswer, onEnd }) => {
  const { t } = useAppStore();
  const ai = useAIMode(cards, onAnswer);

  if (!ai.currentCard) {
    return (
      <div className="ai-session">
        <div className="ai-loading">
          <div className="ai-icon">🤖</div>
          <h3>AI тренер анализирует ваши знания...</h3>
          <p>Это займет несколько секунд</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-session">
      {/* AI Панель управления */}
      <div className="ai-control-panel">
        <div className="ai-header">
          <div className="ai-title">
            <span className="ai-icon">🤖</span>
            <h2>AI Тренер</h2>
          </div>
          <button onClick={onEnd} className="btn-tp3">
            {t("training.finish")}
          </button>
        </div>

        <div className="ai-stats">
          <div className="ai-stat">
            <span className="stat-label">Карточек всего:</span>
            <span className="stat-value">{ai.aiStats.totalCards}</span>
          </div>
          <div className="ai-stat">
            <span className="stat-label">Слабых мест:</span>
            <span className="stat-value warning">{ai.aiStats.weakCount}</span>
          </div>
          <div className="ai-stat">
            <span className="stat-label">Освоено:</span>
            <span className="stat-value success">
              {ai.aiStats.masteredCount}
            </span>
          </div>
          <div className="ai-stat">
            <span className="stat-label">Серия:</span>
            <span className="stat-value">{ai.aiStats.currentStreak} ✅</span>
          </div>
        </div>

        <div className="ai-controls">
          <div className="control-group">
            <label>Фокус тренировки:</label>
            <div className="focus-buttons">
              {["weakest", "new", "review", "mixed"].map((focus) => (
                <button
                  key={focus}
                  className={`focus-btn ${
                    ai.focusArea === focus ? "active" : ""
                  }`}
                  onClick={() => ai.changeFocus(focus)}
                >
                  {getFocusLabel(focus)}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label>Сложность:</label>
            <div className="difficulty-buttons">
              {["easy", "medium", "hard"].map((diff) => (
                <button
                  key={diff}
                  className={`difficulty-btn ${
                    ai.difficulty === diff ? "active" : ""
                  } ${diff}`}
                  onClick={() => ai.changeDifficulty(diff)}
                >
                  {getDifficultyLabel(diff)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Рекомендация */}
      <div className="ai-recommendation">
        <div className="recommendation-icon">💡</div>
        <div className="recommendation-text">
          <strong>Рекомендация AI:</strong> {ai.recommendations.tip}
        </div>
      </div>

      {/* Основная карточка */}
      <div className="ai-card">
        <div className="card-header">
          <div className="card-meta">
            <span className="card-focus">
              Фокус: {getFocusLabel(ai.focusArea)}
            </span>
            <span className="card-difficulty">
              Сложность: {getDifficultyLabel(ai.difficulty)}
            </span>
          </div>
        </div>

        <div className="card-content">
          <h3 className="card-question">{ai.currentCard.front}</h3>
          <p className="ai-hint">
            🤖 AI подобрал эту карточку специально для вас
          </p>
        </div>

        <div className="ai-answer-buttons">
          <button
            className="ai-btn correct-btn"
            onClick={() => ai.handleAnswer(true, 0)}
          >
            ✅ Знаю легко
          </button>
          <button
            className="ai-btn medium-btn"
            onClick={() => ai.handleAnswer(true, 1)}
          >
            🟡 Знаю, но с трудом
          </button>
          <button
            className="ai-btn wrong-btn"
            onClick={() => ai.handleAnswer(false, 2)}
          >
            ❌ Не знаю
          </button>
        </div>
      </div>

      {/* AI Анализ */}
      <div className="ai-analysis">
        <h4>📊 AI анализ вашего прогресса:</h4>
        <div className="analysis-items">
          <div className="analysis-item">
            <div className="analysis-label">Фокус тренировки:</div>
            <div className="analysis-value">{ai.recommendations.focus}</div>
          </div>
          <div className="analysis-item">
            <div className="analysis-label">Уровень сложности:</div>
            <div className="analysis-value">
              {ai.recommendations.difficulty}
            </div>
          </div>
          <div className="analysis-item">
            <div className="analysis-label">Карточек пройдено:</div>
            <div className="analysis-value">{ai.aiStats.historyLength}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Вспомогательные функции
function getFocusLabel(focus) {
  const labels = {
    weakest: "🎯 Слабые места",
    new: "🆕 Новые",
    review: "🔄 Повторение",
    mixed: "🔀 Микс",
  };
  return labels[focus] || focus;
}

function getDifficultyLabel(diff) {
  const labels = {
    easy: "🟢 Легко",
    medium: "🟡 Средне",
    hard: "🔴 Сложно",
  };
  return labels[diff] || diff;
}
