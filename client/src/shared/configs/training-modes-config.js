// Все режимы тренировок в одном конфигурационном файле
export const TRAINING_MODES_CONFIG = {
  practice: {
    id: "practice",
    nameKey: "training.mode.practice",
    icon: "🔄",
    minCards: 1,
    descriptionKey: "training.mode.practice.description",
  },
  quiz: {
    id: "quiz",
    nameKey: "training.mode.quiz",
    icon: "🎯",
    minCards: 4,
    descriptionKey: "training.mode.quiz.description",
  },
  sprint: {
    id: "sprint",
    nameKey: "training.mode.sprint",
    icon: "⚡",
    minCards: 1,
    descriptionKey: "training.mode.sprint.description",
    timeLimit: 60,
    pointsPerCorrect: 10,
  },
  memory: {
    id: "memory",
    nameKey: "training.mode.memory",
    icon: "🧠",
    minCards: 6,
    descriptionKey: "training.mode.memory.description",
    maxCards: 12,
    timeLimit: 180,
  },
  wave: {
    id: "wave",
    nameKey: "training.mode.wave",
    icon: "🌊",
    minCards: 8,
    descriptionKey: "training.mode.wave.description",
    waves: 3,
    timePerWave: 30,
    cardsPerWaveIncrease: 2,
  },
  exam: {
    id: "exam",
    nameKey: "training.mode.exam",
    icon: "🎓",
    minCards: 5,
    descriptionKey: "training.mode.exam.description",
    passingScore: 75,
    timePerCard: 30,
    showResults: false,
  },
  ai: {
    id: "ai",
    nameKey: "training.mode.ai",
    icon: "🤖",
    minCards: 10,
    descriptionKey: "training.mode.ai.description",
    focusAreas: ["weakest", "new", "review"],
    adaptive: true,
  },
  tournament: {
    id: "tournament",
    nameKey: "training.mode.tournament",
    icon: "🏆",
    minCards: 15,
    descriptionKey: "training.mode.tournament.description",
    levels: 5,
    qualifyingScore: 80,
    timeBonus: true,
  },
  carousel: {
    id: "carousel",
    nameKey: "training.mode.carousel",
    icon: "🎠",
    minCards: 12,
    descriptionKey: "training.mode.carousel.description",
    modesIncluded: ["practice", "quiz", "sprint", "memory"],
    cardsPerMode: 3,
    transitionTime: 3,
  },
  countdown: {
    id: "countdown",
    nameKey: "training.mode.countdown",
    icon: "⏳",
    minCards: 10,
    descriptionKey: "training.mode.countdown.description",
    startTime: 60,
    minTime: 5,
    timeDecrease: 5,
    timeBonus: 2,
  },
  audio: {
    id: "audio",
    nameKey: "training.mode.audio",
    icon: "🎵",
    minCards: 1,
    descriptionKey: "training.mode.audio.description",
    requireAudio: true,
    playbackLimit: 3,
    showTextAfter: false,
  },
  mixer: {
    id: "mixer",
    nameKey: "training.mode.mixer",
    icon: "🔀",
    minCards: 10,
    descriptionKey: "training.mode.mixer.description",
    maxSets: 3,
    shuffleMode: "random",
    showSetInfo: true,
  },
};

// Хелпер для получения режима по ID
export const getModeById = (modeId) => TRAINING_MODES_CONFIG[modeId];

// Хелпер для проверки существования режима
export const modeExists = (modeId) => modeId in TRAINING_MODES_CONFIG;

// Хелпер для получения всех режимов как массив
export const getAllModes = () => Object.values(TRAINING_MODES_CONFIG);

// Хелпер для фильтрации по минимальному количеству карточек
export const getAvailableModesForCardsCount = (cardsCount) => {
  return getAllModes().filter((mode) => mode.minCards <= cardsCount);
};
