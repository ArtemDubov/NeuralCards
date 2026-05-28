import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { loadTrainingSettings } from "../../components/common/TrainingSettings";
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
  faKeyboard,
  faGear,
  faFire,
  faDumbbell,
  faChartBar,
} from "../../utils/icons";

export default function DictationPage() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const toast = useToast();

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // { isCorrect, correctAnswer }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [ttsUrl, setTtsUrl] = useState(null);

  // Keyboard shortcuts hint - по умолчанию скрыта
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);

  // Настройки тренировки из localStorage - реактивные
  const [trainingSettings, setTrainingSettings] = useState(loadTrainingSettings());

  // Обновляем настройки при изменении в модалке
  useEffect(() => {
    const handleStorageChange = () => {
      setTrainingSettings(loadTrainingSettings());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('trainingSettingsChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('trainingSettingsChanged', handleStorageChange);
    };
  });

  // Training session
  const [sessionId, setSessionId] = useState(null);

  const inputRef = useRef(null);
  const audioRef = useRef(null);

  const loadCards = useCallback(async () => {
    try {
      // Create dictation session
      try {
        const sessionResponse = await trainingApi.createDictationSession(
          parseInt(setId),
        );
        setSessionId(sessionResponse.data.id);
      } catch (sessionError) {
        console.warn("Could not create dictation session:", sessionError);
      }

      const response = await trainingApi.createPracticeSession(setId);
      let cardsData = response.data.cards;
      if (!cardsData || cardsData.length === 0) {
        navigate(-1);
        return;
      }
      
      // Перемешиваем карточки если включено в настройках
      if (trainingSettings.shuffleCards) {
        cardsData = [...cardsData].sort(() => Math.random() - 0.5);
      }
      
      setCards(cardsData);
    } catch (error) {
      console.error("Error loading dictation:", error);
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      if (status === 404) {
        toast.error(
          `Эндпоинт не найден (404). Проверьте что бэкенд запущен. ${detail || error.message}`,
        );
      } else if (status === 401) {
        toast.error("Сессия истекла. Войдите заново.");
        navigate("/auth/login");
      } else {
        toast.error(`Ошибка загрузки диктанта: ${detail || error.message}`);
      }
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [setId, navigate]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Разрешаем клавиши даже при фокусе на input для некоторых действий
      if (finished || isSubmitting) return;

      switch(e.key) {
        case 'Enter':
          // Enter отправляет ответ если есть текст и нет feedback
          if (e.target.tagName === 'INPUT' && answer.trim() && !feedback) {
            e.preventDefault();
            handleSubmit(e);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowKeyboardHint(false);
          break;
        case '?':
          e.preventDefault();
          setShowKeyboardHint(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [finished, isSubmitting, answer, feedback]);

  // Focus input on card change
  useEffect(() => {
    if (inputRef.current && !feedback) {
      inputRef.current.focus();
    }
  }, [currentIndex, feedback]);

  const currentCard = cards[currentIndex];
  const totalCards = cards.length;
  const answered = currentIndex;
  const progress = totalCards > 0 ? (answered / totalCards) * 100 : 0;

  const handleTTS = useCallback(async () => {
    if (!currentCard?.front?.trim()) return;
    setTtsLoading(true);
    setTtsUrl(null);

    return new Promise((resolve) => {
      textToSpeech(currentCard.front, currentCard.front_lang || "ru")
        .then(async (result) => {
          if (result.audio_url === "browser-synthesis") {
            setTtsPlaying(true);
            // Ждем завершения speechSynthesis
            const checkSpeaking = () => {
              if (!window.speechSynthesis.speaking) {
                setTtsPlaying(false);
                resolve();
              } else {
                setTimeout(checkSpeaking, 200);
              }
            };
            checkSpeaking();
            return;
          }

          const url = getTtsAudioUrl(result.audio_url);
          setTtsUrl(url);
          setTtsPlaying(true);
          
          if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.onended = () => {
              setTtsPlaying(false);
              resolve();
            };
            audioRef.current.onerror = () => {
              setTtsPlaying(false);
              resolve();
            };
            await audioRef.current.play();
          } else {
            resolve();
          }
        })
        .catch((err) => {
          console.error("TTS error:", err);
          setTtsLoading(false);
          resolve();
        })
        .finally(() => {
          setTtsLoading(false);
        });
    });
  }, [currentCard]);

  // Auto-play TTS when card changes
  useEffect(() => {
    if (currentCard && !feedback && trainingSettings.autoReadTTS && trainingSettings.playFront) {
      handleTTS();
    }
  }, [currentIndex, currentCard, feedback, handleTTS, trainingSettings.autoReadTTS, trainingSettings.playFront]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting || !currentCard) return;

    setIsSubmitting(true);

    const userAnswer = answer.trim();
    const correctWord = currentCard.back.trim();
    const isCorrect = userAnswer.toLowerCase() === correctWord.toLowerCase();

    // Submit answer to server
    if (sessionId) {
      try {
        await trainingApi.submitDictationAnswer(
          sessionId,
          currentCard.id,
          userAnswer,
        );
      } catch (error) {
        console.error("Error submitting dictation answer:", error);
      }
    }

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setIncorrectCount((prev) => prev + 1);
    }

    setFeedback({ isCorrect, correctAnswer: correctWord });

    // Move to next card after delay
    setTimeout(() => {
      const nextIdx = currentIndex + 1;
      if (nextIdx >= cards.length) {
        setFinished(true);
        if (sessionId) {
          trainingApi
            .completeDictation(sessionId)
            .then(() => {
              window.dispatchEvent(new Event("trainingCompleted"));
            })
            .catch((err) =>
              console.error("Error completing dictation session:", err),
            );
        }
      } else {
        setCurrentIndex(nextIdx);
        setAnswer("");
        setFeedback(null);
      }
      setIsSubmitting(false);
    }, 1500);
  };

  const handleSkip = () => {
    if (!currentCard) return;

    setIncorrectCount((prev) => prev + 1);
    setFeedback({
      isCorrect: false,
      correctAnswer: currentCard.back.trim(),
    });

    if (sessionId) {
      trainingApi
        .submitDictationAnswer(sessionId, currentCard.id, "")
        .catch((err) => console.error("Error submitting skip answer:", err));
    }

    setTimeout(() => {
      const nextIdx = currentIndex + 1;
      if (nextIdx >= cards.length) {
        setFinished(true);
        if (sessionId) {
          trainingApi
            .completeDictation(sessionId)
            .then(() => {
              window.dispatchEvent(new Event("trainingCompleted"));
            })
            .catch((err) =>
              console.error("Error completing dictation session:", err),
            );
        }
      } else {
        setCurrentIndex(nextIdx);
        setAnswer("");
        setFeedback(null);
      }
    }, 1500);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setFinished(false);
    setAnswer("");
    setFeedback(null);
  };

  if (loading) {
    return (
      <PageShell currentTheme={currentTheme}>
        <div className="training-loading">Загрузка диктанта...</div>
      </PageShell>
    );
  }

  if (finished) {
    const accuracy =
      correctCount + incorrectCount > 0
        ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
        : 0;

    return (
      <PageShell currentTheme={currentTheme} showBackButton backTo="/card-sets" backText="Назад">
        <div className="dictation-container">
          <div className="dictation-complete-screen">
            <h1 className="dictation-complete-title">
              {accuracy >= 90 ? (
                <>
                  <FontAwesomeIcon icon={faTrophy} style={{ marginRight: "8px" }} />
                  Превосходно! 🏆
                </>
              ) : accuracy >= 70 ? (
                <>
                  <FontAwesomeIcon icon={faFire} style={{ marginRight: "8px" }} />
                  Отличная работа! 🔥
                </>
              ) : accuracy >= 50 ? (
                <>
                  <FontAwesomeIcon icon={faDumbbell} style={{ marginRight: "8px" }} />
                  Хороший результат! 💪
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faChartBar} style={{ marginRight: "8px" }} />
                  Продолжайте тренироваться! 👍
                </>
              )}
            </h1>

            <div className="dictation-main-stat">
              <span className="dictation-big-score">{accuracy}%</span>
              <span className="dictation-big-label">точность ответов</span>
            </div>

            <div className="dictation-stats">
              <div className="dictation-stat-item">
                <span className="dictation-stat-value" style={{ color: "var(--nt-success)" }}>
                  {correctCount}
                </span>
                <span className="dictation-stat-label">Верно</span>
              </div>
              <div className="dictation-stat-item">
                <span className="dictation-stat-value" style={{ color: "var(--nt-error)" }}>
                  {incorrectCount}
                </span>
                <span className="dictation-stat-label">Ошибки</span>
              </div>
              <div className="dictation-stat-item">
                <span className="dictation-stat-value" style={{ color: "var(--nt-warning)" }}>
                  {totalCards}
                </span>
                <span className="dictation-stat-label">Всего</span>
              </div>
            </div>

            <div className="dictation-actions">
              <button onClick={handleRestart} className="dictation-action-btn dictation-action-primary">
                <FontAwesomeIcon icon={faRotateRight} style={{ marginRight: "6px" }} />
                Ещё раз
              </button>
              <button onClick={() => navigate("/card-sets")} className="dictation-action-btn dictation-action-secondary">
                <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: "6px" }} />
                К наборам
              </button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!currentCard) return null;

  const inputBorderColor = feedback
    ? feedback.isCorrect
      ? "#27ae60"
      : "#e74c3c"
    : currentTheme.border || "#ccc";

  const inputBgColor = feedback
    ? feedback.isCorrect
      ? "rgba(39,174,96,0.08)"
      : "rgba(231,76,60,0.08)"
    : currentTheme.backgroundSecondary || "var(--nt-background-secondary)";

  return (
    <PageShell currentTheme={currentTheme} showBackButton backTo="/dashboard">
      <div className="dictation-container">
        {/* Header */}
        <div className="dictation-header">
          <button onClick={() => navigate(-1)} className="dictation-back-btn">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>

          <div className="dictation-progress-info">
            <div className="dictation-progress-row">
              <FontAwesomeIcon
                icon={faLayerGroup}
                className="dictation-progress-icon"
              />
              <span className="dictation-progress-text">
                {answered} / {totalCards}
              </span>
            </div>
            <div className="dictation-progress-bar">
              <div
                className="dictation-progress-fill"
                style={{
                  width: `${progress}%`,
                  background: currentTheme.primary,
                }}
              />
            </div>
          </div>

          <div className="dictation-header-right">
            <KeyboardShortcutsModal
              isOpen={showKeyboardHint}
              onClose={() => setShowKeyboardHint(false)}
              currentTheme={currentTheme}
            />
            
            <button
              onClick={() => setShowKeyboardHint(true)}
              className="dictation-header-icon-btn"
              style={{
                background: showKeyboardHint ? currentTheme.primary : `${currentTheme.primary}15`,
                color: showKeyboardHint ? "#fff" : currentTheme.primary,
              }}
              title={showKeyboardHint ? "Скрыть подсказки" : "Показать подсказки"}
            >
              <FontAwesomeIcon icon={faKeyboard} />
            </button>

            <TrainingSettingsModal
              mode="dictation"
              currentTheme={currentTheme}
              trigger={
                <button
                  className="dictation-header-icon-btn"
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
            <span className="dictation-score-correct">{correctCount}</span>
            <span className="dictation-score-incorrect">{incorrectCount}</span>
          </div>
        </div>

        {/* Audio section */}
        <div className="dictation-audio-section">
          <button
            onClick={handleTTS}
            disabled={ttsLoading}
            className="dictation-audio-btn"
            style={{
              background: ttsPlaying
                ? `${currentTheme.success}20`
                : `${currentTheme.primary}15`,
              color: ttsPlaying ? currentTheme.success : currentTheme.primary,
            }}
          >
            <FontAwesomeIcon
              icon={ttsLoading ? faSpinner : faVolumeHigh}
              spin={ttsLoading}
            />
            <span className="dictation-audio-text">
              {ttsLoading
                ? "Генерация..."
                : ttsPlaying
                  ? "Воспроизведение..."
                  : "Слушать слово"}
            </span>
          </button>

          {/* Hidden audio element for playback */}
          <audio ref={audioRef} onEnded={() => setTtsPlaying(false)} />
          
          {/* Card media display */}
          {currentCard.front_image && (
            <img
              src={mediaApi.getMediaUrl(currentCard.front_image)}
              alt=""
              className="dictation-card-image"
            />
          )}
          {currentCard.front_audio && (
            <MiniAudioPlayer audioUrl={currentCard.front_audio} currentTheme={currentTheme} compact />
          )}
          {currentCard.front_video && (
            <video
              controls
              preload="metadata"
              src={mediaApi.getMediaUrl(currentCard.front_video)}
              className="dictation-card-video"
            />
          )}
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="dictation-form">
          <div className="dictation-input-wrapper">
            <FontAwesomeIcon
              icon={faKeyboard}
              className="dictation-input-icon"
            />
            <input
              ref={inputRef}
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Введите услышанное слово..."
              disabled={isSubmitting || !!feedback}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="dictation-input"
              style={{
                background: inputBgColor,
                borderColor: inputBorderColor,
                color: currentTheme.text,
              }}
            />
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`dictation-feedback ${feedback.isCorrect ? 'dictation-feedback-correct' : 'dictation-feedback-incorrect'}`}
              style={{
                background: feedback.isCorrect
                  ? "rgba(39,174,96,0.12)"
                  : "rgba(231,76,60,0.12)",
                borderColor: feedback.isCorrect ? "#27ae60" : "#e74c3c",
              }}
            >
              <FontAwesomeIcon
                icon={feedback.isCorrect ? faCheck : faXmark}
                className="dictation-feedback-icon"
                style={{
                  color: feedback.isCorrect ? "var(--nt-success)" : "var(--nt-error)",
                }}
              />
              {feedback.isCorrect ? (
                <span>Верно!</span>
              ) : (
                <span>
                  Правильный ответ: <strong>{feedback.correctAnswer}</strong>
                </span>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="dictation-buttons-row">
            <button
              type="submit"
              disabled={isSubmitting || !answer.trim() || !!feedback}
              className="dictation-submit-btn"
              style={{
                background:
                  isSubmitting || !answer.trim() || !!feedback
                    ? "#999"
                    : currentTheme.primary,
                opacity: isSubmitting || !answer.trim() || !!feedback ? 0.5 : 1,
              }}
            >
              <FontAwesomeIcon icon={faCheck} className="dictation-btn-icon" />
              Проверить
            </button>
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting || !!feedback}
              className="dictation-skip-btn"
              style={{
                opacity: isSubmitting || !!feedback ? 0.5 : 1,
              }}
            >
              <FontAwesomeIcon icon={faXmark} className="dictation-btn-icon" />
              Пропустить
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

