import React from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useCountdownMode } from "../../hooks/useCountdownMode";

export const CountdownSession = ({ cards, onAnswer, onEnd }) => {
  const { t } = useAppStore();
  const countdown = useCountdownMode(cards, onAnswer);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Экран завершения
  if (countdown.isCompleted) {
    const finalStats = countdown.getFinalStats();

    return (
      <div className="countdown-session">
        <div className="countdown-completed">
          <div className="completed-icon">⏳</div>
          <h1>ОБРАТНЫЙ ОТСЧЁТ ЗАВЕРШЁН!</h1>

          <div className="final-stats">
            <div className="final-stat">
              <div className="stat-label">ИТОГОВЫЙ СЧЕТ</div>
              <div className="stat-value score">{finalStats.finalScore}</div>
            </div>

            <div className="final-stat">
              <div className="stat-label">КАРТОЧЕК ПРОЙДЕНО</div>
              <div className="stat-value">
                {finalStats.cardsCompleted} / {finalStats.totalCards}
              </div>
            </div>

            <div className="final-stat">
              <div className="stat-label">БОНУСНОЕ ВРЕМЯ</div>
              <div className="stat-value">+{finalStats.timeBonusTotal} сек</div>
            </div>

            <div className="final-stat">
              <div className="stat-label">СРЕДНЕЕ ВРЕМЯ</div>
              <div className="stat-value">
                {finalStats.averageTimePerCard} сек/карт
              </div>
            </div>
          </div>

          <div className="completion-message">
            <p>Вы прошли все карточки в режиме обратного отсчета! 🎉</p>
            <p>Чем дальше, тем меньше времени на ответ!</p>
          </div>

          <div className="completion-actions">
            <button onClick={onEnd} className="btn-tp1">
              Завершить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="countdown-session">
      {/* Заголовок с прогрессом */}
      <div className="countdown-header">
        <div className="countdown-title">
          <span className="mode-icon">⏳</span>
          <h2>ОБРАТНЫЙ ОТСЧЁТ</h2>
        </div>

        <div className="countdown-progress">
          <div className="progress-text">
            Карточка {countdown.stats.currentCard} из{" "}
            {countdown.stats.totalCards}
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  (countdown.stats.currentCard / countdown.stats.totalCards) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Основной таймер */}
      <div className="countdown-timer">
        <div
          className={`timer-display ${
            countdown.stats.timeLeft < 10 ? "warning" : ""
          }`}
        >
          {formatTime(countdown.stats.timeLeft)}
        </div>

        <div className="timer-info">
          <div className="time-info">
            <span className="info-label">На эту карточку:</span>
            <span className="info-value">
              {formatTime(countdown.stats.timeForCurrentCard)}
            </span>
          </div>

          {countdown.stats.nextCardTime > 0 && (
            <div className="time-info">
              <span className="info-label">Следующая:</span>
              <span className="info-value">
                {formatTime(countdown.stats.nextCardTime)}
              </span>
            </div>
          )}

          <div className="time-info">
            <span className="info-label">Бонус времени:</span>
            <span className="info-value success">
              +{countdown.stats.timeBonus} сек
            </span>
          </div>
        </div>
      </div>

      {/* Основная карточка */}
      {countdown.currentCard ? (
        <div className="countdown-card">
          <div className="card-content">
            <h3 className="card-question">{countdown.currentCard.front}</h3>

            <div className="countdown-instructions">
              <div className="instruction">
                <span className="inst-icon">⚡</span>
                <span className="inst-text">
                  Ответьте за <strong>10 секунд</strong> для бонусного времени!
                </span>
              </div>

              <div className="instruction">
                <span className="inst-icon">📉</span>
                <span className="inst-text">
                  Каждая следующая карточка на <strong>5 секунд</strong> короче
                </span>
              </div>

              <div className="instruction">
                <span className="inst-icon">🎯</span>
                <span className="inst-text">
                  Минимум: <strong>5 секунд</strong> на карточку
                </span>
              </div>
            </div>
          </div>

          <div className="countdown-actions">
            <button
              className="countdown-btn correct-btn"
              onClick={countdown.handleCorrect}
              disabled={!countdown.gameActive}
            >
              ✅ ЗНАЮ ОТВЕТ
              <div className="btn-subtext">+10 очков (+5 за скорость)</div>
            </button>

            <button
              className="countdown-btn wrong-btn"
              onClick={countdown.handleWrong}
              disabled={!countdown.gameActive}
            >
              ❌ НЕ ЗНАЮ
              <div className="btn-subtext">Следующая карточка</div>
            </button>
          </div>
        </div>
      ) : (
        <div className="countdown-loading">
          <div className="loading-spinner"></div>
          <p>Подготовка карточек обратного отсчета...</p>
        </div>
      )}

      {/* Статистика */}
      <div className="countdown-stats">
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-label">ТЕКУЩИЙ СЧЕТ</div>
            <div className="stat-value">{countdown.stats.score}</div>
          </div>

          <div className="stat-item">
            <div className="stat-label">ВРЕМЯ ОСТАЛОСЬ</div>
            <div className="stat-value time-critical">
              {formatTime(countdown.stats.timeLeft)}
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-label">БОНУС ВРЕМЕНИ</div>
            <div className="stat-value success">
              +{countdown.stats.timeBonus} сек
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-label">МИНИМУМ ВРЕМЕНИ</div>
            <div className="stat-value">5 сек</div>
          </div>
        </div>
      </div>

      {/* Шкала уменьшения времени */}
      <div className="time-reduction-scale">
        <div className="scale-title">Уменьшение времени:</div>
        <div className="scale-visual">
          {Array.from({ length: Math.min(10, countdown.stats.totalCards) }).map(
            (_, i) => {
              const timeForCard = Math.max(60 - i * 5, 5);
              return (
                <div key={i} className="scale-item">
                  <div className="scale-card">#{i + 1}</div>
                  <div className="scale-time">{timeForCard}с</div>
                  {i === countdown.stats.currentCard - 1 && (
                    <div className="scale-current">← СЕЙЧАС</div>
                  )}
                </div>
              );
            }
          )}
        </div>
        <div className="scale-note">
          Первая карточка: 60 сек → Последняя: 5 сек (минимум)
        </div>
      </div>
    </div>
  );
};
