import React from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useTournamentMode } from "../../hooks/useTournamentMode";

export const TournamentSession = ({ cards, onAnswer, onEnd }) => {
  const { t } = useAppStore();
  const tournament = useTournamentMode(cards, onAnswer);

  // Экран завершения турнира
  if (tournament.tournamentCompleted) {
    const results = tournament.getTournamentResults();

    return (
      <div className="tournament-session">
        <div className="tournament-completed">
          <div className="champion-crown">👑</div>
          <h1>ТУРНИР ЗАВЕРШЕН!</h1>

          <div className="final-results">
            <div className="result-card champion">
              <div className="result-title">СТАТУС</div>
              <div className="result-value">ЧЕМПИОН</div>
            </div>

            <div className="result-card">
              <div className="result-title">ИТОГОВЫЙ СЧЕТ</div>
              <div className="result-value score">{results.finalScore}</div>
            </div>

            <div className="result-card">
              <div className="result-title">УРОВНЕЙ ПРОЙДЕНО</div>
              <div className="result-value">
                {results.levelsCompleted} / {results.totalLevels}
              </div>
            </div>

            <div className="result-card">
              <div className="result-title">БОНУС ЗА СКОРОСТЬ</div>
              <div className="result-value">+{results.timeBonusTotal}</div>
            </div>
          </div>

          <div className="tournament-actions">
            <button onClick={onEnd} className="btn-tp1">
              🏆 Завершить турнир
            </button>
          </div>

          <div className="tournament-tip">
            <p>Вы прошли все 5 уровней и стали чемпионом! 🎉</p>
            <p>Ваш результат будет сохранен в таблице лидеров.</p>
          </div>
        </div>
      </div>
    );
  }

  // Экран между уровнями
  if (!tournament.roundActive && tournament.currentCard) {
    const qualified = tournament.tournamentStats.qualifiedForNextLevel;
    const nextLevel = tournament.tournamentStats.level + 1;

    return (
      <div className="tournament-session">
        <div className="level-transition">
          <div className="transition-header">
            <div className="level-badge">
              УРОВЕНЬ {tournament.tournamentStats.level}
            </div>
            <div className="level-reward">
              {tournament.getLevelReward(tournament.tournamentStats.level)}
            </div>
          </div>

          <div className="transition-content">
            <h2>
              {qualified
                ? `✅ КВАЛИФИКАЦИЯ ПРОЙДЕНА!`
                : `❌ КВАЛИФИКАЦИЯ НЕ ПРОЙДЕНА`}
            </h2>

            <div className="qualification-stats">
              <div className="qual-stat">
                <span className="stat-label">Необходимо:</span>
                <span className="stat-value">80%</span>
              </div>
              <div className="qual-stat">
                <span className="stat-label">Ваш результат:</span>
                <span
                  className={`stat-value ${qualified ? "qualified" : "failed"}`}
                >
                  {Math.floor(Math.random() * 20) + 70}% {/* заглушка */}
                </span>
              </div>
            </div>

            <div className="transition-actions">
              {qualified && nextLevel <= 5 ? (
                <>
                  <div className="countdown">3</div>
                  <p>Переход на уровень {nextLevel} через 3 секунды...</p>
                </>
              ) : (
                <>
                  <button onClick={tournament.restartLevel} className="btn-tp1">
                    🔄 Повторить уровень
                  </button>
                  <button onClick={onEnd} className="btn-tp3">
                    Завершить турнир
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Основной игровой экран
  return (
    <div className="tournament-session">
      {/* Турнирная панель */}
      <div className="tournament-header">
        <div className="tournament-info">
          <div className="tournament-title">
            <span className="tournament-icon">🏆</span>
            <h2>ТУРНИР</h2>
          </div>

          <div className="level-indicator">
            <div className="level-display">
              УРОВЕНЬ {tournament.tournamentStats.level}
            </div>
            <div className="level-progress">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`level-dot ${
                    i < tournament.tournamentStats.level ? "completed" : ""
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="tournament-score">
          <div className="score-display">
            <span className="score-label">СЧЕТ:</span>
            <span className="score-value">
              {tournament.tournamentStats.score}
            </span>
          </div>
          <div className="bonus-display">
            <span className="bonus-label">БОНУС:</span>
            <span className="bonus-value">
              +{tournament.tournamentStats.timeBonus}
            </span>
          </div>
        </div>
      </div>

      {/* Прогресс уровня */}
      <div className="level-progress-bar">
        <div className="progress-info">
          <span className="progress-text">
            Карточка {tournament.tournamentStats.currentCard} из{" "}
            {tournament.tournamentStats.totalCards}
          </span>
          <span className="progress-percent">
            {tournament.tournamentStats.levelProgress}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${tournament.tournamentStats.levelProgress}%` }}
          />
        </div>
      </div>

      {/* Турнирная карточка */}
      {tournament.currentCard ? (
        <div className="tournament-card">
          <div className="card-header">
            <div className="tournament-rules">
              <div className="rule">
                <span className="rule-icon">⚡</span>
                <span className="rule-text">Быстрый ответ = +5 очков</span>
              </div>
              <div className="rule">
                <span className="rule-icon">🎯</span>
                <span className="rule-text">Правильный ответ = +10 очков</span>
              </div>
              <div className="rule">
                <span className="rule-icon">⏱️</span>
                <span className="rule-text">10 секунд на ответ</span>
              </div>
            </div>
          </div>

          <div className="card-content">
            <h3 className="card-question">{tournament.currentCard.front}</h3>
            <div className="tournament-timer">
              <div className="timer-display">⏱️ 10 сек</div>
              <div className="timer-hint">Ответьте быстро для бонуса!</div>
            </div>
          </div>

          <div className="tournament-answers">
            <button
              className="tournament-btn correct-btn"
              onClick={() => tournament.handleAnswer(true)}
            >
              ✅ ЗНАЮ! (+10)
            </button>
            <button
              className="tournament-btn wrong-btn"
              onClick={() => tournament.handleAnswer(false)}
            >
              ❌ НЕ ЗНАЮ
            </button>
          </div>
        </div>
      ) : (
        <div className="tournament-loading">
          <div className="loading-spinner"></div>
          <p>Подготовка турнирных карточек...</p>
        </div>
      )}

      {/* Статистика турнира */}
      <div className="tournament-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon">🏅</div>
            <div className="stat-content">
              <div className="stat-label">Текущий уровень</div>
              <div className="stat-value">
                {tournament.tournamentStats.level} / 5
              </div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-label">Карточек в уровне</div>
              <div className="stat-value">
                {tournament.tournamentStats.totalCards}
              </div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <div className="stat-label">Бонус за скорость</div>
              <div className="stat-value">
                +{tournament.tournamentStats.timeBonus}
              </div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-label">Для прохода</div>
              <div className="stat-value">≥ 80%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
