import React, { useState } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useAudioMode } from "../../hooks/useAudioMode";

export const AudioSession = ({ cards, onAnswer, onEnd }) => {
  const { t } = useAppStore();
  const audio = useAudioMode(cards, onAnswer);
  const [userInput, setUserInput] = useState("");

  // Проверка на наличие аудио-карточек
  const audioCardsCount = cards.filter(
    (c) => c.audioUrl || c.backAudioUrl
  ).length;

  if (audioCardsCount === 0) {
    return (
      <div className="audio-session">
        <div className="no-audio-message">
          <div className="audio-icon">🎵</div>
          <h2>Нет аудио-карточек</h2>
          <p>В этом наборе нет карточек с аудио.</p>
          <p>Добавьте аудиофайлы к карточкам для использования этого режима.</p>
          <button onClick={onEnd} className="btn-tp1">
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  // Экран завершения
  if (audio.isCompleted) {
    const results = audio.getResults();

    return (
      <div className="audio-session">
        <div className="audio-completed">
          <div className="completed-icon">🎧</div>
          <h1>АУДИО ВЫЗОВ ЗАВЕРШЕН!</h1>

          <div className="audio-stats">
            <div className="audio-stat">
              <div className="stat-icon">🎵</div>
              <div className="stat-content">
                <div className="stat-label">Аудио-карточек</div>
                <div className="stat-value">{results.audioCardsUsed}</div>
              </div>
            </div>

            <div className="audio-stat">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-label">Пройдено</div>
                <div className="stat-value">{results.completedCards}</div>
              </div>
            </div>

            <div className="audio-stat">
              <div className="stat-icon">👂</div>
              <div className="stat-content">
                <div className="stat-label">Тренировка слуха</div>
                <div className="stat-value">100%</div>
              </div>
            </div>
          </div>

          <div className="completion-message">
            <p>Отличная тренировка аудиовосприятия! 🎧</p>
            <p>Продолжайте развивать слуховую память.</p>
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
    <div className="audio-session">
      {/* Заголовок */}
      <div className="audio-header">
        <div className="audio-title">
          <span className="mode-icon">🎵</span>
          <h2>АУДИО ВЫЗОВ</h2>
        </div>

        <div className="audio-progress">
          <div className="progress-text">
            Аудио {audio.stats.current} из {audio.stats.total}
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(audio.stats.current / audio.stats.total) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Аудио контролы */}
      <div className="audio-controls">
        <div className="playback-info">
          <div className="playback-count">
            <span className="count-label">Прослушиваний:</span>
            <span className="count-value">{audio.stats.audioPlays} / 3</span>
          </div>

          <div className="playback-hint">Можно прослушать аудио до 3 раз</div>
        </div>

        <div className="playback-buttons">
          <button
            className="play-btn"
            onClick={audio.playAudio}
            disabled={
              audio.stats.audioPlays >= 3 || audio.gameState !== "playing"
            }
          >
            <span className="btn-icon">▶️</span>
            <span className="btn-text">
              {audio.stats.audioPlays === 0 ? "СЛУШАТЬ" : "ПОВТОРИТЬ"}
            </span>
            <span className="btn-subtext">
              ({audio.stats.playsLeft} осталось)
            </span>
          </button>
        </div>
      </div>

      {/* Основной контент */}
      <div className="audio-content">
        {audio.gameState === "playing" && (
          <div className="listening-phase">
            <div className="listening-icon">👂</div>
            <h3>ВНИМАТЕЛЬНО СЛУШАЙТЕ</h3>
            <p className="instruction">
              Прослушайте аудио и напишите, что услышали
            </p>

            <div className="user-input-section">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Введите то, что услышали..."
                className="audio-input"
                rows="3"
                disabled={audio.gameState !== "playing"}
              />

              <div className="input-actions">
                <button
                  className="submit-btn"
                  onClick={() => audio.handleAnswer(userInput)}
                  disabled={!userInput.trim() || audio.gameState !== "playing"}
                >
                  ✅ ПРОВЕРИТЬ ОТВЕТ
                </button>

                <button
                  className="skip-btn"
                  onClick={audio.skipCard}
                  disabled={audio.gameState !== "playing"}
                >
                  ⏭️ НЕ ЗНАЮ
                </button>

                <button
                  className="know-btn"
                  onClick={audio.handleKnowAnswer}
                  disabled={audio.gameState !== "playing"}
                >
                  🎯 ЗНАЮ ОТВЕТ
                </button>
              </div>
            </div>
          </div>
        )}

        {audio.gameState === "answering" && (
          <div className="answering-phase">
            <div className="answering-icon">⏳</div>
            <h3>ПРОВЕРКА ОТВЕТА...</h3>
            <p>Ваш ответ: "{audio.userAnswer}"</p>
            <div className="loading-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}

        {audio.showAnswer && audio.currentCard && (
          <div className="result-phase">
            <div
              className={`result-icon ${
                audio.userAnswer.toLowerCase().trim() ===
                audio.currentCard.back.toLowerCase().trim()
                  ? "correct"
                  : "wrong"
              }`}
            >
              {audio.userAnswer.toLowerCase().trim() ===
              audio.currentCard.back.toLowerCase().trim()
                ? "✅"
                : "❌"}
            </div>

            <div className="result-content">
              <h3>
                {audio.userAnswer.toLowerCase().trim() ===
                audio.currentCard.back.toLowerCase().trim()
                  ? "ПРАВИЛЬНО!"
                  : "НЕПРАВИЛЬНО"}
              </h3>

              <div className="answer-comparison">
                <div className="answer-row">
                  <span className="answer-label">Ваш ответ:</span>
                  <span className="answer-value user-answer">
                    {audio.userAnswer || "(пропущено)"}
                  </span>
                </div>

                <div className="answer-row">
                  <span className="answer-label">Правильный ответ:</span>
                  <span className="answer-value correct-answer">
                    {audio.currentCard.back}
                  </span>
                </div>

                {audio.currentCard.front && (
                  <div className="answer-row">
                    <span className="answer-label">
                      Контекст (передняя сторона):
                    </span>
                    <span className="answer-value context">
                      {audio.currentCard.front}
                    </span>
                  </div>
                )}
              </div>

              <div className="next-card-hint">
                Следующая аудио-карточка через 3 секунды...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Статистика и подсказки */}
      <div className="audio-tips">
        <div className="tip-section">
          <h4>🎧 СОВЕТЫ ПО АУДИОТРЕНИРОВКЕ:</h4>
          <ul className="tips-list">
            <li>Сосредоточьтесь на первом прослушивании</li>
            <li>Попробуйте записать услышанное на бумаге</li>
            <li>Обращайте внимание на интонацию и паузы</li>
            <li>Используйте второе прослушивание для проверки</li>
          </ul>
        </div>

        <div className="mode-info">
          <h4>🎯 О РЕЖИМЕ:</h4>
          <p>Тренировка аудиовосприятия и слуховой памяти.</p>
          <p>
            Идеально для изучения языков, запоминания лекций, тренировки
            диктанта.
          </p>
        </div>
      </div>
    </div>
  );
};
