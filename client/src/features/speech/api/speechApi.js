import axiosClient from "../../../shared/api/axiosClient";

/**
 * API для работы с речью и переводом
 * - STT (Speech-to-Text) - распознавание речи
 * - TTS (Text-to-Speech) - синтез речи
 * - Translation - перевод текста
 */

const API_BASE = "/api/speech";

// Базовый URL бэкенда (совпадает с тем, что использует axiosClient)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8081";

/**
 * Распознавание речи из аудиофайла (STT)
 * @param {File} audioFile - Аудиофайл (WAV/MP3)
 * @returns {Promise<{text: string, language: string}>}
 */
export const transcribeAudio = async (audioFile) => {
  const formData = new FormData();
  formData.append("file", audioFile);

  const response = await axiosClient.post(`${API_BASE}/transcribe`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * Перевод текста через Google Translate
 * @param {string} text - Текст для перевода
 * @param {string} targetLang - Целевой язык (например, 'en', 'ru', 'de')
 * @returns {Promise<{translated_text: string, source_lang: string, target_lang: string}>}
 */
export const translateText = async (text, targetLang = "en") => {
  const response = await axiosClient.post(`${API_BASE}/translate`, {
    text,
    target_lang: targetLang,
  });

  return response.data;
};

/**
 * Синтез речи из текста (TTS) - требует авторизации
 * @param {string} text - Текст для озвучки
 * @param {string} lang - Язык (например, 'ru', 'en')
 * @returns {Promise<{audio_url: string}>}
 */
export const textToSpeech = async (text, lang = "ru") => {
  // Детальное логирование перед отправкой
  console.log("[CLIENT TTS] Отправка запроса на синтез речи:");
  console.log("[CLIENT TTS]   - Язык (lang):", lang);
  console.log("[CLIENT TTS]   - Тип языка:", typeof lang);
  console.log("[CLIENT TTS]   - Длина текста:", text?.length);
  console.log("[CLIENT TTS]   - Текст (первые 100 символов):", text?.substring(0, 100));
  console.log("[CLIENT TTS]   - Текст (полный):", text);
  
  const response = await axiosClient.post(`${API_BASE}/speak`, {
    text,
    lang,
  });

  console.log("[CLIENT TTS] Получен ответ:", response.data);
  return response.data;
};

/**
 * Синтез речи из текста (TTS) для демо-режима - БЕЗ авторизации
 * Использует отдельный endpoint /speak-demo
 * @param {string} text - Текст для озвучки
 * @param {string} lang - Язык (например, 'ru', 'en')
 * @returns {Promise<{audio_url: string}>}
 */
export const textToSpeechDemo = async (text, lang = "ru") => {
  console.log("[CLIENT TTS-DEMO] Отправка запроса на синтез речи (демо):");
  console.log("[CLIENT TTS-DEMO]   - Язык (lang):", lang);
  console.log("[CLIENT TTS-DEMO]   - Длина текста:", text?.length);
  
  const response = await axiosClient.post(`${API_BASE}/speak-demo`, {
    text,
    lang,
  });

  console.log("[CLIENT TTS-DEMO] Получен ответ:", response.data);
  return response.data;
};

/**
 * Получение URL для аудиофайла TTS
 * @param {string} audioUrl - Относительный путь к аудио
 * @returns {string} Полный URL к аудиофайлу
 */
export const getTtsAudioUrl = (audioUrl) => {
  if (!audioUrl || audioUrl === "browser-synthesis") return "";
  // Бэкенд раздаёт файлы по /media напрямую (без /api префикса)
  return `${API_URL}/${audioUrl}`;
};

const speechApi = {
  transcribeAudio,
  translateText,
  textToSpeech,
  getTtsAudioUrl,
};

export default speechApi;
