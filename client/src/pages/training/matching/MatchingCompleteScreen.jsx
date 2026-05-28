import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy, faFire, faDumbbell, faChartBar } from "../../../utils/icons";
import PageShell from "../../../components/layout/PageShell";

export default function MatchingCompleteScreen({
  correctCount,
  incorrectCount,
  totalBatches,
  currentTheme,
}) {
  const navigate = useNavigate();

  const accuracy =
    correctCount + incorrectCount > 0
      ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
      : 0;

  return (
    <PageShell
      currentTheme={currentTheme}
      showBackButton
      backTo="/card-sets"
      backText="Назад"
    >
      <div className="matching-container">
        <div className="matching-complete-screen">
          <h1 className="matching-complete-title">
            {accuracy >= 90 ? (
              <>
                <FontAwesomeIcon
                  icon={faTrophy}
                  style={{ marginRight: "8px" }}
                />
                Превосходно!
              </>
            ) : accuracy >= 70 ? (
              <>
                <FontAwesomeIcon icon={faFire} style={{ marginRight: "8px" }} />
                Отличная работа!
              </>
            ) : accuracy >= 50 ? (
              <>
                <FontAwesomeIcon
                  icon={faDumbbell}
                  style={{ marginRight: "8px" }}
                />
                Хороший результат!
              </>
            ) : (
              <>
                <FontAwesomeIcon
                  icon={faChartBar}
                  style={{ marginRight: "8px" }}
                />
                Продолжайте тренироваться!
              </>
            )}
          </h1>

          <div className="matching-main-stat">
            <span className="matching-big-score">{accuracy}%</span>
            <span className="matching-big-label">точность ответов</span>
          </div>

          <div className="matching-stats">
            <div className="matching-stat-item">
              <span
                className="matching-stat-value"
                style={{ color: "var(--nt-success)" }}
              >
                {correctCount}
              </span>
              <span className="matching-stat-label">Верно</span>
            </div>
            <div className="matching-stat-item">
              <span
                className="matching-stat-value"
                style={{ color: "var(--nt-error)" }}
              >
                {incorrectCount}
              </span>
              <span className="matching-stat-label">Ошибки</span>
            </div>
            <div className="matching-stat-item">
              <span
                className="matching-stat-value"
                style={{ color: "var(--nt-warning)" }}
              >
                {totalBatches}
              </span>
              <span className="matching-stat-label">Пачек пройдено</span>
            </div>
            <div className="matching-stat-item">
              <span
                className="matching-stat-value"
                style={{ color: "var(--nt-purple)" }}
              >
                {correctCount}/{correctCount + incorrectCount}
              </span>
              <span className="matching-stat-label">Правильно</span>
            </div>
          </div>

          <div className="matching-actions">
            <button
              onClick={() => navigate("/card-sets")}
              className="matching-action-btn matching-action-primary"
            >
              К наборам
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
