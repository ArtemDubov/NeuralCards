const STORAGE_KEY = "training_settings";

const DEFAULT_SETTINGS = {
  autoReadTTS: false,
  autoPlayAnswer: false,
  flipAnimation: true,
  swipeAnimation: true,
  playFront: true,
  playBack: true,
  shuffleCards: false, // Новая настройка для перемешивания карточек
};

export function loadTrainingSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
      : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveTrainingSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

export { DEFAULT_SETTINGS };
