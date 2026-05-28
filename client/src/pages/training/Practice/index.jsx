import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext";
import { loadTrainingSettings } from "../../../components/common/TrainingSettings";
import KeyboardShortcutsModal from "../../../components/common/KeyboardShortcutsModal";
import PageShell from "../../../components/layout/PageShell";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen } from "../../../utils/icons";

// Стили
import "../../../styles/design-system/pages/training/practice.css";

// Хуки
import { useTTS } from "./hooks/useTTS";
import { usePracticeCards } from "./hooks/usePracticeCards";
import { useVisualCards } from "./hooks/useVisualCards";
import { useSwipe } from "./hooks/useSwipe";

// Компоненты
import PracticeCard from "./components/PracticeCard";
import PracticeHeader from "./components/PracticeHeader";
import PracticeFinish from "./components/PracticeFinish";

/**
 * Главный компонент страницы практики
 * Объединяет все модули и управляет состоянием
 */
export default function PracticePage() {
  const { setId } = useParams();
  const { currentTheme } = useTheme();

  // Настройки тренировки из localStorage - реактивные
  const [trainingSettings, setTrainingSettings] = useState(
    loadTrainingSettings(),
  );

  // Флаг отображения подсказок клавиатуры
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);

  // Отслеживание уже озвученных сторон карточек
  const [playedSides, setPlayedSides] = useState(new Set());

  // Обновляем настройки при изменении в модалке
  useEffect(() => {
    const handleStorageChange = () => {
      console.log("🔄 Настройки тренировки изменены:", loadTrainingSettings());
      setTrainingSettings(loadTrainingSettings());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("trainingSettingsChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "trainingSettingsChanged",
        handleStorageChange,
      );
    };
  });

  // Хук для TTS
  const {
    ttsLoading,
    isTtsPlaying,
    handleTTS,
    stopTTS,
    cleanup: cleanupTTS,
  } = useTTS();

  // Хук для управления карточками
  const {
    cards,
    queue,
    setQueue,
    knewCount,
    didntKnowCount,
    loading,
    finished,
    loadCards,
    handleAnswer,
    handleRestart: restartCards,
    setFinished,
    setKnewCount,
    setDidntKnowCount,
  } = usePracticeCards(setId, trainingSettings);

  // Хук для визуальных карточек
  const {
    visualCards,
    setVisualCards,
    isAnimating,
    setIsAnimating,
    dragOffset,
    isDragging,
    setIsDragging,
    initFirstCard,
    handleFlip: flipCard,
    addNewCard,
    removeCard,
    updateDragState,
  } = useVisualCards();

  // Хук для свайпов
  const SWIPE_THRESHOLD = 60;
  const MAX_DRAG = 150;
  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp: swipePointerUp,
  } = useSwipe(SWIPE_THRESHOLD, MAX_DRAG);

  // Загрузка карточек при монтировании
  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Очистка TTS при размонтировании
  useEffect(() => {
    return () => {
      cleanupTTS();
    };
  }, [cleanupTTS]);

  // Инициализация первой карточки после загрузки
  useEffect(() => {
    if (cards.length > 0 && visualCards.length === 0) {
      initFirstCard(queue[0]);

      // Авто-чтение первой карточки (лицевая сторона) при загрузке
      if (trainingSettings.autoReadTTS && cards.length > 0) {
        const firstCard = cards[0];
        if (firstCard?.front) {
          console.log(
            "⚠️ Авто-чтение отложено до первого взаимодействия пользователя",
          );
          setPlayedSides((prev) => new Set([...prev, `${firstCard.id}_front`]));
        }
      }
    }
  }, [
    cards.length,
    visualCards.length,
    queue,
    initFirstCard,
    trainingSettings.autoReadTTS,
  ]);

  // Обработка клавиатурных сокращений
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      const currentCard = visualCards[visualCards.length - 1];
      if (finished || !currentCard) return;

      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          if (!currentCard.isFlipped) {
            handleFlip();
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (currentCard.isFlipped && !isAnimating) {
            handleSwipeAction("right");
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (currentCard.isFlipped && !isAnimating) {
            handleSwipeAction("left");
          }
          break;
        case "Escape":
          e.preventDefault();
          setShowKeyboardHint(false);
          break;
        case "?":
          e.preventDefault();
          setShowKeyboardHint((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [finished, visualCards, isAnimating]);

  // Авто-чтение первой карточки при загрузке
  useEffect(() => {
    if (
      cards.length > 0 &&
      visualCards.length > 0 &&
      trainingSettings.autoReadTTS &&
      trainingSettings.playFront
    ) {
      const firstCard = cards[0];
      const sideKey = `${firstCard.id}_front`;

      if (!playedSides.has(sideKey) && firstCard?.front) {
        console.log("🔊 Авто-чтение первой карточки FRONT при загрузке");
        setPlayedSides((prev) => new Set([...prev, sideKey]));

        setTimeout(() => {
          handleTTS(firstCard.front, firstCard.front_lang || "ru", true);
        }, 500);
      }
    }
  }, [
    cards.length,
    visualCards.length,
    trainingSettings.autoReadTTS,
    trainingSettings.playFront,
    handleTTS,
  ]);

  const currentVisualCard = visualCards[visualCards.length - 1];
  const currentCard = cards.find((c) => c.id === currentVisualCard?.cardId);
  const totalCards = cards.length || 0;
  const remaining = queue.length;
  const answered = knewCount || 0;
  // Исправление бага №13: добавлена проверка на None (null/undefined) для totalCards и answered
  const progress =
    totalCards > 0 ? Math.min(((answered || 0) / totalCards) * 100, 100) : 0;

  // Обработчик переворота карточки
  const handleFlip = useCallback(() => {
    flipCard(
      trainingSettings,
      cards,
      playedSides,
      setPlayedSides,
      handleTTS,
      stopTTS,
    );
  }, [trainingSettings, cards, playedSides, handleTTS, stopTTS]);

  // Обработчик свайпа
  const handleSwipeAction = useCallback(
    async (direction) => {
      if (isAnimating || !currentVisualCard) return;
      setIsAnimating(true);

      const exitingCardId = currentVisualCard.id;
      const exitingCardCardId = currentVisualCard.cardId;
      const knew = direction === "right";

      // Обрабатываем ответ
      const newQueue = await handleAnswer(exitingCardCardId, knew);

      const exitOffset = direction === "right" ? 500 : -500;
      updateDragState(exitOffset, direction);

      setTimeout(
        () => {
          removeCard(exitingCardId);

          if (newQueue.length === 0) {
            setFinished(true);
          } else {
            addNewCard(newQueue[0]);
            setQueue(newQueue);

            // Авто-чтение лицевой стороны новой карточки
            if (trainingSettings.autoReadTTS) {
              const newCard = cards.find((c) => c.id === newQueue[0]);
              if (newCard?.front) {
                const sideKey = `${newCard.id}_front`;
                if (!playedSides.has(sideKey)) {
                  setTimeout(() => {
                    console.log(
                      "🔄 Авто-чтение новой карточки FRONT после свайпа",
                    );
                    setPlayedSides((prev) => new Set([...prev, sideKey]));
                    handleTTS(newCard.front, newCard.front_lang || "es", true);
                  }, 800);
                }
              }
            }
          }

          updateDragState(0);
          setIsAnimating(false);

          // Останавливаем TTS при переходе к следующей карточке
          stopTTS();
        },
        trainingSettings.swipeAnimation ? 300 : 0,
      );
    },
    [
      isAnimating,
      currentVisualCard,
      handleAnswer,
      updateDragState,
      removeCard,
      addNewCard,
      setQueue,
      trainingSettings.autoReadTTS,
      trainingSettings.swipeAnimation,
      cards,
      playedSides,
      handleTTS,
      stopTTS,
    ],
  );

  // Обработчики свайпов
  const onPointerDown = (e) => {
    if (finished || isAnimating || !currentVisualCard) return;
    handlePointerDown(e, setIsDragging, () => {});
  };

  const onPointerMove = (e) => {
    handlePointerMove(
      e,
      isDragging,
      (offset) => updateDragState(offset),
      updateDragState,
    );
  };

  const onPointerUp = () => {
    swipePointerUp(
      isDragging,
      dragOffset,
      currentVisualCard,
      handleFlip,
      handleSwipeAction,
      setIsDragging,
      updateDragState,
    );
  };

  // Перезапуск практики
  const handleRestart = () => {
    stopTTS();
    const firstCardId = restartCards();
    setPlayedSides(new Set());
    updateDragState(0);
    setIsAnimating(false);
    initFirstCard(firstCardId);
  };

  // Загрузка
  if (loading) {
    return (
      <PageShell currentTheme={currentTheme}>
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: currentTheme.text,
          }}
        >
          Загрузка практики...
        </div>
      </PageShell>
    );
  }

  // Завершение
  if (finished) {
    return (
      <PageShell currentTheme={currentTheme}>
        <PracticeFinish
          currentTheme={currentTheme}
          knewCount={knewCount}
          didntKnowCount={didntKnowCount}
          handleRestart={handleRestart}
        />
      </PageShell>
    );
  }

  if (!currentCard || !currentVisualCard) return null;

  return (
    <PageShell currentTheme={currentTheme}>
      {/* Заголовок страницы */}
      <div className="page-header-section" style={{ marginBottom: "24px" }}>
        <h1 className="page-title" style={{ color: currentTheme.text }}>
          <FontAwesomeIcon
            icon={faBookOpen}
            style={{ marginRight: "8px", color: currentTheme.primary }}
          />
          Практика
        </h1>
      </div>

      <div className="practice-container">
        {/* Шапка */}
        <PracticeHeader
          currentTheme={currentTheme}
          knewCount={knewCount}
          didntKnowCount={didntKnowCount}
          answered={answered}
          totalCards={totalCards}
          progress={progress}
          showKeyboardHint={showKeyboardHint}
          setShowKeyboardHint={setShowKeyboardHint}
          ttsLoading={ttsLoading}
          isTtsPlaying={isTtsPlaying}
          currentVisualCard={currentVisualCard}
          currentCard={currentCard}
          handleTTS={handleTTS}
          trainingSettings={trainingSettings}
        />

        {/* Область карточки */}
        <div
          className="practice-card-area"
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
          onMouseDown={onPointerDown}
          onMouseMove={isDragging ? onPointerMove : undefined}
          onMouseUp={onPointerUp}
          onMouseLeave={isDragging ? onPointerUp : undefined}
        >
          {visualCards.map((vc, index) => {
            const card = cards.find((c) => c.id === vc.cardId);
            const isTop = index === visualCards.length - 1;

            return (
              <PracticeCard
                key={vc.id}
                vc={vc}
                card={card}
                isTop={isTop}
                isDragging={isDragging}
                trainingSettings={trainingSettings}
              />
            );
          })}
        </div>

        {/* Кнопки действий */}
        <div className="practice-buttons-row">
          <button
            onClick={() => handleSwipeAction("left")}
            disabled={isAnimating}
            className="practice-btn practice-btn-didnt-know"
            style={{ opacity: isAnimating ? 0.5 : 1 }}
          >
            Не помню
          </button>
          <button
            onClick={() => handleSwipeAction("right")}
            disabled={isAnimating}
            className="practice-btn practice-btn-knew"
            style={{ opacity: isAnimating ? 0.5 : 1 }}
          >
            Помню
          </button>
        </div>

        {/* Keyboard shortcuts hint */}
        {showKeyboardHint && (
          <div className="practice-keyboard-hint">
            <p>
              <strong>Горячие клавиши:</strong>
            </p>
            <ul>
              <li>
                <kbd>Space</kbd> или <kbd>Enter</kbd> — перевернуть карточку
              </li>
              <li>
                <kbd>←</kbd> или <kbd>1</kbd> — не помню
              </li>
              <li>
                <kbd>→</kbd> или <kbd>2</kbd> — помню
              </li>
              <li>
                <kbd>T</kbd> — озвучить текст
              </li>
              <li>
                <kbd>Esc</kbd> — скрыть подсказку
              </li>
              <li>
                <kbd>?</kbd> — показать/скрыть подсказку
              </li>
            </ul>
          </div>
        )}
      </div>
    </PageShell>
  );
}
