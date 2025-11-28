import { useState, useCallback, useRef } from "react";
import apiClient from "../api-client";

// 🎯 Базовый класс тренировки для наследования
class TrainingEngine {
  constructor(set, onUpdate, onComplete) {
    this.set = set;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.state = {};
  }

  // Методы, которые должны быть реализованы в дочерних классах
  start() {
    throw new Error('Method "start" must be implemented');
  }

  handleAnswer(answer) {
    throw new Error('Method "handleAnswer" must be implemented');
  }

  getProgress() {
    throw new Error('Method "getProgress" must be implemented');
  }
}

// 🎯 Режим "Практика" (интервальные повторения)
class PracticeEngine extends TrainingEngine {
  constructor(set, onUpdate, onComplete) {
    super(set, onUpdate, onComplete);
    this.state = {
      currentCard: null,
      dueCards: [],
      completedCards: [],
      showAnswer: false,
    };
  }

  async start() {
    // Здесь будет логика загрузки карточек для повторения
    // Временная заглушка
    const mockCard = this.set.cards?.[0] || null;
    this.state.currentCard = mockCard;
    this.onUpdate({ ...this.state });
  }

  async handleAnswer(difficulty, isCorrect) {
    // Логика обработки ответа и планирования следующего повторения
    this.state.completedCards.push(this.state.currentCard);

    if (this.state.dueCards.length > 0) {
      this.state.currentCard = this.state.dueCards.shift();
      this.state.showAnswer = false;
    } else {
      this.onComplete();
    }

    this.onUpdate({ ...this.state });
  }

  getProgress() {
    const total = this.set.cards?.length || 0;
    const completed = this.state.completedCards.length;
    return { completed, total };
  }
}

// 🎯 Режим "Викторина"
class QuizEngine extends TrainingEngine {
  constructor(set, onUpdate, onComplete) {
    super(set, onUpdate, onComplete);
    this.state = {
      currentQuestion: 0,
      score: 0,
      questions: [],
      selectedAnswer: null,
      showResult: false,
    };
  }

  async start() {
    const questions = this.generateQuestions();
    this.state.questions = questions;
    this.onUpdate({ ...this.state });
  }

  generateQuestions() {
    if (!this.set.cards) return [];

    return this.set.cards.map((card, index) => {
      const wrongAnswers = this.set.cards
        .filter((_, i) => i !== index)
        .map((card) => card.back)
        .slice(0, 3);

      while (wrongAnswers.length < 3) {
        wrongAnswers.push("Нет варианта");
      }

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
  }

  handleAnswer(selectedIndex) {
    const currentQ = this.state.questions[this.state.currentQuestion];
    this.state.selectedAnswer = selectedIndex;
    this.state.showResult = true;

    if (selectedIndex === currentQ.correctIndex) {
      this.state.score++;
    }

    this.onUpdate({ ...this.state });

    // Автопереход к следующему вопросу
    setTimeout(() => {
      if (this.state.currentQuestion < this.state.questions.length - 1) {
        this.state.currentQuestion++;
        this.state.selectedAnswer = null;
        this.state.showResult = false;
        this.onUpdate({ ...this.state });
      } else {
        this.onComplete();
      }
    }, 2000);
  }

  getProgress() {
    return {
      completed: this.state.currentQuestion,
      total: this.state.questions.length,
      score: this.state.score,
    };
  }
}

// 🎯 Режим "Спринт" (быстрые ответы на время)
class SprintEngine extends TrainingEngine {
  constructor(set, onUpdate, onComplete) {
    super(set, onUpdate, onComplete);
    this.state = {
      currentCard: 0,
      score: 0,
      timeLeft: 60, // 60 секунд
      correctAnswers: 0,
    };
    this.timer = null;
  }

  async start() {
    this.startTimer();
    this.onUpdate({ ...this.state });
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.state.timeLeft--;

      if (this.state.timeLeft <= 0) {
        clearInterval(this.timer);
        this.onComplete();
      }

      this.onUpdate({ ...this.state });
    }, 1000);
  }

