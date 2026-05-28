import React, { useState, useEffect } from "react";
import { useToast } from "../../contexts/ToastContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cardSetsApi } from "../../features/cardSets/api/cardSetsApi";
import { CardSideEditor } from "../../features/cardSets";
import { faXmark, faPlus, faArrowRight, faSpinner } from "../../utils/icons";
import { translateText } from "../../features/speech/api/speechApi";

const LANG_STORAGE_KEY = "card_language_preferences";

export default function AddCardModal({
  setId,
  onClose,
  onAdd,
  insertPosition,
  currentTheme,
}) {
  const toast = useToast();
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [loading, setLoading] = useState(false);

  // Медиа
  const [frontImage, setFrontImage] = useState(null);
  const [frontAudio, setFrontAudio] = useState(null);
  const [frontVideo, setFrontVideo] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [backAudio, setBackAudio] = useState(null);
  const [backVideo, setBackVideo] = useState(null);

  // Языки сторон - загружаем из localStorage или используем значения по умолчанию
  const [frontLang, setFrontLang] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      return saved ? JSON.parse(saved).frontLang || "ru" : "ru";
    } catch {
      return "ru";
    }
  });

  const [backLang, setBackLang] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      return saved ? JSON.parse(saved).backLang || "ru" : "ru";
    } catch {
      return "ru";
    }
  });

  // Сохраняем выбор языка при изменении
  useEffect(() => {
    try {
      localStorage.setItem(
        LANG_STORAGE_KEY,
        JSON.stringify({ frontLang, backLang }),
      );
    } catch (error) {
      console.error("Failed to save language preferences:", error);
    }
  }, [frontLang, backLang]);

  // Состояние для перевода
  const [translating, setTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!front.trim()) return;
    setTranslating(true);
    try {
      const res = await translateText(front, backLang);
      setBack(res.translated_text);
      toast.success("Перевод выполнен!");
    } catch (error) {
      toast.error("Ошибка перевода");
    } finally {
      setTranslating(false);
    }
  };

  // Валидация
  const [showValidation, setShowValidation] = useState(false);
  const frontHasContent = () =>
    front.trim() || frontImage || frontAudio || frontVideo;
  const backHasContent = () =>
    back.trim() || backImage || backAudio || backVideo;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!frontHasContent() || !backHasContent()) {
      setShowValidation(true);
      toast.error("Заполните обе стороны карточки");
      return;
    }
    setShowValidation(false);
    setLoading(true);

    try {
      // insertPosition — это индекс в массиве (0-based), после которого вставляем
      // null/undefined = добавить в конец (без указания позиции)
      // Бэкенд ожидает position (1-based) — позицию новой карточки
      const apiPosition =
        insertPosition !== null && insertPosition !== undefined
          ? insertPosition + 1
          : undefined;

      const response = await cardSetsApi.createCard(setId, {
        front: front.trim(),
        back: back.trim(),
        position: apiPosition,
        front_lang: frontLang,
        back_lang: backLang,
        front_image: frontImage,
        front_audio: frontAudio,
        front_video: frontVideo,
        back_image: backImage,
        back_audio: backAudio,
        back_video: backVideo,
      });
      onAdd(response.data);
      toast.success("Карточка создана!");
    } catch (error) {
      toast.error("Ошибка: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay card-set-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-container add-card-modal" onClick={(e) => e.stopPropagation()}>
        {/* Шапка */}
        <div className="modal-header card-set-header">
          <div className="card-set-header-left">
            <h2>
              <FontAwesomeIcon
                icon={faPlus}
                style={{ marginRight: "8px", opacity: 0.7 }}
              />
              {insertPosition !== null && insertPosition !== undefined
                ? `Создать карточку (позиция ${insertPosition + 1})`
                : "Создать карточку"}
            </h2>
          </div>
          <div className="card-set-header-right">
            <button onClick={onClose} className="modal-close">
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>

        {/* Тело */}
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Две колонки с кнопкой перевода между ними */}
            <div className="card-form-row">
              <CardSideEditor
                side="front"
                text={front}
                onTextChange={(v) => {
                  setFront(v);
                  setShowValidation(false);
                }}
                image={frontImage}
                audio={frontAudio}
                video={frontVideo}
                onImageChange={(v) => {
                  setFrontImage(v);
                  setShowValidation(false);
                }}
                onAudioChange={(v) => {
                  setFrontAudio(v);
                  setShowValidation(false);
                }}
                onVideoChange={(v) => {
                  setFrontVideo(v);
                  setShowValidation(false);
                }}
                currentTheme={currentTheme}
                lang={frontLang}
                onLangChange={setFrontLang}
                isFrontSide={true}
                isInvalid={showValidation && !frontHasContent()}
              />

              {/* Кнопка перевода между колонками */}
              <div className="card-form-divider">
                <button
                  type="button"
                  onClick={handleTranslate}
                  disabled={translating || !front.trim()}
                  className="card-form-translate-btn"
                  title={`Перевести с ${frontLang.toUpperCase()} на ${backLang.toUpperCase()}`}
                >
                  <FontAwesomeIcon
                    icon={translating ? faSpinner : faArrowRight}
                    spin={translating}
                  />
                </button>
                <div className="card-set-translate-label">
                  {frontLang.toUpperCase()} → {backLang.toUpperCase()}
                </div>
              </div>

              <CardSideEditor
                side="back"
                text={back}
                onTextChange={(v) => {
                  setBack(v);
                  setShowValidation(false);
                }}
                image={backImage}
                audio={backAudio}
                video={backVideo}
                onImageChange={(v) => {
                  setBackImage(v);
                  setShowValidation(false);
                }}
                onAudioChange={(v) => {
                  setBackAudio(v);
                  setShowValidation(false);
                }}
                onVideoChange={(v) => {
                  setBackVideo(v);
                  setShowValidation(false);
                }}
                currentTheme={currentTheme}
                lang={backLang}
                onLangChange={setBackLang}
                isFrontSide={false}
                isInvalid={showValidation && !backHasContent()}
              />
            </div>

            {/* Кнопки */}
            <div className="modal-footer card-set-actions">
              <button
                type="button"
                onClick={onClose}
                className="modal-btn-cancel card-set-cancel-button"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="modal-btn-submit card-set-submit-button"
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Добавление...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlus} />
                    Добавить
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}