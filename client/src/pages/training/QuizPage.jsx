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
  faGear,
  faFire,
  faKeyboard,
  faDumbbell,
  faChartBar,
  faBullseye,
} from "../../utils/icons";

export default function QuizPage() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const toast = useToast();
  const audioRef = useRef(null);

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [options, setOptions] = useState([]);
  
  // Streak counter для мотивации
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  // Keyboard shortcuts hint - по умолчанию скрыта
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);

  // Training session
  const [trainingSessionId, setTrainingSessionId] = useState(null);

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

  const loadCards = useCallback(async () => {
    try {
      // Создаём TrainingSession для статистики
      const sessionResponse = await trainingApi.createSession({
        card_set_id: parseInt(setId),
        mode: "quiz",
      });
      setTrainingSessionId(sessionResponse.data.id);

      const response = await trainingApi.createPracticeSession(setId);
      let cardsData = response.data.cards;
      
      if (!cardsData || cardsData.length < 4) {
        toast.error("Для режима квиза нужно минимум 4 карточки");
        navigate(-1);
        return;
      }
      
      // Перемешиваем карточки если включено в настройках
      if (trainingSettings.shuffleCards) {
        cardsData = [...cardsData].sort(() => Math.random() - 0.5);
      }
      
      setCards(cardsData);
      setTotal(cardsData.length);
      generateOptions(cardsData, 0);
    } catch (error) {
      console.error("Error loading quiz:", error);
      navigate(-1);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId, navigate, trainingSettings.shuffleCards]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (finished || isAnswering) return;

      switch(e.key) {
        case '1':
        case '2':
        case '3':
        case '4':
          const optionIndex = parseInt(e.key) - 1;
          if (optionIndex >= 0 && optionIndex < options.length) {
            handleAnswer(options[optionIndex]);
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
  }, [options, finished, isAnswering]);

  const generateOptions = (allCards, currentIdx) => {
    const correctCard = allCards[currentIdx];
    const wrongCards = allCards.filter((_, i) => i !== currentIdx);

    // Перемешиваем и берём 3 неправильных
    const shuffled = wrongCards.sort(() => Math.random() - 0.5).slice(0, 3);
    const allOptions = [...shuffled, correctCard].sort(
      () => Math.random() - 0.5,
    );

    setOptions(allOptions);
    
    // Авто-чтение лицевой стороны (вопроса) если включено в настройках
    if (trainingSettings.autoReadTTS && trainingSettings.playFront && correctCard?.front) {
      setTimeout(() => {
        handleTTS(correctCard.front, correctCard.front_lang || "ru");
      }, 300);
    }
  };

  const handleAnswer = async (optionCard) => {
    if (isAnswering) return;
    setIsAnswering(true);

    const correct = optionCard.id === cards[currentIndex].id;
    setIsCorrect(correct);
    setSelectedAnswer(optionCard.id);

    if (correct) {
      setScore((prev) => prev + 1);
      // Увеличиваем streak
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(max => Math.max(max, newStreak));
        return newStreak;
      });
    } else {
      // Сбрасываем streak при ошибке
      setStreak(0);
      setIncorrectCount(prev => prev + 1);
    }

    // Отправляем ответ на сервер для статистики
    if (trainingSessionId) {
      try {
        await trainingApi.submitAnswer(trainingSessionId, "", correct);
      } catch (error) {
        console.error("Error submitting quiz answer:", error);
      }
    }

    // Авто-чтение обратной стороны (ответа) если включено в настройках
    if (trainingSettings.autoReadTTS && trainingSettings.playBack && cards[currentIndex]?.back) {
      await handleTTS(cards[currentIndex].back, cards[currentIndex].back_lang || "ru");
    } else {
      // Если TTS не включен, просто ждем 800ms
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    const nextIdx = currentIndex + 1;
    if (nextIdx >= cards.length) {
      setFinished(true);
      // Завершаем тренировку
      if (trainingSessionId) {
        trainingApi
          .completeSession(trainingSessionId)
          .then(() => {
            window.dispatchEvent(new Event("trainingCompleted"));
          })
          .catch((err) =>
            console.error("Error completing quiz session:", err),
          );
      }
    } else {
      setCurrentIndex(nextIdx);
      generateOptions(cards, nextIdx);
      setSelectedAnswer(null);
      setIsCorrect(null);
    }
    setIsAnswering(false);
  };

  const handleTTS = async (text, lang = "ru") => {
    if (!text?.trim()) return;
    setTtsLoading(true);

    // Останавливаем предыдущее воспроизведение
    stopTTS();

    return new Promise((resolve) => {
      textToSpeech(text, lang)
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
          const audio = new Audio(url);
          audioRef.current = audio;
          
          audio.onended = () => {
            setTtsPlaying(false);
            audioRef.current = null;
            resolve();
          };
          audio.onerror = () => {
            setTtsPlaying(false);
            audioRef.current = null;
            resolve();
          };
          setTtsPlaying(true);
          await audio.play();
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
  };

  const stopTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setTtsPlaying(false);
    setTtsLoading(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setIncorrectCount(0);
    setStreak(0);
    setMaxStreak(0);
    setFinished(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setIsAnswering(false);
    generateOptions(cards, 0);
  };

  if (loading) {
    return (
      <PageShell currentTheme={currentTheme}>
        <div className="training-loading">Загрузка квиза...</div>
      </PageShell>
    );
  }

  if (finished) {
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
      <PageShell currentTheme={currentTheme} showBackButton backTo="/card-sets" backText="Назад">
        <div className="quiz-container">
          <div className="quiz-complete-screen">
            <h1 className="quiz-complete-title">
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

            <div className="quiz-main-stat">
              <span className="quiz-big-score">{accuracy}%</span>
              <span className="quiz-big-label">точность ответов</span>
            </div>

            <div className="quiz-stats">
              <div className="quiz-stat-item">
                <span className="quiz-stat-value" style={{ color: "var(--nt-success)" }}>
                  {score}
                </span>
                <span className="quiz-stat-label">Правильно</span>
              </div>
              <div className="quiz-stat-item">
                <span className="quiz-stat-value" style={{ color: "var(--nt-error)" }}>
                  {incorrectCount}
                </span>
                <span className="quiz-stat-label">Ошибки</span>
              </div>
              <div className="quiz-stat-item">
                <span className="quiz-stat-value" style={{ color: "var(--nt-warning)" }}>
                  {maxStreak}x
                </span>
                <span className="quiz-stat-label">Макс. серия</span>
              </div>
              <div className="quiz-stat-item">
                <span className="quiz-stat-value" style={{ color: "var(--nt-purple)" }}>
                  {total}
                </span>
                <span className="quiz-stat-label">Всего вопросов</span>
              </div>
            </div>

            <div className="quiz-actions">
              <button
                onClick={() => navigate("/card-sets")}
                className="quiz-action-btn quiz-action-secondary"
              >
                К наборам
              </button>
              <button
                onClick={handleRestart}
                className="quiz-action-btn quiz-action-primary"
              >
                <FontAwesomeIcon icon={faRotateRight} style={{ marginRight: "6px" }} />
                Ещё раз
              </button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  const currentCard = cards[currentIndex];
  if (!currentCard) return null;

  const progress = total > 0 ? (currentIndex / total) * 100 : 0;

  return (
    <PageShell currentTheme={currentTheme}>
      {/* Заголовок страницы */}
      <div className="page-header-section" style={{ marginBottom: "24px" }}>
        <h1 className="page-title" style={{ color: currentTheme.text }}>
          <FontAwesomeIcon icon={faBullseye} style={{ marginRight: "8px", color: currentTheme.primary }} />
          Квиз
        </h1>
      </div>

      <div className="quiz-container">
        {/* Шапка */}
        <div className="quiz-header">
          <button onClick={() => navigate(-1)} className="quiz-back-btn">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>

          <div className="quiz-progress-info">
            <div className="quiz-progress-row">
              <FontAwesomeIcon
                icon={faLayerGroup}
                className="quiz-progress-icon"
              />
              <span className="quiz-progress-text">
                {currentIndex + 1} / {total}
              </span>
            </div>
            <div className="quiz-progress-bar">
              <div
                className="quiz-progress-fill"
                style={{
                  width: `${progress}%`,
                  background: currentTheme.primary,
                }}
              />
            </div>
          </div>

          <div className="quiz-header-right">
            {/* Streak counter */}
            {streak > 0 && (
              <div className={`quiz-streak-badge ${streak >= 5 ? 'quiz-streak-hot' : ''}`}
                style={{
                  background: streak >= 5 ? "linear-gradient(135deg, #f39c12, #e74c3c)" : `${currentTheme.primary}20`,
                  color: streak >= 5 ? "#fff" : currentTheme.primary,
                }}
              >
                <FontAwesomeIcon icon={faFire} style={{ marginRight: "4px" }} />
                {streak}
              </div>
            )}

            <KeyboardShortcutsModal
              isOpen={showKeyboardHint}
              onClose={() => setShowKeyboardHint(false)}
              currentTheme={currentTheme}
            />

            <button
              onClick={() => setShowKeyboardHint(true)}
              className="quiz-header-icon-btn"
              style={{
                background: showKeyboardHint ? currentTheme.primary : `${currentTheme.primary}15`,
                color: showKeyboardHint ? "#fff" : currentTheme.primary,
              }}
              title={showKeyboardHint ? "Скрыть подсказку" : "Показать подсказку"}
            >
              <FontAwesomeIcon icon={faKeyboard} />
            </button>

            <TrainingSettingsModal
              mode="quiz"
              currentTheme={currentTheme}
              trigger={
                <button
                  className="quiz-header-icon-btn"
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
          </div>
        </div>

        {/* Question card */}
        <div className="quiz-question-card">
          <div className="quiz-question-text">{currentCard.front}</div>
          
          {/* Media */}
          {currentCard.front_image && (
            <img
              src={mediaApi.getMediaUrl(currentCard.front_image)}
              alt=""
              className="quiz-card-image"
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
              className="quiz-card-video"
            />
          )}
          
          {/* TTS button */}
          <button
            onClick={() => handleTTS(currentCard.front, currentCard.front_lang || "ru")}
            disabled={ttsLoading}
            className="quiz-tts-btn"
            title="Озвучить вопрос"
          >
            <FontAwesomeIcon
              icon={ttsLoading ? faSpinner : faVolumeHigh}
              spin={ttsLoading}
            />
          </button>
        </div>

        {/* Options */}
        <div className="quiz-options">
          {options.map((option, index) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrectOption = option.id === currentCard.id;
            
            let optionClass = "quiz-option";
            if (isAnswering) {
              if (isCorrectOption) {
                optionClass += " quiz-option-correct";
              } else if (isSelected && !isCorrectOption) {
                optionClass += " quiz-option-incorrect";
              }
            }

            return (
              <button
                key={option.id}
                onClick={() => handleAnswer(option)}
                disabled={isAnswering}
                className={optionClass}
              >
                <span className="quiz-option-number">{index + 1}</span>
                <span className="quiz-option-text">{option.back}</span>
                
                {/* Media for option */}
                {option.back_image && (
                  <img
                    src={mediaApi.getMediaUrl(option.back_image)}
                    alt=""
                    className="quiz-option-image"
                  />
                )}
                {option.back_audio && (
                  <MiniAudioPlayer audioUrl={option.back_audio} currentTheme={currentTheme} compact />
                )}
                {option.back_video && (
                  <video
                    controls
                    preload="metadata"
                    src={mediaApi.getMediaUrl(option.back_video)}
                    className="quiz-option-video"
                  />
                )}
                
                {isAnswering && isCorrectOption && (
                  <FontAwesomeIcon icon={faCheck} className="quiz-option-icon quiz-option-icon-correct" />
                )}
                {isAnswering && isSelected && !isCorrectOption && (
                  <FontAwesomeIcon icon={faXmark} className="quiz-option-icon quiz-option-icon-incorrect" />
                )}
              </button>
            );
          })}
        </div>

        {/* Keyboard shortcuts hint */}
        {showKeyboardHint && (
          <div className="quiz-keyboard-hint">
            <p><strong>Горячие клавиши:</strong></p>
            <ul>
              <li><kbd>1-4</kbd> — выбрать вариант ответа</li>
              <li><kbd>Esc</kbd> — скрыть подсказку</li>
              <li><kbd>?</kbd> — показать/скрыть подсказку</li>
            </ul>
          </div>
        )}
      </div>
    </PageShell>
  );
}

// Стили перенесены в training.css
