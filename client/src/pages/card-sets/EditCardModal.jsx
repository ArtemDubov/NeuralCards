import React, { useState, useEffect } from "react";
import { useToast } from "../../contexts/ToastContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cardSetsApi } from "../../features/cardSets/api/cardSetsApi";
import { CardSideEditor } from "../../features/cardSets";
import { faXmark, faStar, faPen, faArrowRight, faSpinner, faSave } from "../../utils/icons";
import { translateText } from "../../features/speech/api/speechApi";

const LANG_STORAGE_KEY = "card_language_preferences";

export default function EditCardModal({
  card,
  onClose,
  onUpdate,
  currentTheme,
  isFavorite = false,
  onToggleFavorite,
}) {
  const toast = useToast();
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [loading, setLoading] = useState(false);

  // Медиа
  const [frontImage, setFrontImage] = useState(card.front_image || null);
  const [frontAudio, setFrontAudio] = useState(card.front_audio || null);
  const [frontVideo, setFrontVideo] = useState(card.front_video || null);
  const [backImage, setBackImage] = useState(card.back_image || null);
  const [backAudio, setBackAudio] = useState(card.back_audio || null);
  const [backVideo, setBackVideo] = useState(card.back_video || null);

  // Языки сторон - загружаем из карточки или из сохраненных предпочтений
  const [frontLang, setFrontLang] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      return card.front_lang || (saved ? JSON.parse(saved).frontLang : "ru") || "ru";
    } catch {
      return card.front_lang || "ru";
    }
  });
  
  const [backLang, setBackLang] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      return card.back_lang || (saved ? JSON.parse(saved).backLang : "ru") || "ru";
    } catch {
      return card.back_lang || "ru";
    }
  });

  // Сохраняем выбор языка при изменении
  useEffect(() => {
    try {
      localStorage.setItem(
        LANG_STORAGE_KEY,
        JSON.stringify({ frontLang, backLang })
      );
    } catch (error) {
      console.error("Failed to save language preferences:", error);
    }
  }, [frontLang, backLang]);

  // Блокируем скролл страницы когда модалка открыта
  useEffect(() => {
    document.body.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Обработчик Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Состояние для перевода
  const [translating, setTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!front.trim()) return;
    setTranslating(true);
    try {
      const res = await translateText(front, backLang);
      setBack(res.translated_text);
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
      return;
    }
    setShowValidation(false);
    setLoading(true);

    try {
      const response = await cardSetsApi.updateCard(card.id, {
        front: front.trim(),
        back: back.trim(),
        front_lang: frontLang,
        back_lang: backLang,
        front_image: frontImage,
        front_audio: frontAudio,
        front_video: frontVideo,
        back_image: backImage,
        back_audio: backAudio,
        back_video: backVideo,
      });
      
      toast.success("Карточка обновлена!");
      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.error("Error updating card:", error);
      toast.error("Ошибка: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay card-set-overlay">
      <div className="modal-container edit-card-modal">
        {/* Шапка */}
        <div className="modal-header card-set-header">
          <div className="card-set-header-left">
            <h2>
              <FontAwesomeIcon
                icon={faPen}
                style={{ marginRight: "8px", opacity: 0.7 }}
              />
              Редактировать карточку
            </h2>
          </div>
          <div className="card-set-header-right">
            {onToggleFavorite && (
              <button
                onClick={onToggleFavorite}
                className="btn btn-icon"
                style={{
                  background: isFavorite
                    ? "rgba(241,196,15,0.2)"
                    : `${currentTheme?.textMuted || "var(--nt-text-muted)"}15`,
                  color: isFavorite
                    ? "var(--nt-warning)"
                    : currentTheme?.textMuted || "var(--nt-text-muted)",
                }}
                title={
                  isFavorite ? "Убрать из избранного" : "Добавить в избранное"
                }
              >
                <FontAwesomeIcon icon={faStar} />
              </button>
            )}
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
                    Сохранение...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} />
                    Сохранить
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