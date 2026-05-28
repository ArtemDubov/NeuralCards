import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext";
import AuthModal from "../../../components/common/AuthModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "../../../utils/icons";

// Стили
import "../../../styles/design-system/pages/guest-landing.css";

// Хуки
import { useLandingPractice } from "./hooks/useLandingPractice";
import { useOfficialSets } from "./hooks/useOfficialSets";

// Компоненты
import LandingHero from "./components/LandingHero";
import LandingFeatures from "./components/LandingFeatures";
import LandingPracticeDemo from "./components/LandingPracticeDemo";
import LandingOfficialSets from "./components/LandingOfficialSets";
import LandingCTA from "./components/LandingCTA";

/**
 * Декоративный хедер для лендинга (без навигации)
 */
function LandingHeader({ currentTheme, onLogin, onRegister }) {
  const t = currentTheme;

  return (
    <header
      className="landing-header"
      style={{
        background: t.surface,
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <div className="landing-header-content">
        <div
          className="landing-logo"
          onClick={() => window.location.reload()}
          style={{ cursor: "pointer" }}
        >
          <FontAwesomeIcon
            icon={faGraduationCap}
            style={{ color: t.primary, fontSize: "24px" }}
          />
          <span style={{ fontWeight: 700, fontSize: "20px", color: t.text }}>
            NeuralCards
          </span>
        </div>

        <div className="landing-header-actions">
          <button
            onClick={onLogin}
            className="landing-header-btn"
            style={{
              color: t.text,
              borderColor: t.border,
            }}
          >
            Войти
          </button>
          <button
            onClick={onRegister}
            className="landing-header-btn landing-header-btn-primary"
            style={{
              background: t.primary,
              color: "#fff",
            }}
          >
            Регистрация
          </button>
        </div>
      </div>
    </header>
  );
}

/**
 * Главный компонент лендинга
 * Объединяет все модули и управляет состоянием
 */
export default function LandingPage() {
  const { currentTheme } = useTheme();
  const [authMode, setAuthMode] = useState(null);

  // Хук для практики
  const {
    currentCard,
    currentVisualCard,
    currentIndex,
    totalCards,
    knewCount,
    loading,
    finished,
    ttsLoading,
    ttsPlaying,
    isAnimating,
    startPractice,
    handleAnswer,
    handleFlip,
    resetPractice,
    handleTTS,
  } = useLandingPractice();

  // Хук для официальных наборов
  const { officialSets } = useOfficialSets();

  // Обработчик начала работы - просто открывает регистрацию
  const handleGetStarted = React.useCallback(() => {
    console.log("Начать бесплатно нажата - открываем регистрацию");
    setAuthMode("register");
  }, []);

  // Обработчик входа в систему
  const handleLogin = React.useCallback(() => {
    console.log("Войти нажата - открываем вход");
    setAuthMode("login");
  }, []);

  return (
    <div
      className="landing-page"
      style={{
        minHeight: "100vh",
        background: currentTheme?.background || "var(--nt-background)",
        color: currentTheme?.text || "var(--nt-text)",
      }}
    >
      {/* Декоративный хедер */}
      <LandingHeader
        currentTheme={currentTheme}
        onLogin={() => setAuthMode("login")}
        onRegister={() => setAuthMode("register")}
      />

      {/* Основной контейнер с ограниченной шириной */}
      <div className="landing-container">
        {/* CTA секция - теперь в начале */}
        <LandingCTA
          currentTheme={currentTheme}
          onGetStarted={handleGetStarted}
          onLogin={handleLogin}
        />

        {/* Hero секция (пустая) */}
        <LandingHero currentTheme={currentTheme} />

        {/* Features секция */}
        <LandingFeatures currentTheme={currentTheme} />

        {/* Демо практики */}
        {!loading && currentCard && (
          <section className="landing-practice-section">
            <div className="landing-section-header">
              <h2 className="landing-section-title">Попробуйте прямо сейчас</h2>
              <p className="landing-section-subtitle">
                Интерактивная демонстрация без регистрации
              </p>
            </div>
            <LandingPracticeDemo
              currentTheme={currentTheme}
              currentCard={currentCard}
              currentVisualCard={currentVisualCard}
              currentIndex={currentIndex}
              totalCards={totalCards}
              knewCount={knewCount}
              loading={loading}
              finished={finished}
              ttsLoading={ttsLoading}
              ttsPlaying={ttsPlaying}
              isAnimating={isAnimating}
              onFlip={handleFlip}
              onAnswer={handleAnswer}
              onRestart={resetPractice}
              onTTS={handleTTS}
            />
          </section>
        )}

        {/* Официальные наборы */}
        <LandingOfficialSets
          currentTheme={currentTheme}
          sets={officialSets}
          onStartPractice={(setId) => startPractice(setId, setAuthMode)}
        />
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026</p>
      </footer>

      {/* Auth Modal */}
      {authMode && (
        <AuthModal mode={authMode} onClose={() => setAuthMode(null)} />
      )}
    </div>
  );
}
