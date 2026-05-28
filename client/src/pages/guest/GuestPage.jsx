import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { guestApi } from "../../features/guest/api/guestApi";
import PageShell from "../../components/layout/PageShell";
import { faGraduationCap, faBookOpen } from "../../utils/icons";

export default function GuestPage() {
  const { setId } = useParams();
  const { currentTheme } = useTheme();
  const [sets, setSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSets();
    
    // Если есть setId в URL, автоматически начинаем тренировку
    if (setId) {
      startTraining(parseInt(setId));
    }
  }, [setId]);

  const loadSets = async () => {
    try {
      const response = await guestApi.getSets();
      setSets(response.data);
    } catch (error) {
      console.error("Error loading sets:", error);
    } finally {
      setLoading(false);
    }
  };

  const startTraining = async (setId) => {
    try {
      const response = await guestApi.getSetCards(setId);
      setSelectedSet(response.data);
      setCards(response.data.cards || []);
      setCurrentIndex(0);
      setShowAnswer(false);
      setCompleted(false);
    } catch (error) {
      console.error("Error starting training:", error);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      setCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  if (loading) {
    return (
      <PageShell currentTheme={currentTheme}>
        <div className="guest-loading">Загрузка...</div>
      </PageShell>
    );
  }

  // Режим тренировки
  if (selectedSet && cards.length > 0 && !completed) {
    const card = cards[currentIndex];
    return (
      <PageShell
        currentTheme={currentTheme}
        showBackButton={true}
        backTo="/guest"
        backText="Назад к наборам"
      >
        <div className="guest-training-header">
          <h2>{selectedSet.title}</h2>
        </div>

        <div className="guest-progress">
          <div className="guest-progress-bar">
            <div
              style={{
                ...styles.progressFill,
                width: `${((currentIndex + 1) / cards.length) * 100}%`,
              }}
            />
          </div>
          <span>
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        <div className="guest-card-container">
          <div className="guest-card">
            <div className="guest-card-front">
              <h3>{card.front}</h3>
            </div>

            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="guest-show-button"
              >
                👁️ Показать перевод
              </button>
            ) : (
              <div className="guest-answer">
                <p className="guest-answer-text">{card.back}</p>
                <button
                  onClick={() => setShowAnswer(false)}
                  className="guest-hide-button"
                >
                  🙈 Скрыть
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="guest-controls">
          <button
            onClick={handlePrev}
            className="guest-button"
            disabled={currentIndex === 0}
          >
            ← Назад
          </button>
          <button onClick={handleNext} className="guest-button-primary">
            {currentIndex === cards.length - 1 ? "✓ Завершить" : "Далее →"}
          </button>
        </div>
      </PageShell>
    );
  }

  // Завершено
  if (completed) {
    return (
      <PageShell
        currentTheme={currentTheme}
        showBackButton={true}
        backTo="/guest"
        backText="Назад к наборам"
      >
        <div className="guest-complete-card">
          <h1 className="guest-complete-title">🎉 Поздравляем!</h1>
          <p className="guest-complete-text">
            Вы прошли все {cards.length} карточек из набора "
            {selectedSet?.title}"
          </p>
          <div className="guest-complete-actions">
            <Link to="/guest" className="guest-button">
              К наборам
            </Link>
            <button
              onClick={() => startTraining(selectedSet.id)}
              className="guest-button-primary"
            >
              Повторить
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  // Выбор набора
  return (
    <PageShell currentTheme={currentTheme}>
      {/* Заголовок страницы */}
      <div className="page-header-section" style={{ marginBottom: "24px" }}>
        <h1 className="page-title" style={{ color: currentTheme.text }}>
          <FontAwesomeIcon icon={faGraduationCap} style={{ marginRight: "8px", color: currentTheme.primary }} />
          Гостевой режим
        </h1>
      </div>

      <div className="guest-header">
        <p>Выберите набор для тренировки</p>
      </div>

      <div className="guest-sets-grid">
        {sets.map((set) => (
          <div key={set.id} className="guest-set-card">
            <h3>{set.title}</h3>
            <p>{set.description}</p>
            <p className="guest-cards-count">{set.cards_count} карточек</p>
            <button
              onClick={() => startTraining(set.id)}
              className="guest-button-primary"
            >
              Начать тренировку
            </button>
          </div>
        ))}
      </div>

      <div className="guest-auth-prompt">
        <p>
          Хотите сохранить прогресс?{" "}
          <Link to="/login" className="guest-link">
            Войти
          </Link>{" "}
          |{" "}
          <Link to="/register" className="guest-link">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </PageShell>
  );
}

const styles = {
  guestHeader: {
    textAlign: "center",
    marginBottom: "40px",
  },
  setsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
    marginBottom: "40px",
  },
  setCard: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  cardsCount: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "16px",
  },
  buttonPrimary: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "600",
  },
  authPrompt: {
    textAlign: "center",
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  link: {
    color: "var(--nt-primary)",
    textDecoration: "underline",
  },
  trainingHeader: {
    marginBottom: "24px",
  },
  backLink: {
    color: "var(--nt-primary)",
    textDecoration: "none",
    display: "inline-block",
    marginBottom: "16px",
  },
  progress: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
  },
  progressBar: {
    flex: 1,
    height: "8px",
    background: "rgba(0,0,0,0.1)",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    transition: "width 0.3s",
  },
  cardContainer: {
    maxWidth: "600px",
    margin: "0 auto 24px",
  },
  card: {
    background: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    textAlign: "center",
    minHeight: "200px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  cardFront: {
    marginBottom: "24px",
  },
  showButton: {
    padding: "12px 24px",
    background: "var(--nt-primary)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
  answer: {
    marginTop: "16px",
  },
  answerText: {
    fontSize: "18px",
    color: "#666",
    marginBottom: "16px",
  },
  hideButton: {
    padding: "8px 16px",
    background: "var(--nt-background-secondary)",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  controls: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  button: {
    padding: "12px 24px",
    background: "var(--nt-background-secondary)",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
  completeCard: {
    maxWidth: "600px",
    margin: "0 auto",
    background: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  completeTitle: {
    fontSize: "32px",
    marginBottom: "16px",
  },
  completeText: {
    fontSize: "18px",
    color: "#666",
    marginBottom: "32px",
  },
  completeActions: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
  },
};
