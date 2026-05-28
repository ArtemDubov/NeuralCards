import { useState, useCallback, useRef } from 'react';
import { textToSpeech, getTtsAudioUrl } from '../../../../features/speech/api/speechApi';

/**
 * Хук для управления Text-to-Speech (TTS)
 * Управляет воспроизведением аудио, остановкой и состоянием загрузки
 */
export function useTTS() {
  const [ttsLoading, setTtsLoading] = useState(false);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const currentAudioRef = useRef(null);

  // Функция для принудительной остановки текущего TTS
  const stopTTS = useCallback(() => {
    console.log("🛑 Остановка TTS");
    
    // Останавливаем Audio
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = "";
        currentAudioRef.current.load();
      } catch (err) {
        console.warn("⚠️ Ошибка при остановке Audio:", err.message);
      }
      currentAudioRef.current = null;
    }
    
    // Очищаем SpeechSynthesis
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        console.log("✅ SpeechSynthesis очищен");
      } catch (err) {
        console.warn("⚠️ Ошибка при очистке SpeechSynthesis:", err.message);
      }
    }
    
    setIsTtsPlaying(false);
  }, []);

  // Функция воспроизведения текста
  const handleTTS = useCallback(async (text, lang = "ru", autoPlay = false) => {
    if (!text?.trim()) return;
    
    // Сначала останавливаем предыдущее воспроизведение
    stopTTS();
    
    // Дополнительная защита: очищаем очередь SpeechSynthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      console.log("🧹 Очередь SpeechSynthesis очищена перед новым воспроизведением");
    }
    
    console.log("========== TTS ВЫЗОВ ==========");
    console.log("1. Входные параметры:", { 
      lang, 
      langType: typeof lang,
      autoPlay,
      textLength: text.length,
      textPreview: text.substring(0, 50) 
    });
    
    setTtsLoading(true);

    return new Promise((resolve) => {
      textToSpeech(text, lang)
        .then(async (result) => {
          console.log("3. Ответ от TTS API:", result);
          console.log("4. audio_url:", result.audio_url);

          // ИСПОЛЬЗУЕМ ТОЛЬКО СЕРВЕРНЫЙ TTS - никаких fallback'ов на browser-synthesis
          if (result.audio_url === "browser-synthesis") {
            console.warn("⚠️ Сервер вернул browser-synthesis, но мы его НЕ используем");
            setTtsLoading(false);
            setIsTtsPlaying(false);
            resolve();
            return;
          }

          // Используем аудио файл с сервера
          const url = getTtsAudioUrl(result.audio_url);
          console.log("5. Audio URL:", url);
          
          if (!url || url === "") {
            console.error("❌ Пустой URL!");
            setTtsLoading(false);
            resolve();
            return;
          }
          
          const audio = new Audio();
          currentAudioRef.current = audio;
          
          // Устанавливаем обработчики ДО установки src
          audio.onended = () => {
            console.log("7. Audio воспроизведение завершено");
            currentAudioRef.current = null;
            setIsTtsPlaying(false);
            setTtsLoading(false);
            resolve();
          };
          
          audio.onerror = (err) => {
            console.error("8. Audio error:", err);
            currentAudioRef.current = null;
            setIsTtsPlaying(false);
            setTtsLoading(false);
            resolve();
          };
          
          setIsTtsPlaying(true);
          
          // Устанавливаем src и загружаем
          audio.src = url;
          audio.load();
          
          // Для авто-воспроизведения ловим ошибку autoplay
          if (autoPlay) {
            setTimeout(async () => {
              try {
                await audio.play();
                console.log("14. Autoplay успешен");
                setTtsLoading(false);
              } catch (err) {
                console.warn("14. Autoplay заблокирован:", err.message);
                
                if (err.name === 'NotAllowedError' || err.message.includes("user didn't interact")) {
                  console.log("15. ⚠️ Браузер блокирует автовоспроизведение");
                  
                  currentAudioRef.current = null;
                  setIsTtsPlaying(false);
                  setTtsLoading(false);
                  resolve();
                  return;
                }
                
                currentAudioRef.current = null;
                setIsTtsPlaying(false);
                setTtsLoading(false);
                resolve();
              }
            }, 200);
          } else {
            // Ручное воспроизведение по кнопке
            setTtsLoading(false);
            resolve();
          }
        })
        .catch((error) => {
          console.error("Ошибка TTS:", error);
          setTtsLoading(false);
          setIsTtsPlaying(false);
          resolve();
        });
    });
  }, [stopTTS]);

  // Очистка при размонтировании
  const cleanup = useCallback(() => {
    console.log("🧹 Очистка TTS при размонтировании");
    
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = "";
      } catch (err) {
        // Игнорируем ошибки при cleanup
      }
      currentAudioRef.current = null;
    }
    
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        // Игнорируем ошибки при cleanup
      }
    }
    
    console.log("✅ TTS полностью очищен при размонтировании");
  }, []);

  return {
    ttsLoading,
    isTtsPlaying,
    handleTTS,
    stopTTS,
    cleanup
  };
}
