import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";

// Автомат состояний
const STATES = {
  IDLE: "IDLE", // Ожидание
  EXITING: "EXITING", // Карточка улетает (500ms)
  ENTERING: "ENTERING", // Новая карточка входит (300ms)
};

export const PracticeSession = ({ cards, onAnswer, onEnd }) => {
  const { t } = useAppStore();

  // Основные состояния
  const [currentDeck, setCurrentDeck] = useState([...cards]);
  const [currentCard, setCurrentCard] = useState(cards[0] || null);
  const [isFlipped, setIsFlipped] = useState(false);

  // Автомат состояний (только для exit/enter)
  const [state, setState] = useState(STATES.IDLE);

  // Анимационные классы
  const [cardAnimation, setCardAnimation] = useState("idle");

  // Статистика
  const [stats, setStats] = useState({
    learned: 0,
    totalProcessed: 0,
    repeats: 0,
  });

  const deckRef = useRef(currentDeck);
  const animationTimeoutRef = useRef(null);

  useEffect(() => {
    deckRef.current = currentDeck;
  }, [currentDeck]);

  // Инициализация
  useEffect(() => {
    if (cards.length > 0) {
      const initialDeck = [...cards];
      setCurrentDeck(initialDeck);
      deckRef.current = initialDeck;
      setCurrentCard(initialDeck[0]);

      setStats({
        learned: 0,
        totalProcessed: 0,
        repeats: 0,
      });

      setState(STATES.IDLE);
      setIsFlipped(false);
      setCardAnimation("idle");

      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    }
  }, [cards]);

  // Очистка
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // ПРОСТОЙ ПЕРЕВОРОТ - всегда работает в состоянии IDLE
  const handleFlipCard = useCallback(() => {
    // Только одна проверка
    if (state === STATES.EXITING) return;

    // Просто меняем состояние
    setIsFlipped((prev) => !prev);
  }, [state]);

  // ОБРАБОТКА ОТВЕТА
  const processAnswer = useCallback(
    (remembered) => {
      // Нельзя отвечать во время exit/enter анимаций
      if (state !== STATES.IDLE) return;

      // 1. Переходим в состояние EXITING
      setState(STATES.EXITING);
      setCardAnimation(remembered ? "exit-right" : "exit-left");

      // 2. Анимация выхода (500ms)
      animationTimeoutRef.current = setTimeout(() => {
        onAnswer(remembered, remembered ? 0 : 2);

        setStats((prev) => ({
          ...prev,
          learned: remembered ? prev.learned + 1 : prev.learned,
          repeats: remembered ? prev.repeats : prev.repeats + 1,
          totalProcessed: prev.totalProcessed + 1,
        }));

        const currentDeckArr = deckRef.current;
        let newDeck;
        let newCurrentCard = null;

        if (remembered) {
          newDeck = currentDeckArr.slice(1);
          if (newDeck.length > 0) {
            newCurrentCard = newDeck[0];
          }
        } else {
          newDeck = [...currentDeckArr.slice(1), currentCard];
          if (newDeck.length > 0) {
            newCurrentCard = newDeck[0];
          }
        }

        setCurrentDeck(newDeck);
        deckRef.current = newDeck;

        if (newCurrentCard) {
          // 3. Переходим в состояние ENTERING
          setState(STATES.ENTERING);
          setCurrentCard(newCurrentCard);
          setIsFlipped(false); // Новая карточка всегда с лицом вверх
          setCardAnimation("enter");

          // 4. Анимация входа (300ms)
          setTimeout(() => {
            setCardAnimation("idle");
            setState(STATES.IDLE);
          }, 300);
        } else {
          setCurrentCard(null);
          setState(STATES.IDLE);
        }

        animationTimeoutRef.current = null;
      }, 500);
    },
    [state, currentCard, onAnswer]
  );

  const handleForget = useCallback(() => {
    processAnswer(false);
  }, [processAnswer]);

  const handleRemember = useCallback(() => {
    processAnswer(true);
  }, [processAnswer]);

  const isButtonDisabled = state !== STATES.IDLE;
  const isCompleted = currentDeck.length === 0;
  const progressPercentage =
    cards.length > 0 ? Math.round((stats.learned / cards.length) * 100) : 0;

  // Рендер пустого состояния
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

  // Рендер завершения
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

  // Рендер основной сессии
  return (
    <div className="nt-practice-container">
      <div className="nt-practice-header">
        <div className="nt-practice-title">
          <span className="nt-practice-icon">🔄</span>
          <span>{t("training.mode.practice") || "Повторение"}</span>
        </div>

        <div className="nt-practice-progress">
          {Math.min(stats.totalProcessed + 1, cards.length)} /{" "}
          {cards.length + stats.repeats}
        </div>

        <button
          onClick={onEnd}
          className="nt-btn nt-btn--secondary nt-btn--icon nt-practice-close-btn"
          title={t("training.end_session") || "Завершить тренировку"}
        >
          ✕
        </button>
      </div>

      <div className="nt-practice-main-content">
        {/* ЛЕВЫЕ СТАТЫ */}
        <div className="nt-practice-left-stats">
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
        </div>

        {/* КАРТОЧКА */}
        <div className="nt-practice-card">
          <div className="nt-practice-card-container" onClick={handleFlipCard}>
            {currentCard && (
              <div
                key={currentCard.id}
                className={`nt-practice-card-wrapper 
           ${isFlipped ? "nt-practice-card-wrapper--flipped" : ""}
           ${
             cardAnimation !== "idle"
               ? `nt-practice-card-wrapper--${cardAnimation}`
               : ""
           }`}
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
                      <p className="nt-practice-card-text">
                        {currentCard.front}
                      </p>
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
                      <p className="nt-practice-card-text">
                        {currentCard.back}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ПРАВЫЕ СТАТЫ */}
        <div className="nt-practice-right-stats">
          <div className="nt-practice-stat-box">
            <div className="nt-practice-stat-label">
              {t("training.remaining") || "Осталоcь"}
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

      <div className="nt-practice-controls">
        <button
          className="nt-practice-control-btn nt-practice-btn-forget"
          onClick={handleForget}
          disabled={isButtonDisabled}
        >
          <span className="nt-practice-control-icon">❌</span>
          <span className="nt-practice-control-text">
            {t("training.dont_remember") || "Не помню"}
          </span>
        </button>

        <button
          className="nt-practice-control-btn nt-practice-btn-remember"
          onClick={handleRemember}
          disabled={isButtonDisabled}
        >
          <span className="nt-practice-control-icon">✅</span>
          <span className="nt-practice-control-text">
            {t("training.remember") || "Помню"}
          </span>
        </button>
      </div>
    </div>
  );
};