  handleAnswer(isCorrect) {
    if (isCorrect) {
      this.state.score += 10;
      this.state.correctAnswers++;
    }

    this.state.currentCard++;

    if (this.state.currentCard >= (this.set.cards?.length || 0)) {
      this.state.currentCard = 0; // Начинаем заново
    }

    this.onUpdate({ ...this.state });
  }

  getProgress() {
    return {
      score: this.state.score,
      timeLeft: this.state.timeLeft,
      correctAnswers: this.state.correctAnswers,
    };
  }

  cleanup() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}

// 🎯 Реестр всех режимов тренировок
const TRAINING_MODES = {
  practice: {
    id: "practice",
    name: "Практика",
    description: "Интервальные повторения для эффективного запоминания",
    icon: "🔄",
    engine: PracticeEngine,
    minCards: 1,
  },
  quiz: {
    id: "quiz",
    name: "Викторина",
    description: "Выберите правильный ответ из нескольких вариантов",
    icon: "🎯",
    engine: QuizEngine,
    minCards: 4,
  },
  sprint: {
    id: "sprint",
    name: "Спринт",
    description: "Быстрые ответы на время",
    icon: "⚡",
    engine: SprintEngine,
    minCards: 1,
  },
  // 🎯 ДОБАВЛЯЕМ НОВЫЕ РЕЖИМЫ ЗДЕСЬ!
};

export const useTraining = () => {
  const [state, setState] = useState({
    isTraining: false,
    engineState: {},
    loading: false,
    error: null,
  });

  const currentEngineRef = useRef(null);

  // 🎯 Получить информацию о всех режимах
  const getTrainingModes = useCallback(() => {
    return Object.values(TRAINING_MODES);
  }, []);

  // 🎯 Получить информацию о конкретном режиме
  const getTrainingMode = useCallback((modeId) => {
    return TRAINING_MODES[modeId];
  }, []);

  // 🎯 Начать тренировку
  const startTraining = useCallback((modeId, set) => {
    const mode = TRAINING_MODES[modeId];
    if (!mode) {
      setState((prev) => ({ ...prev, error: "Режим тренировки не найден" }));
      return false;
    }

    // Проверка минимального количества карточек
    if (set.cards?.length < mode.minCards) {
      setState((prev) => ({
        ...prev,
        error: `Для этого режима нужно минимум ${mode.minCards} карточек`,
      }));
      return false;
    }

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const engine = new mode.engine(
        set,
        (engineState) => {
          setState((prev) => ({
            ...prev,
            engineState: { ...engineState },
          }));
        },
        () => {
          setState((prev) => ({
            ...prev,
            isTraining: false,
          }));
        }
      );

      currentEngineRef.current = engine;
      engine.start();

      setState((prev) => ({
        ...prev,
        isTraining: true,
        loading: false,
        engineState: {},
      }));

      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      return false;
    }
  }, []);

  // 🎯 Отправить ответ
  const submitAnswer = useCallback((...args) => {
    if (currentEngineRef.current) {
      currentEngineRef.current.handleAnswer(...args);
    }
  }, []);

  // 🎯 Получить прогресс
  const getProgress = useCallback(() => {
    if (currentEngineRef.current) {
      return currentEngineRef.current.getProgress();
    }
    return null;
  }, []);

  // 🎯 Завершить тренировку
  const endTraining = useCallback(() => {
    if (currentEngineRef.current) {
      if (currentEngineRef.current.cleanup) {
        currentEngineRef.current.cleanup();
      }
      currentEngineRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isTraining: false,
      engineState: {},
    }));
  }, []);

  // 🎯 Очистка при размонтировании
  const cleanup = useCallback(() => {
    if (currentEngineRef.current?.cleanup) {
      currentEngineRef.current.cleanup();
    }
  }, []);

  return {
    // Состояние
    ...state,

    // Методы
    getTrainingModes,
    getTrainingMode,
    startTraining,
    submitAnswer,
    getProgress,
    endTraining,
    cleanup,
  };
};
