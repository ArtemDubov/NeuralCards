import React, { useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import "./TrainingPage.css";

export function TrainingPage({ cardsets }) {
  const { t } = useLanguage();
  const [selectedSet, setSelectedSet] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [trainingMode, setTrainingMode] = useState(null);

  // ШАГ 1: Выбор режима обучения
  if (trainingMode === null) {
    return (
      <div className="training-container container-tp6">
        <h2>{t("training.choose.mode")}</h2>

        <div className="mode-selection">
          <div
            className="mode-card"
            onClick={() => setTrainingMode("practice")}
          >
            <div className="mode-icon">🔄</div>
            <h3>{t("training.mode.practice")}</h3>
            <p>Классический режим переворачивания карточек</p>
            <ul>
              <li>Последовательный просмотр</li>
              <li>Переворачивание карточек</li>
              <li>Подходит для изучения</li>
            </ul>
          </div>

          <div className="mode-card" onClick={() => setTrainingMode("quiz")}>
            <div className="mode-icon">🎯</div>
            <h3>{t("training.mode.quiz")}</h3>
            <p>Проверка знаний с выбором ответа</p>
            <ul>
              <li>4 варианта ответа</li>
              <li>Автопроверка</li>
              <li>Минимум 4 карточки</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ШАГ 2: Выбор набора карточек
  if (!selectedSet) {
    return (
      <div className="training-container container-tp6">
        <div className="training-header">
          <button className="btn-tp3" onClick={() => setTrainingMode(null)}>
            ← {t("sets.back")}
          </button>
          <h2>
            {trainingMode === "practice"
              ? t("training.mode.practice")
              : t("training.mode.quiz")}
          </h2>
        </div>

        <div className="sets-selection">
          <h3>{t("sets.view")}:</h3>
          <div className="sets-grid">
            {cardsets.map((set) => (
              <div key={set.id} className="training-set-card container-tp4">
                <h4>{set.title}</h4>
                <p className="cards-count">
                  {t("sets.cards_count")}: {set.cards?.length || 0}
                </p>

                {trainingMode === "quiz" && set.cards?.length < 4 && (
                  <div className="warning-message">
                    ⚠️ {t("training.minimum.cards")}
                  </div>
                )}

                <button
                  className="btn-tp1"
                  onClick={() => setSelectedSet(set)}
                  disabled={trainingMode === "quiz" && set.cards?.length < 4}
                >
                  {trainingMode === "practice"
                    ? t("training.start")
                    : t("training.start.quiz")}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // РЕЖИМ ВИКТОРИНЫ
  if (trainingMode === "quiz") {
    return (
      <QuizPractice
        selectedSet={selectedSet}
        onBack={() => {
          setSelectedSet(null);
          setCurrentCardIndex(0);
        }}
      />
    );
  }

  // РЕЖИМ ОТРАБОТКИ
  const currentCard = selectedSet.cards?.[currentCardIndex];

  if (!currentCard) {
    return (
      <div className="training-container completion-screen container-tp6">
        <h2>{t("training.completed")} 🎉</h2>
        <p>{t("training.completed.message", { title: selectedSet.title })}</p>
        <button
          className="btn-tp1"
          onClick={() => {
            setSelectedSet(null);
            setCurrentCardIndex(0);
            setShowAnswer(false);
          }}
        >
          {t("training.choose.another")}
        </button>
      </div>
    );
  }

  return (
    <div className="training-container container-tp6">
      <div className="training-header">
        <h2>{t("training.title", { title: selectedSet.title })}</h2>
        <div className="progress-info">
          {t("training.card.progress", {
            current: currentCardIndex + 1,
            total: selectedSet.cards.length,
          })}
        </div>
      </div>

      <div
        className={`training-card ${showAnswer ? "show-answer" : ""}`}
        onClick={() => setShowAnswer(!showAnswer)}
      >
        {showAnswer ? (
          <div className="card-content">
            <h3>{t("cards.back")}:</h3>
            <p className="card-text">{currentCard.back}</p>

            {/* МЕДИА НА ОБОРОТНОЙ СТОРОНЕ */}
            {currentCard.backImageUrl && (
              <div className="card-media">
                <img
                  src={`http://localhost:5001${currentCard.backImageUrl}`}
                  alt=""
                  className="card-image"
                />
              </div>
            )}

            {currentCard.backAudioUrl && (
              <div className="card-media">
                <audio controls className="card-audio">
                  <source
                    src={`http://localhost:5001${currentCard.backAudioUrl}`}
                    type="audio/mpeg"
                  />
                  <source
                    src={`http://localhost:5001${currentCard.backAudioUrl}`}
                    type="audio/wav"
                  />
                  <source
                    src={`http://localhost:5001${currentCard.backAudioUrl}`}
                    type="audio/ogg"
                  />
                  {t("audio.not.supported")}
                </audio>
              </div>
            )}
          </div>
        ) : (
          <div className="card-content">
            <h3>{t("cards.front")}:</h3>
            <p className="card-text">{currentCard.front}</p>

            {/* МЕДИА НА ЛИЦЕВОЙ СТОРОНЕ */}
            {currentCard.imageUrl && (
              <div className="card-media">
                <img
                  src={`http://localhost:5001${currentCard.imageUrl}`}
                  alt=""
                  className="card-image"
                />
              </div>
            )}

            {currentCard.audioUrl && (
              <div className="card-media">
                <audio controls className="card-audio">
                  <source
                    src={`http://localhost:5001${currentCard.audioUrl}`}
                    type="audio/mpeg"
                  />
                  <source
                    src={`http://localhost:5001${currentCard.audioUrl}`}
                    type="audio/wav"
                  />
                  <source
                    src={`http://localhost:5001${currentCard.audioUrl}`}
                    type="audio/ogg"
                  />
                  {t("audio.not.supported")}
                </audio>
              </div>
            )}
          </div>
        )}
        <div className="card-hint">👆 {t("training.card.hint")}</div>
      </div>

      <div className="training-controls">
        {showAnswer && (
          <button
            className="btn-tp1 next-button"
            onClick={() => {
              setShowAnswer(false);
              setCurrentCardIndex(currentCardIndex + 1);
            }}
          >
            {t("training.next")} →
          </button>
        )}
        <button
          className="btn-tp3"
          onClick={() => {
            setSelectedSet(null);
            setCurrentCardIndex(0);
            setShowAnswer(false);
          }}
        >
          {t("training.finish")}
        </button>
      </div>
    </div>
  );
}

// КОМПОНЕНТ ВИКТОРИНЫ
function QuizPractice({ selectedSet, onBack }) {
  const { t } = useLanguage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Генерация вопросов для викторины
  const generateQuizQuestions = () => {
    return selectedSet.cards.map((card, index) => {
      // Собираем все возможные неправильные ответы (back других карточек)
      const wrongAnswers = selectedSet.cards
        .filter((_, i) => i !== index)
        .map((card) => card.back)
        .slice(0, 3); // Берем первые 3

      // Если неправильных ответов меньше 3, дополняем пустыми
      while (wrongAnswers.length < 3) {
        wrongAnswers.push(t("quiz.no.option"));
      }

      // Создаем варианты ответов и перемешиваем
      const allAnswers = [card.back, ...wrongAnswers];
      const shuffledAnswers = [...allAnswers].sort(() => Math.random() - 0.5);

      return {
        question: card.front,
        correctAnswer: card.back,
        answers: shuffledAnswers,
        correctIndex: shuffledAnswers.indexOf(card.back),
        media: {
          imageUrl: card.imageUrl,
          audioUrl: card.audioUrl,
        },
      };
    });
  };

  const [questions] = useState(() => generateQuizQuestions());
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return; // Запрещаем менять ответ

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    // Проверяем правильность ответа
    if (answerIndex === currentQuestion.correctIndex) {
      setScore(score + 1);
    }

    // Автоматически переходим к следующему вопросу через 2 секунды
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setQuizCompleted(true);
      }
    }, 2000);
  };

  // ЭКРАН ЗАВЕРШЕНИЯ ВИКТОРИНЫ
  if (quizCompleted) {
    return (
      <div className="training-container completion-screen container-tp6">
        <h2>{t("training.quiz.completed")} 🎉</h2>
        <div className="quiz-results">
          <div className="result-score">
            {t("training.score", { score: score, total: questions.length })}
          </div>
          <div className="result-percentage">
            {t("training.accuracy", {
              accuracy: Math.round((score / questions.length) * 100),
            })}
          </div>
        </div>
        <button className="btn-tp1" onClick={onBack}>
          {t("training.choose.another")}
        </button>
      </div>
    );
  }

  // ИНТЕРФЕЙС ВИКТОРИНЫ
  return (
    <div className="training-container quiz-container container-tp6">
      <div className="training-header">
        <h2>{t("training.quiz.title", { title: selectedSet.title })}</h2>
        <div className="progress-info">
          {t("training.question.progress", {
            current: currentQuestionIndex + 1,
            total: questions.length,
          })}
        </div>
        <div className="score-info">
          {t("training.current.score", { score: score })}
        </div>
      </div>

      <div className="quiz-question">
        <h3>{currentQuestion.question}</h3>

        {/* Медиа контент вопроса */}
        {currentQuestion.media.imageUrl && (
          <div className="card-media">
            <img
              src={`http://localhost:5001${currentQuestion.media.imageUrl}`}
              alt=""
              className="card-image"
            />
          </div>
        )}

        {currentQuestion.media.audioUrl && (
          <div className="card-media">
            <audio controls className="card-audio">
              <source
                src={`http://localhost:5001${currentQuestion.media.audioUrl}`}
                type="audio/mpeg"
              />
              {t("audio.not.supported")}
            </audio>
          </div>
        )}
      </div>

      <div className="quiz-answers">
        {currentQuestion.answers.map((answer, index) => (
          <button
            key={index}
            className={`btn-tp6 ${
              showResult
                ? index === currentQuestion.correctIndex
                  ? "correct"
                  : index === selectedAnswer
                  ? "wrong"
                  : ""
                : selectedAnswer === index
                ? "selected"
                : ""
            }`}
            onClick={() => handleAnswerSelect(index)}
            disabled={showResult}
          >
            {answer}
          </button>
        ))}
      </div>

      <div className="training-controls">
        <button className="btn-tp3" onClick={onBack}>
          {t("training.finish")}
        </button>
      </div>
    </div>
  );
}
