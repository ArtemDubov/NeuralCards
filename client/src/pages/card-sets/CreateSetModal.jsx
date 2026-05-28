import React, { useState } from "react";
import { useToast } from "../../contexts/ToastContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cardSetsApi } from "../../features/cardSets/api/cardSetsApi";
import { faXmark, faPlus, faSpinner, faList } from "../../utils/icons";

export default function CreateSetModal({ onClose, onCreate }) {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  // Валидация
  const [showValidation, setShowValidation] = useState(false);
  const titleValid = title.trim().length >= 3 && title.trim().length <= 100;
  const descriptionValid = !description || description.trim().length <= 500;

  const handleTagInput = (e) => {
    const value = e.target.value;

    // Проверяем разделители: запятая, точка или Enter
    const separators = /[,.\n]/;

    if (separators.test(value)) {
      // Разделяем по всем возможным разделителям
      const parts = value
        .split(separators)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      // Добавляем все части как теги с проверкой ограничений
      if (parts.length > 0 && tags.length < 10) {
        const newTags = [...tags];
        parts.forEach((part) => {
          // Ограничение: максимум 10 символов и максимум 10 тегов
          const trimmedPart = part.substring(0, 10);
          if (!newTags.includes(trimmedPart) && newTags.length < 10) {
            newTags.push(trimmedPart);
          }
        });
        setTags(newTags);
      }

      // Очищаем поле ввода
      setTagInput("");
    } else {
      // Ограничиваем ввод в реальном времени до 10 символов
      setTagInput(value.substring(0, 10));
    }
  };

  const handleTagKeyDown = (e) => {
    // Обработка Enter
    if (e.key === "Enter") {
      e.preventDefault();
      const tagValue = tagInput.trim().substring(0, 10);
      if (tagValue && !tags.includes(tagValue) && tags.length < 10) {
        setTags([...tags, tagValue]);
        setTagInput("");
      }
    }
    // Обработка Backspace для удаления последнего тега
    else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titleValid || !descriptionValid) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    setLoading(true);

    try {
      const response = await cardSetsApi.createCardSet({
        title: title.trim(),
        description: description.trim() || null,
        tags: tags,
        is_public: isPublic,
      });

      toast.success("Набор создан!");
      onCreate(response.data);
      onClose();
    } catch (error) {
      console.error("Error creating set:", error);
      toast.error(error.response?.data?.detail || "Ошибка при создании набора");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay card-set-overlay"
      onClick={handleOverlayClick}
    >
      <div className="modal-container card-set-modal">
        {/* Шапка */}
        <div className="modal-header card-set-header">
          <h2 className="modal-title">Создание нового набора</h2>
          <button
            onClick={onClose}
            className="modal-close-btn card-set-close-btn"
            disabled={loading}
            type="button"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Тело модалки */}
        <div className="modal-body">
          <form id="create-set-form" onSubmit={handleSubmit}>
            {/* Название */}
            <div className="modal-form-group card-set-form-group">
              <label className="modal-form-label card-set-label">
                Название *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите название набора"
                maxLength={100}
                className={`modal-form-input ${showValidation && !titleValid ? "input-error" : ""}`}
                disabled={loading}
              />
              <div className="card-set-char-counter">{title.length}/100</div>
              {showValidation && !titleValid && (
                <div className="card-set-validation-error">
                  Название должно содержать минимум 3 символа
                </div>
              )}
            </div>

            {/* Описание */}
            <div className="modal-form-group card-set-form-group">
              <label className="modal-form-label card-set-label">
                Описание
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Краткое описание набора (необязательно)"
                maxLength={500}
                className="modal-form-textarea card-set-textarea"
                disabled={loading}
              />
              <div className="card-set-char-counter">
                {description.length}/500
              </div>
            </div>

            {/* Теги */}
            <div className="modal-form-group card-set-form-group">
              <label className="modal-form-label card-set-label">Теги</label>
              <input
                id="tag-input"
                type="text"
                value={tagInput}
                onChange={handleTagInput}
                onKeyDown={handleTagKeyDown}
                placeholder="Введите тег и нажмите Enter"
                maxLength={10}
                className={`modal-form-input ${tags.length >= 10 ? "input-disabled" : ""}`}
                disabled={loading || tags.length >= 10}
              />
              
              {/* Хештеги под полем ввода */}
              {tags.length > 0 && (
                <div className="card-set-tags-list">
                  {tags.map((tag, index) => (
                    <span key={index} className="card-set-tag">
                      {tag}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTag(index);
                        }}
                        className="card-set-tag-remove"
                        disabled={loading}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              <div className="card-set-char-counter">
                {tags.length}/10 тегов
              </div>
            </div>

            {/* Публичность */}
            <div className="card-set-toggle-group">
              <div
                className={`card-set-toggle ${isPublic ? 'active' : ''}`}
                onClick={() => !loading && setIsPublic(!isPublic)}
              >
                <div className="card-set-toggle-knob"></div>
              </div>
              <span className="card-set-toggle-label">
                Публичный набор
              </span>
            </div>
          </form>
        </div>

        {/* Футер с кнопками */}
        <div className="modal-footer card-set-actions">
          <button
            type="button"
            onClick={onClose}
            className="modal-btn-cancel card-set-cancel-button"
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="modal-btn-submit card-set-submit-button"
            form="create-set-form"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Создание...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPlus} />
                Создать
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
