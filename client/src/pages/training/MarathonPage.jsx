import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import TrainingSettingsModal from "../../components/common/TrainingSettingsModal";
import KeyboardShortcutsModal from "../../components/common/KeyboardShortcutsModal";
import { trainingApi } from "../../features/training/api/trainingApi";
import { mediaApi } from "../../features/media";
import MiniAudioPlayer from "../../features/media/components/MiniAudioPlayer";
import {
  textToSpeech,
  getTtsAudioUrl,
} from "../../features/speech/api/speechApi";
import PageShell from "../../components/layout/PageShell";
import {
  faArrowLeft,
  faCheck,
  faXmark,
  faVolumeHigh,
  faRotateRight,
  faTrophy,
  faSpinner,
  faLayerGroup,
  faVideo,
  faGear,
  faKeyboard,
} from "../../utils/icons";

let visualCardId = 0;

export default function MarathonPage() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const toast = useToast();

  // Keyboard shortcuts hint - по умолчанию скрыта
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knewCount, setKnewCount] = useState(0);
  const [didntKnowCount, setDidntKnowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);

  // Training session
  const [sessionId, setSessionId] = useState(null);

  // Flip animation
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipAnimating, setFlipAnimating] = useState(false);

  // Swipe
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartTime, setDragStartTime] = useState(0);
  const startXRef = useRef(0);
  const hasMovedRef = useRef(false);

  const SWIPE_THRESHOLD = 60;
  const MAX_DRAG = 150;

  const loadCards = useCallback(async () => {
    try {
      // Create marathon session
      try {
        const sessionResponse = await trainingApi.createMarathonSession(
          parseInt(setId),
        );
        setSessionId(sessionResponse.data.id);
      } catch (sessionError) {
        console.warn("Could not create marathon session:", sessionError);
      }

      const response = await trainingApi.createPracticeSession(setId);
      const cardsData = response.data.cards;
      if (!cardsData || cardsData.length === 0) {
        navigate(-1);
        return;
      }
      setCards(cardsData);
    } catch (error) {
      console.error("Error loading marathon:", error);
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      if (status === 404) {
        toast.error(
          `Эндпоинт не найден (404). Проверьте что бэкенд запущен с последними изменениями. ${detail || error.message}`,
        );
      } else if (status === 401) {
        toast.error("Сессия истекла. Войдите заново.");
        navigate("/auth/login");
      } else {
        toast.error(`Ошибка загрузки марафона: ${detail || error.message}`);
      }
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [setId, navigate]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const currentCard = cards[currentIndex];
  const totalCards = cards.length;
  const answered = currentIndex;
  const progress = totalCards > 0 ? (answered / totalCards) * 100 : 0;

  const handleFlip = useCallback(() => {
    if (flipAnimating) return;

    setFlipAnimating(true);
    setTimeout(() => {
      setIsFlipped((prev) => !prev);
      setFlipAnimating(false);
      // Auto-read TTS when revealing answer
      if (!isFlipped && currentCard?.back) {
        handleTTS(currentCard.back, currentCard.back_lang || "ru");
      }
    }, 250);
  }, [flipAnimating, isFlipped, currentCard]);

  const handlePointerDown = (e) => {
    if (finished || flipAnimating) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX;
    setDragStartTime(Date.now());
    hasMovedRef.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const diff = clientX - startXRef.current;

    if (Math.abs(diff) > 5) {
      hasMovedRef.current = true;
    }

    const clamped = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, diff));
    setDragOffset(clamped);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const elapsed = Date.now() - dragStartTime;
    const isClick = !hasMovedRef.current && elapsed < 300;

    if (isClick) {
      handleFlip();
      setDragOffset(0);
      return;
    }

    // Swipe
    if (Math.abs(dragOffset) > SWIPE_THRESHOLD && isFlipped) {
      const direction = dragOffset > 0 ? "right" : "left";
      handleSwipeAction(direction);
    } else {
      setDragOffset(0);
    }
  };

  const handleSwipeAction = useCallback(
    async (direction) => {
      if (flipAnimating || !currentCard) return;

      const knew = direction === "right";

      // Submit answer to server
      if (sessionId) {
        try {
          await trainingApi.submitMarathonAnswer(
            sessionId,
            currentCard.id,
            knew,
          );
        } catch (error) {
          console.error("Error submitting marathon answer:", error);
        }
      }

      if (knew) {
        setKnewCount((prev) => prev + 1);
      } else {
        setDidntKnowCount((prev) => prev + 1);
      }

      // Animate exit
      const exitOffset = direction === "right" ? 500 : -500;
      setDragOffset(exitOffset);

      setTimeout(() => {
        const nextIdx = currentIndex + 1;
        if (nextIdx >= cards.length) {
          // Marathon complete
          setFinished(true);
          if (sessionId) {
            trainingApi
              .completeMarathon(sessionId)
              .then(() => {
                window.dispatchEvent(new Event("trainingCompleted"));
              })
              .catch((err) =>
                console.error("Error completing marathon session:", err),
              );
          }
        } else {
          setCurrentIndex(nextIdx);
          setIsFlipped(false);
          setDragOffset(0);
        }
      }, 300);
    },
    [flipAnimating, currentCard, sessionId, currentIndex, cards.length],
  );

  const handleTTS = async (text, lang = "ru") => {
    if (!text?.trim()) return;
    setTtsLoading(true);

    try {
      const result = await textToSpeech(text, lang);

      if (result.audio_url === "browser-synthesis") {
        setTtsPlaying(true);
        const checkInterval = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            clearInterval(checkInterval);
            setTtsPlaying(false);
          }
        }, 500);
        return;
      }

      const url = getTtsAudioUrl(result.audio_url);
      const audio = new Audio(url);
      audio.onended = () => setTtsPlaying(false);
      setTtsPlaying(true);
      audio.play();
    } catch (err) {
      console.error("TTS error:", err);
    } finally {
      setTtsLoading(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setKnewCount(0);
    setDidntKnowCount(0);
    setFinished(false);
    setIsFlipped(false);
    setDragOffset(0);
  };

  // Горячие клавиши
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (finished || loading) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          handleFlip();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleSwipeAction("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          handleSwipeAction("right");
          break;
        case "KeyR":
          e.preventDefault();
          handleRestart();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [finished, loading, handleFlip, handleSwipeAction, handleRestart]);

  if (loading) {
    return (
      <PageShell currentTheme={currentTheme}>
        <div className="training-loading">Загрузка марафона...</div>
      </PageShell>
    );
  }

  if (finished) {
    const accuracy =
      knewCount + didntKnowCount > 0
        ? Math.round((knewCount / (knewCount + didntKnowCount)) * 100)
        : 0;

    return (
      <PageShell currentTheme={currentTheme} showBackButton backTo="/dashboard">
        <div className="marathon-container">
          <div className="marathon-complete-screen">
            <FontAwesomeIcon
              icon={faTrophy}
              style={{ fontSize: "56px", color: "var(--nt-warning)" }}
            />
            <h2 style={{ color: currentTheme.text, margin: "16px 0 8px" }}>
              Марафон завершён!
            </h2>
            <p
              style={{ color: currentTheme.textSecondary, margin: "0 0 24px" }}
            >
              Вы прошли все {totalCards} карточек
            </p>

            <div className="marathon-complete-stats">
              <div className="marathon-stat-card">
                <span
                  className="marathon-stat-value"
                  style={{ color: "var(--nt-success)" }}
                >
                  {knewCount}
                </span>
                <span className="marathon-stat-label">Помню</span>
              </div>
              <div className="marathon-stat-card">
                <span
                  className="marathon-stat-value"
                  style={{ color: "var(--nt-error)" }}
                >
                  {didntKnowCount}
                </span>
                <span className="marathon-stat-label">Не помню</span>
              </div>
              <div className="marathon-stat-card">
                <span
                  className="marathon-stat-value"
                  style={{ color: currentTheme.primary }}
                >
                  {accuracy}%
                </span>
                <span className="marathon-stat-label">Точность</span>
              </div>
            </div>

            <div className="marathon-actions">
              <button
                onClick={handleRestart}
                className="marathon-action-btn marathon-action-btn-primary"
              >
                <FontAwesomeIcon
                  icon={faRotateRight}
                  style={{ marginRight: "6px" }}
                />
                Пройти снова
              </button>
              <button
                onClick={() => navigate(-1)}
                className="marathon-action-btn marathon-action-btn-secondary"
                style={{ color: currentTheme.text }}
              >
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  style={{ marginRight: "6px" }}
                />
                Назад
              </button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!currentCard) return null;

  const displayText = isFlipped ? currentCard.back : currentCard.front;
  const displayImage = isFlipped
    ? currentCard.back_image
    : currentCard.front_image;
  const displayAudio = isFlipped
    ? currentCard.back_audio
    : currentCard.front_audio;
  const displayVideo = isFlipped
    ? currentCard.back_video
    : currentCard.front_video;

  const cardStyle = {
    transform: `translateX(${dragOffset}px) rotateY(${flipAnimating ? 90 : 0}deg)`,
    opacity:
      Math.abs(dragOffset) > 30
        ? Math.max(0, 1 - Math.abs(dragOffset) / 350)
        : 1,
    transition: isDragging
      ? "none"
      : "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease",
    background:
      dragOffset > 30
        ? `rgba(39,174,96,${Math.min(Math.abs(dragOffset) / 200, 0.15)})`
        : dragOffset < -30
          ? `rgba(231,76,60,${Math.min(Math.abs(dragOffset) / 200, 0.15)})`
          : "#fff",
    cursor: isDragging ? "grabbing" : "pointer",
  };

  return (
    <PageShell currentTheme={currentTheme} showBackButton backTo="/dashboard">
      <div className="marathon-container">
        {/* Header */}
        <div className="marathon-header">
          <button onClick={() => navigate(-1)} className="marathon-back-btn">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>

          <div className="marathon-progress-info">
            <div className="marathon-progress-row">
              <FontAwesomeIcon
                icon={faLayerGroup}
                className="marathon-progress-icon"
              />
              <span className="marathon-progress-text">
                {answered} / {totalCards}
              </span>
            </div>
            <div className="marathon-progress-bar">
              <div
                className="marathon-progress-fill"
                style={{
                  width: `${progress}%`,
                  background: currentTheme.primary,
                }}
              />
            </div>
          </div>

          <div className="marathon-header-right">
            <KeyboardShortcutsModal
              isOpen={showKeyboardHint}
              onClose={() => setShowKeyboardHint(false)}
              currentTheme={currentTheme}
            />
            
            {/* Keyboard shortcuts hint */}
            {showKeyboardHint && (
              <div className="marathon-keyboard-hint">
                <p><strong>Горячие клавиши:</strong></p>
                <ul>
                  <li><kbd>Пробел</kbd> — перевернуть карточку</li>
                  <li><kbd>←</kbd> — не знаю</li>
                  <li><kbd>→</kbd> — знаю</li>
                  <li><kbd>R</kbd> — начать заново</li>
                </ul>
              </div>
            )}
            <button
              onClick={() => setShowKeyboardHint(true)}
              className="marathon-header-icon-btn"
              style={{
                background: showKeyboardHint ? currentTheme.primary : `${currentTheme.primary}15`,
                color: showKeyboardHint ? "#fff" : currentTheme.primary,
              }}
              title={showKeyboardHint ? "Скрыть подсказки" : "Показать подсказки"}
            >
              <FontAwesomeIcon icon={faKeyboard} />
            </button>

            <TrainingSettingsModal
              mode="marathon"
              currentTheme={currentTheme}
              trigger={
                <button
                  className="marathon-header-icon-btn"
                  style={{
                    background: `${currentTheme.primary}15`,
                    color: currentTheme.primary,
                  }}
                  title="Настройки тренировки"
                >
                  <FontAwesomeIcon icon={faGear} />
                </button>
              }
            />
            <span className="marathon-score-knew">{knewCount}</span>
            <span className="marathon-score-didnt-know">{didntKnowCount}</span>
          </div>
        </div>

        {/* Card area */}
        <div
          className="marathon-card-area"
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          onMouseDown={handlePointerDown}
          onMouseMove={isDragging ? handlePointerMove : undefined}
          onMouseUp={handlePointerUp}
          onMouseLeave={isDragging ? handlePointerUp : undefined}
        >
          <div className="marathon-card" style={cardStyle}>
            <div className="marathon-card-text">{displayText}</div>
            {displayImage && (
              <img
                src={mediaApi.getMediaUrl(displayImage)}
                alt=""
                className="marathon-card-image"
              />
            )}
            {displayAudio && (
              <MiniAudioPlayer audioUrl={displayAudio} currentTheme={currentTheme} compact />
            )}
            {displayVideo && (
              <video
                controls
                preload="metadata"
                src={mediaApi.getMediaUrl(displayVideo)}
                className="marathon-card-video"
              />
            )}
            {/* TTS button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const lang = isFlipped
                  ? currentCard.back_lang || "ru"
                  : currentCard.front_lang || "ru";
                handleTTS(displayText, lang);
              }}
              disabled={ttsLoading}
              className="marathon-card-tts-btn"
              title="Озвучить текст"
            >
              <FontAwesomeIcon
                icon={ttsLoading ? faSpinner : faVolumeHigh}
                spin={ttsLoading}
              />
            </button>
            <div className="marathon-hint">
              {isFlipped
                ? "← Не помню · Помню →"
                : "Нажмите, чтобы увидеть ответ"}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="marathon-buttons-row">
          <button
            onClick={() => handleSwipeAction("left")}
            disabled={flipAnimating}
            className="marathon-btn marathon-btn-didnt-know"
            style={{ opacity: flipAnimating ? 0.5 : 1 }}
          >
            <FontAwesomeIcon icon={faXmark} style={{ marginRight: "8px" }} />
            Не помню
          </button>
          <button
            onClick={() => handleSwipeAction("right")}
            disabled={flipAnimating}
            className="marathon-btn marathon-btn-knew"
            style={{ opacity: flipAnimating ? 0.5 : 1 }}
          >
            <FontAwesomeIcon icon={faCheck} style={{ marginRight: "8px" }} />
            Помню
          </button>
        </div>
      </div>
    </PageShell>
  );
}

// Стили перенесены в training.css
