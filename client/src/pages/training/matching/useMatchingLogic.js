import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "../../../contexts/ToastContext";
import { trainingApi } from "../../../features/training/api/trainingApi";
import { loadTrainingSettings } from "../../../components/common/TrainingSettings";
import { textToSpeech, getTtsAudioUrl } from "../../../features/speech/api/speechApi";

/**
 * Custom hook for matching game logic.
 * Handles card loading, batch management, connections, and TTS.
 */
export function useMatchingLogic(setId, navigate) {
  const toast = useToast();
  const audioRef = useRef(null);

  // States
  const [allCards, setAllCards] = useState([]);
  const [currentBatch, setCurrentBatch] = useState([]);
  const [batchIndex, setBatchIndex] = useState(0);
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalBatches, setTotalBatches] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [trainingSettings, setTrainingSettings] = useState(loadTrainingSettings());

  // Update settings on change
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
  }, []);

  // Load batch into left/right columns
  const loadBatch = useCallback((batch) => {
    setCurrentBatch(batch);
    
    const left = batch.map((c) => ({
      id: c.id,
      text: c.front,
      lang: c.front_lang || "ru",
      image: c.front_image,
      audio: c.front_audio,
      video: c.front_video,
    }));
    setLeftItems(left);

    const right = [...batch]
      .sort(() => Math.random() - 0.5)
      .map((c) => ({
        id: c.id,
        text: c.back,
        lang: c.back_lang || "es",
        image: c.back_image,
        audio: c.back_audio,
        video: c.back_video,
      }));
    setRightItems(right);
    
    setConnections([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setFeedback({});
  }, []);

  // Load cards from API
  const loadCards = useCallback(async () => {
    try {
      try {
        const sessionResponse = await trainingApi.createMatchingSession(
          parseInt(setId),
        );
        setSessionId(sessionResponse.data.id);
      } catch (sessionError) {
        console.warn("Could not create matching session:", sessionError);
      }

      const response = await trainingApi.createPracticeSession(setId);
      let cardsData = response.data.cards;
      if (!cardsData || cardsData.length < 2) {
        navigate(-1);
        return;
      }
      
      if (trainingSettings.shuffleCards) {
        cardsData = [...cardsData].sort(() => Math.random() - 0.5);
      }

      setAllCards(cardsData);
      
      const batchSize = 5;
      const batches = [];
      for (let i = 0; i < cardsData.length; i += batchSize) {
        batches.push(cardsData.slice(i, i + batchSize));
      }
      
      setTotalBatches(batches.length);
      setBatchIndex(0);
      loadBatch(batches[0]);
    } catch (error) {
      console.error("Error loading matching:", error);
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      if (status === 404) {
        toast.error(`Эндпоинт не найден (404). ${detail || error.message}`);
      } else if (status === 401) {
        toast.error("Сессия истекла. Войдите заново.");
        navigate("/auth/login");
      } else {
        toast.error(`Ошибка загрузки: ${detail || error.message}`);
      }
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [setId, navigate, loadBatch, trainingSettings.shuffleCards, toast]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // TTS functions
  const stopTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setTtsPlaying(false);
    setTtsLoading(false);
  };

  const handleTTS = async (text, lang = "ru") => {
    if (!text?.trim()) return;
    
    stopTTS();
    setTtsLoading(true);

    return new Promise((resolve) => {
      textToSpeech(text, lang)
        .then(async (result) => {
          if (result.audio_url === "browser-synthesis") {
            setTtsPlaying(true);
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

  // Connection handlers
  const handleLeftClick = (leftId) => {
    if (feedback[leftId] || isSubmitting) return;

    const alreadyConnected = connections.find((c) => c.leftId === leftId);
    if (alreadyConnected) return;

    if (selectedLeft === leftId) {
      setSelectedLeft(null);
      return;
    }

    setSelectedLeft(leftId);

    if (selectedRight !== null) {
      tryConnect(leftId, selectedRight);
    }
  };

  const handleRightClick = (rightId) => {
    if (isSubmitting) return;

    const alreadyConnected = connections.find((c) => c.rightId === rightId);
    if (alreadyConnected) return;

    if (selectedRight === rightId) {
      setSelectedRight(null);
      return;
    }

    setSelectedRight(rightId);

    if (selectedLeft !== null) {
      tryConnect(selectedLeft, rightId);
    }
  };

  const tryConnect = (leftId, rightId) => {
    const correctMatch = leftId === rightId;

    const existingConn = connections.find((c) => c.leftId === leftId);
    if (existingConn) {
      setConnections((prev) => prev.filter((c) => c.leftId !== leftId));
      setFeedback((prev) => {
        const next = { ...prev };
        delete next[existingConn.leftId];
        return next;
      });
    }

    setConnections((prev) => [...prev, { leftId, rightId }]);

    if (correctMatch) {
      // Правильное совпадение - зелёный цвет на обеих карточках
      setFeedback((prev) => ({ 
        ...prev, 
        [leftId]: "correct",
        [`right_${rightId}`]: "correct"
      }));
      setCorrectCount((prev) => prev + 1);
    } else {
      // Неправильное совпадение - красный цвет на обеих карточках
      setFeedback((prev) => ({ 
        ...prev, 
        [leftId]: "incorrect",
        [`right_${rightId}`]: "incorrect"
      }));
      setIncorrectCount((prev) => prev + 1);
    }

    setSelectedLeft(null);
    setSelectedRight(null);

    setTimeout(() => {
      setFeedback((prev) => {
        const next = { ...prev };
        delete next[leftId];
        delete next[`right_${rightId}`];
        return next;
      });
    }, 1000);
  };

  // Check if batch is complete
  useEffect(() => {
    const connectedCount = connections.length;
    const totalPairs = leftItems.length;

    if (connectedCount === totalPairs && totalPairs > 0 && !isSubmitting) {
      setIsSubmitting(true);

      const matches = connections.map((c) => ({
        card_id: c.leftId,
        matched_id: c.rightId,
      }));

      const submitAndProceed = () => {
        if (sessionId) {
          trainingApi
            .submitMatchingAnswer(sessionId, matches)
            .catch((err) => {
              console.error("Error submitting matching answers:", err);
            });
        }

        setTimeout(() => {
          if (batchIndex < totalBatches - 1) {
            const nextIndex = batchIndex + 1;
            setBatchIndex(nextIndex);
            loadBatch(allCards.slice(nextIndex * 5, nextIndex * 5 + 5));
            setIsSubmitting(false);
          } else {
            if (sessionId) {
              trainingApi
                .completeDictation(sessionId)
                .then(() => {
                  window.dispatchEvent(new Event("trainingCompleted"));
                })
                .catch((err) => {
                  console.error("Error completing session:", err);
                });
            }
            setFinished(true);
            setIsSubmitting(false);
          }
        }, 800);
      };

      submitAndProceed();
    }
  }, [connections.length, leftItems.length, isSubmitting, sessionId, connections, batchIndex, totalBatches, allCards, loadBatch]);

  const getConnectedRightId = (leftId) => {
    const conn = connections.find((c) => c.leftId === leftId);
    return conn ? conn.rightId : null;
  };

  const progress = leftItems.length > 0 ? (connections.length / leftItems.length) * 100 : 0;

  return {
    // State
    loading,
    finished,
    leftItems,
    rightItems,
    connections,
    selectedLeft,
    selectedRight,
    feedback,
    correctCount,
    incorrectCount,
    isSubmitting,
    batchIndex,
    totalBatches,
    progress,
    ttsLoading,
    ttsPlaying,
    trainingSettings,
    
    // Handlers
    handleLeftClick,
    handleRightClick,
    handleTTS,
    getConnectedRightId,
    stopTTS,
  };
}
