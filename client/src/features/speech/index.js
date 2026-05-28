// Speech & Translation components
export { default as AudioRecorder } from "./components/AudioRecorder";
export { default as AudioUploader } from "./components/AudioUploader";
export { default as SpeechToText } from "./components/SpeechToText";
export { default as TextToSpeech } from "./components/TextToSpeech";
export { default as TextTranslator } from "./components/TextTranslator";
export { default as SpeechPanel } from "./components/SpeechPanel";
export { default as VoiceInput } from "./components/VoiceInput";
export { default as TextToSpeechButton } from "./components/TextToSpeechButton";
export { default as InlineTranslator } from "./components/InlineTranslator";

// API
export { default as speechApi } from "./api/speechApi";
export {
  transcribeAudio,
  translateText,
  textToSpeech,
  getTtsAudioUrl,
} from "./api/speechApi";
