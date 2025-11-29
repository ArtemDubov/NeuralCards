import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";

// 🎯 Компоненты для разных режимов тренировки
const PracticeSession = ({
  training,
  selectedSet,
  activeMode,
  onAnswer,
  onEnd,
}) => {
  const { engineState } = training;
  const { t } = useLanguage();

  return (
    <div className="training-container container-tp6">
      <div className="training-header">
        <button className="btn-tp3" onClick={onEnd}>
          {t("training.finish")}
        </button>
        <h2>{t("training.title", { title: selectedSet?.title })}</h2>
      </div>

      {engineState.currentCard && (
        <div className="practice-session">
          {/* Интерфейс практики */}
          <div className="training-card">
            {engineState.showAnswer ? (
              <div className="card-back">
                <h3>{t("card.back.side")}</h3>
                <p>{engineState.currentCard.back}</p>
                <div className="difficulty-buttons">
                  <button onClick={() => onAnswer(0, true)}>
                    {t("difficulty.easy")}
                  </button>
                  <button onClick={() => onAnswer(1, true)}>
                    {t("difficulty.medium")}
                  </button>
                  <button onClick={() => onAnswer(2, true)}>
                    {t("difficulty.hard")}
                  </button>
                  <button onClick={() => onAnswer(2, false)}>
                    {t("difficulty.wrong")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="card-front">
                <h3>{t("card.front.side")}</h3>
                <p>{engineState.currentCard.front}</p>
                <button
                  onClick={() =>
                    training.setState?.((prev) => ({
                      ...prev,
                      engineState: { ...prev.engineState, showAnswer: true },
                    }))
                  }
                >
                  {t("training.card.hint")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const QuizSession = ({
  training,
  selectedSet,
  activeMode,
  onAnswer,
  onEnd,
}) => {
  const { engineState } = training;
  const { t } = useLanguage();

  const currentQuestion = engineState.questions?.[engineState.currentQuestion];

  return (
    <div className="training-container container-tp6">
      <div className="training-header">
        <button className="btn-tp3" onClick={onEnd}>
          Завершить
        </button>
        <h2>Викторина: {selectedSet?.title}</h2>
        <div className="quiz-progress">
          Вопрос {engineState.currentQuestion + 1} из{" "}
          {engineState.questions?.length}
        </div>
      </div>

      {currentQuestion && (
        <div className="quiz-session">
          <h3>{currentQuestion.question}</h3>

          <div className="quiz-answers">
            {currentQuestion.answers.map((answer, index) => (
              <button
                key={index}
                className={`answer-btn ${
                  engineState.showResult
                    ? index === currentQuestion.correctIndex
                      ? "correct"
                      : index === engineState.selectedAnswer
                      ? "wrong"
                      : ""
                    : ""
                }`}
                onClick={() => !engineState.showResult && onAnswer(index)}
                disabled={engineState.showResult}
              >
                {answer}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 🎯 Реестр компонентов сессий
const SESSION_COMPONENTS = {
  practice: PracticeSession,
  quiz: QuizSession,
  sprint: PracticeSession, // временно, нужно создать SprintSession
};

const TrainingSession = ({
  training,
  selectedSet,
  activeMode,
  onAnswer,
  onEnd,
}) => {
  const SessionComponent = SESSION_COMPONENTS[activeMode] || PracticeSession;

  return (
    <SessionComponent
      training={training}
      selectedSet={selectedSet}
      activeMode={activeMode}
      onAnswer={onAnswer}
      onEnd={onEnd}
    />
  );
};

export default TrainingSession;
