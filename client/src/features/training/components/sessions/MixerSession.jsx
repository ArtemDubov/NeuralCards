import React, { useState } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useMixerMode } from "../../hooks/useMixerMode";

// Компонент выбора наборов
const SetSelector = ({ cardsets, onSelectSets, onStart }) => {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSet = (setId) => {
    setSelectedIds((prev) => {
      if (prev.includes(setId)) {
        return prev.filter((id) => id !== setId);
      } else {
        if (prev.length >= 3) {
          alert("Можно выбрать максимум 3 набора");
          return prev;
        }
        return [...prev, setId];
      }
    });
  };

  const selectedSets = cardsets.filter((set) => selectedIds.includes(set.id));
  const totalCards = selectedSets.reduce(
    (sum, set) => sum + (set.cards?.length || 0),
    0
  );

  return (
    <div className="mixer-selector">
      <div className="selector-header">
        <h2>🔀 ВЫБЕРИТЕ НАБОРЫ ДЛЯ МИКСА</h2>
        <p>Выберите от 1 до 3 наборов для смешанной тренировки</p>
      </div>

      <div className="sets-grid">
        {cardsets.map((set) => {
          const cardCount = set.cards?.length || 0;
          const isSelected = selectedIds.includes(set.id);

          return (
            <div
              key={set.id}
              className={`set-card ${isSelected ? "selected" : ""} ${
                cardCount === 0 ? "disabled" : ""
              }`}
              onClick={() => cardCount > 0 && toggleSet(set.id)}
            >
              <div className="set-checkbox">{isSelected ? "✅" : "○"}</div>

              <div className="set-info">
                <h4>{set.title}</h4>
                <p className="card-count">{cardCount} карточек</p>
                {set.tags && set.tags.length > 0 && (
                  <div className="set-tags">
                    {set.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="tag">
                        {typeof tag === "object" ? tag.name : tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {cardCount === 0 && (
                <div className="set-warning">Нет карточек</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="selector-summary">
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-label">Выбрано наборов:</span>
            <span className="stat-value">{selectedSets.length} / 3</span>
          </div>
          <div className="stat">
            <span className="stat-label">Всего карточек:</span>
            <span className="stat-value">{totalCards}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Минимум:</span>
            <span className="stat-value">10 карточек</span>
          </div>
        </div>

        <div className="selector-actions">
          <button
            className="btn-tp1"
            onClick={() => onSelectSets(selectedSets)}
            disabled={selectedSets.length === 0 || totalCards < 10}
          >
            🔀 ЗАПУСТИТЬ МИКСЕР
          </button>

          {totalCards < 10 && selectedSets.length > 0 && (
            <p className="warning-message">
              ⚠️ Недостаточно карточек. Нужно минимум 10, выбрано {totalCards}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Основной компонент сессии
export const MixerSession = ({ cardsets, onAnswer, onEnd }) => {
  const { t } = useAppStore();
  const [selectionPhase, setSelectionPhase] = useState(true);
  const mixer = useMixerMode(cardsets, onAnswer);

  // Обработчик выбора наборов
  const handleSelectSets = (sets) => {
    mixer.selectSets(sets);
    setSelectionPhase(false);
  };

  // Фаза выбора наборов
  if (selectionPhase) {
    return (
      <div className="mixer-session">
        <SetSelector
          cardsets={cardsets}
          onSelectSets={handleSelectSets}
          onStart={() => setSelectionPhase(false)}
        />
      </div>
    );
  }

  // Проверка на наличие карточек
  if (mixer.mixerStats.totalCards === 0) {
    return (
      <div className="mixer-session">
        <div className="mixer-error">
          <div className="error-icon">🔀</div>
          <h2>Нет карточек для микса</h2>
          <p>В выбранных наборах нет карточек для тренировки.</p>
          <button onClick={() => setSelectionPhase(true)} className="btn-tp1">
            🔄 Выбрать другие наборы
          </button>
        </div>
      </div>
    );
  }

  // Экран завершения
  if (mixer.isCompleted) {
    const results = mixer.getFinalResults();

    return (
      <div className="mixer-session">
        <div className="mixer-completed">
          <div className="completed-header">
            <div className="completed-icon">🔀</div>
            <h1>МИКСЕР ЗАВЕРШЕН!</h1>
            <p>Смешанная тренировка из {results.selectedSets.length} наборов</p>
          </div>

          <div className="mixer-score">
            <div className="score-display">
              <div className="score-value">{results.finalScore}</div>
              <div className="score-label">ОБЩИХ ОЧКОВ</div>
            </div>

            <div className="efficiency-display">
              <div className="efficiency-value">
                {results.overallEfficiency}%
              </div>
              <div className="efficiency-label">ЭФФЕКТИВНОСТЬ</div>
            </div>
          </div>

          <div className="sets-results">
            <h3>Результаты по наборам:</h3>
            <div className="results-grid">
              {results.setResults.map((setResult, index) => (
                <div key={setResult.setId} className="set-result">
                  <div className="set-rank">#{index + 1}</div>
                  <div className="set-title">{setResult.title}</div>
                  <div className="set-stats">
                    <div className="stat">
                      <span className="stat-label">Карточек:</span>
                      <span className="stat-value">{setResult.total}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Правильно:</span>
                      <span className="stat-value">{setResult.correct}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Эффективность:</span>
                      <span
                        className={`stat-value ${
                          setResult.efficiency >= 80
                            ? "excellent"
                            : setResult.efficiency >= 60
                            ? "good"
                            : "poor"
                        }`}
                      >
                        {setResult.efficiency}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mixer-analysis">
            <h4>📊 АНАЛИЗ МИКСЕРА:</h4>
            <p>
              Вы смешали {results.selectedSets.length} набора и прошли{" "}
              {results.totalCards} карточек.
              {results.setResults.some((r) => r.efficiency < 50) &&
                " Есть наборы, где можно улучшить результаты!"}
              {results.setResults.every((r) => r.efficiency >= 80) &&
                " Отличные результаты во всех наборах! 🎯"}
            </p>
          </div>

          <div className="mixer-actions">
            <button onClick={() => setSelectionPhase(true)} className="btn-tp2">
              🔄 Новый микс
            </button>
            <button onClick={onEnd} className="btn-tp1">
              Завершить
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Основной игровой экран
  return (
    <div className="mixer-session">
      {/* Заголовок миксера */}
      <div className="mixer-header">
        <div className="mixer-title">
          <span className="mixer-icon">🔀</span>
          <h2>СМЕШАННАЯ ТРЕНИРОВКА</h2>
          <div className="mixer-subtitle">
            {mixer.mixerStats.selectedSetsCount} набора •{" "}
            {mixer.mixerStats.totalCards} карточек
          </div>
        </div>

        <div className="mixer-score">
          <div className="score-display">
            <span className="score-label">СЧЕТ:</span>
            <span className="score-value">{mixer.mixerStats.score}</span>
          </div>
        </div>
      </div>

      {/* Прогресс-бар */}
      <div className="mixer-progress">
        <div className="progress-info">
          <span className="progress-text">
            Карточка {mixer.mixerStats.currentCard} из{" "}
            {mixer.mixerStats.totalCards}
          </span>
          <span className="progress-percent">{mixer.mixerStats.progress}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${mixer.mixerStats.progress}%` }}
          />
        </div>
      </div>

      {/* Индикатор набора текущей карточки */}
      {mixer.currentCard?.sourceSet && (
        <div className="set-indicator">
          <div
            className="set-color"
            style={{ backgroundColor: mixer.currentCard.sourceSet.color }}
          />
          <div className="set-name">
            Набор: {mixer.currentCard.sourceSet.title}
          </div>
        </div>
      )}

      {/* Основная карточка */}
      {mixer.currentCard ? (
        <div className="mixer-card">
          <div className="card-content">
            <h3 className="card-question">{mixer.currentCard.front}</h3>

            {/* Индикаторы медиа */}
            <div className="media-indicators">
              {mixer.currentCard.imageUrl && (
                <span className="media-indicator">🖼️</span>
              )}
              {mixer.currentCard.audioUrl && (
                <span className="media-indicator">🎵</span>
              )}
              {mixer.currentCard.backImageUrl && (
                <span className="media-indicator">🖼️</span>
              )}
              {mixer.currentCard.backAudioUrl && (
                <span className="media-indicator">🎵</span>
              )}
            </div>
          </div>

          <div className="mixer-actions">
            <button
              className="mixer-btn correct-btn"
              onClick={mixer.handleCorrect}
              disabled={!mixer.mixerActive}
            >
              ✅ ЗНАЮ ОТВЕТ
            </button>

            <button
              className="mixer-btn wrong-btn"
              onClick={mixer.handleWrong}
              disabled={!mixer.mixerActive}
            >
              ❌ НЕ ЗНАЮ
            </button>
          </div>
        </div>
      ) : (
        <div className="mixer-loading">
          <div className="loading-icon">🔀</div>
          <p>Перемешивание карточек...</p>
        </div>
      )}

      {/* Статистика по наборам */}
      <div className="sets-stats">
        <h4>📊 ЭФФЕКТИВНОСТЬ ПО НАБОРАМ:</h4>
        <div className="stats-grid">
          {Object.entries(mixer.mixerStats.setStats || {}).map(
            ([setId, stats]) => {
              const efficiency =
                stats.answered > 0
                  ? Math.round((stats.correct / stats.answered) * 100)
                  : 0;

              return (
                <div key={setId} className="set-stat">
                  <div className="set-header">
                    <div
                      className="set-color-dot"
                      style={{ backgroundColor: getSetColor(setId) }}
                    />
                    <div className="set-title">{stats.title}</div>
                  </div>

                  <div className="set-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${
                            (stats.answered / stats.totalCards) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <div className="progress-text">
                      {stats.answered} / {stats.totalCards}
                    </div>
                  </div>

                  <div className="set-efficiency">
                    <span className="efficiency-label">Эффективность:</span>
                    <span
                      className={`efficiency-value ${
                        efficiency >= 80
                          ? "excellent"
                          : efficiency >= 60
                          ? "good"
                          : "poor"
                      }`}
                    >
                      {efficiency}%
                    </span>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="mixer-quick-actions">
        <button onClick={() => setSelectionPhase(true)} className="btn-tp3">
          🔄 Сменить наборы
        </button>
        <button onClick={onEnd} className="btn-tp3">
          Завершить миксер
        </button>
      </div>
    </div>
  );
};

// Вспомогательная функция для цвета
function getSetColor(setId) {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#FFD166",
    "#06D6A0",
    "#118AB2",
    "#EF476F",
    "#073B4C",
    "#7209B7",
  ];
  const index = parseInt(setId.toString().slice(-2)) % colors.length;
  return colors[index];
}
