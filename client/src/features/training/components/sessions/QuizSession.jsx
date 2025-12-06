import React, { useState, useEffect } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";

export const QuizSession = ({ cards, onAnswer, onEnd }) => {
  const { t } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    if (cards && cards[currentIndex]) {
      const currentCard = cards[currentIndex];
      const wrongAnswers = cards
        .filter((_, i) => i !== currentIndex)
        .map((card) => card.back)
        .slice(0, 3);
      const allAnswers = [currentCard.back, ...wrongAnswers];
      setAnswers([...allAnswers].sort(() => Math.random() - 0.5));
    }
  }, [currentIndex, cards]);

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

  const currentCard = cards[currentIndex];
  const correctAnswer = currentCard.back;
  const isLastCard = currentIndex >= cards.length - 1;

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    const isCorrect = answers[answerIndex] === correctAnswer;

    setTimeout(() => {
      onAnswer(isCorrect, isCorrect ? 0 : 2);
      setShowResult(false);
      setSelectedAnswer(null);
      if (!isLastCard) {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 1500);
  };

  if (currentIndex >= cards.length) {
    return (
      <div className="nt-training-container">
        <div className="nt-training-completion">
          <div className="nt-training-completion-icon">🏁</div>
          <h2 className="nt-training-completion-title">
            {t("training.completed.title") || "Викторина завершена!"}
          </h2>
          <div className="nt-training-completion-actions">
            <button className="nt-btn nt-btn--primary" onClick={onEnd}>
              {t("training.finish") || "Завершить тренировку"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nt-training-container">
      <div className="nt-training-header">
        <button
          onClick={onEnd}
          className="nt-btn nt-btn--secondary nt-btn--icon"
          title={t("training.end_session") || "Завершить тренировку"}
        >
          ✕
        </button>
        <div className="nt-training-title">
          <span className="nt-training-icon">🎯</span>
          <span>{t("training.mode.quiz") || "Режим: Викторина"}</span>
        </div>
        <div className="nt-training-progress">
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      <div className="nt-training-content">
        <div className="nt-training-card">
          <div className="nt-training-card-label">
            <span className="nt-training-card-label-icon">❓</span>
            <span className="nt-training-card-label-text">
              {t("training.card.question") || "Вопрос"}
            </span>
          </div>
          <div className="nt-training-card-text nt-training-text-large nt-util__text-center">
            {currentCard.front}
          </div>

          <div className="nt-util__mt-xl">
            <div className="nt-training-grid nt-grid--2cols nt-grid--gap-md">
              {answers.map((answer, index) => {
                let className = "nt-btn nt-btn--training";
                if (showResult) {
                  if (answer === correctAnswer) {
                    className += " nt-btn--training-correct";
                  } else if (index === selectedAnswer) {
                    className += " nt-btn--training-wrong";
                  }
                }

                return (
                  <button
                    key={index}
                    className={className}
                    onClick={() => !showResult && handleAnswer(index)}
                    disabled={showResult}
                  >
                    {answer}
                  </button>
                );
              })}
            </div>
          </div>

          {showResult && (
            <div
              className={`nt-util__mt-lg nt-util__p-md nt-util__rounded-lg ${
                answers[selectedAnswer] === correctAnswer
                  ? "nt-util__bg-success"
                  : "nt-util__bg-error"
              }`}
            >
              <p className="nt-util__text-center nt-util__font-semibold">
                {answers[selectedAnswer] === correctAnswer
                  ? "✅ " + (t("training.correct") || "Правильно!")
                  : "❌ " + (t("training.incorrect") || "Неправильно!")}
              </p>
              {answers[selectedAnswer] !== correctAnswer && (
                <p className="nt-util__text-center nt-util__mt-xs">
                  {t("training.correct.answer") || "Правильный ответ:"}{" "}
                  <span className="nt-util__font-bold">{correctAnswer}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
