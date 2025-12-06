import React, { useState, useEffect, useRef } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";

export const PracticeSession = ({ cards, onAnswer, onEnd }) => {
  const { t } = useAppStore();

  const [currentDeck, setCurrentDeck] = useState([...cards]);
  const [learnedCards, setLearnedCards] = useState([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentCard, setCurrentCard] = useState(cards[0] || null);
  const [stats, setStats] = useState({
    learned: 0,
    totalProcessed: 0,
    repeats: 0,
  });

  const deckRef = useRef(currentDeck);
  const learnedRef = useRef(learnedCards);

  useEffect(() => {
    deckRef.current = currentDeck;
    learnedRef.current = learnedCards;
  }, [currentDeck, learnedCards]);

  useEffect(() => {
    if (cards.length > 0) {
      const initialDeck = [...cards];
      setCurrentDeck(initialDeck);
      deckRef.current = initialDeck;
      setCurrentCard(initialDeck[0]);
      setLearnedCards([]);
      learnedRef.current = [];

      setStats({
        learned: 0,
        totalProcessed: 0,
        repeats: 0,
      });
    }
  }, [cards]);

  const handleFlipCard = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsFlipped(!isFlipped);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleForget = () => {
    if (!currentCard) return;
    if (!isFlipped) setIsFlipped(true);
    onAnswer(false, 2);

    setStats((prev) => ({
      ...prev,
      repeats: prev.repeats + 1,
      totalProcessed: prev.totalProcessed + 1,
    }));

    processNextCard(false);
  };

  const handleRemember = () => {
    if (!currentCard) return;
    onAnswer(true, 0);
    setLearnedCards((prev) => [...prev, currentCard]);
    learnedRef.current = [...learnedRef.current, currentCard];

    setStats((prev) => ({
      ...prev,
      learned: prev.learned + 1,
      totalProcessed: prev.totalProcessed + 1,
    }));

    processNextCard(true);
  };

  const processNextCard = (isRemembered) => {
    setIsFlipped(false);
    setIsAnimating(false);

    setTimeout(() => {
      const currentDeckArr = deckRef.current;
      const newDeck = currentDeckArr.slice(1);

      if (isRemembered) {
        setCurrentDeck(newDeck);
        deckRef.current = newDeck;
      } else {
        const updatedDeck = [...newDeck, currentCard];
        setCurrentDeck(updatedDeck);
        deckRef.current = updatedDeck;
      }

      const nextDeck = isRemembered ? newDeck : [...newDeck, currentCard];
      if (nextDeck.length > 0) {
        setCurrentCard(nextDeck[0]);
      } else {
        setCurrentCard(null);
      }
    }, 300);
  };

  const isCompleted = currentDeck.length === 0 && learnedCards.length > 0;
  const remainingCards = currentDeck.length - 1;
  const progressPercentage =
    cards.length > 0
      ? Math.round((learnedCards.length / cards.length) * 100)
      : 0;

  if (!cards || cards.length === 0) {
    return (
      <div className="nt-training-container">
        <div className="nt-training-empty-state">
          <div className="nt-training-empty-icon">📭</div>
          <h3 className="nt-util__text-center">
            {t("training.no_cards.title") || "Нет карточек"}
          </h3>
          <p className="nt-util__text-secondary nt-util__text-center">
            {t("training.no_cards.message") || "Добавьте карточки в набор"}
          </p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="nt-training-container">
        <div className="nt-training-completion">
          <div className="nt-training-completion-icon">🎉</div>
          <h2 className="nt-training-completion-title">
            {t("training.completed.title") || "Повторение завершено!"}
          </h2>
          <div className="nt-training-completion-stats">
            <div className="nt-training-stat-row">
              <span className="nt-training-stat-label">Выучено карточек:</span>
              <span className="nt-training-stat-value nt-training-stat-value--excellent">
                {stats.learned} из {cards.length}
              </span>
            </div>
            <div className="nt-training-stat-row">
              <span className="nt-training-stat-label">
                Количество повторений:
              </span>
              <span className="nt-training-stat-value">{stats.repeats}</span>
            </div>
            <div className="nt-training-stat-row">
              <span className="nt-training-stat-label">Прогресс:</span>
              <span className="nt-training-stat-value">
                {progressPercentage}%
              </span>
            </div>
          </div>
          <div className="nt-training-completion-actions">
            <button className="nt-btn nt-btn--primary" onClick={onEnd}>
              {t("training.finish") || "Завершить тренировку"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="nt-training-container">
        <div className="nt-loader">
          <div className="nt-loader__spinner"></div>
          <p className="nt-util__text-secondary">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nt-practice-container">
      <div className="nt-practice-header">
        <div className="nt-practice-title">
          <span className="nt-practice-icon">🔄</span>
          <span>{t("training.mode.practice") || "Повторение"}</span>
        </div>

        <div className="nt-practice-progress">
          {stats.totalProcessed + 1} / {cards.length + stats.repeats}
        </div>

        <button
          onClick={onEnd}
          className="nt-btn nt-btn--secondary nt-btn--icon nt-practice-close-btn"
          title={t("training.end_session") || "Завершить тренировку"}
        >
          ✕
        </button>
      </div>

      <div className="nt-practice-card">
        <div className="nt-practice-card-container" onClick={handleFlipCard}>
          <div
            className={`nt-practice-card-wrapper ${
              isFlipped ? "nt-practice-card-wrapper--flipped" : ""
            } ${isAnimating ? "nt-practice-card-wrapper--animating" : ""}`}
          >
            <div className="nt-practice-card-flipper">
              {/* Front */}
              <div className="nt-practice-card-face nt-practice-card-front">
                <div className="nt-practice-card-header">
                  <div className="nt-practice-card-label">
                    <span className="nt-practice-card-label-icon">❓</span>
                    <span className="nt-practice-card-label-text">
                      {t("training.card.question") || "Вопрос"}
                    </span>
                  </div>
                  <div className="nt-practice-card-hint">
                    {t("training.click_to_flip") ||
                      "Нажмите, чтобы перевернуть"}
                  </div>
                </div>
                <div className="nt-practice-card-content">
                  <p className="nt-practice-card-text">{currentCard.front}</p>
                </div>
              </div>

              {/* Back */}
              <div className="nt-practice-card-face nt-practice-card-back">
                <div className="nt-practice-card-header">
                  <div className="nt-practice-card-label">
                    <span className="nt-practice-card-label-icon">💡</span>
                    <span className="nt-practice-card-label-text">
                      {t("training.card.answer") || "Ответ"}
                    </span>
                  </div>
                  <div className="nt-practice-card-hint">
                    {t("training.click_to_return") ||
                      "Нажмите, чтобы вернуться"}
                  </div>
                </div>
                <div className="nt-practice-card-content">
                  <p className="nt-practice-card-text">{currentCard.back}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="nt-practice-controls">
        <button
          className="nt-practice-control-btn nt-practice-btn-forget"
          onClick={handleForget}
          disabled={isAnimating}
        >
          <span className="nt-practice-control-icon">❌</span>
          <span className="nt-practice-control-text">
            {t("training.dont_remember") || "Не помню"}
          </span>
          <span className="nt-practice-control-hint">
            {t("training.card_will_repeat") || "(карточка повторится позже)"}
          </span>
        </button>

        <button
          className="nt-practice-control-btn nt-practice-btn-remember"
          onClick={handleRemember}
          disabled={isAnimating}
        >
          <span className="nt-practice-control-icon">✅</span>
          <span className="nt-practice-control-text">
            {t("training.remember") || "Помню"}
          </span>
          <span className="nt-practice-control-hint">
            {t("training.card_learned")}
          </span>
        </button>
      </div>

      <div className="nt-practice-stats">
        <div className="nt-practice-stats-grid">
          <div className="nt-practice-stat-box">
            <div className="nt-practice-stat-label">
              {t("training.learned") || "Выучено"}
            </div>
            <div className="nt-practice-stat-value nt-practice-stat--learned">
              {stats.learned}
            </div>
          </div>
          <div className="nt-practice-stat-box">
            <div className="nt-practice-stat-label">
              {t("training.repeats") || "Повторений"}
            </div>
            <div className="nt-practice-stat-value nt-practice-stat--repeats">
              {stats.repeats}
            </div>
          </div>
          <div className="nt-practice-stat-box">
            <div className="nt-practice-stat-label">
              {t("training.remaining") || "Осталось"}
            </div>
            <div className="nt-practice-stat-value nt-practice-stat--remaining">
              {Math.max(0, currentDeck.length - 1)}
            </div>
          </div>
          <div className="nt-practice-stat-box">
            <div className="nt-practice-stat-label">
              {t("training.progress") || "Прогресс"}
            </div>
            <div className="nt-practice-stat-value nt-practice-stat--progress">
              {progressPercentage}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
