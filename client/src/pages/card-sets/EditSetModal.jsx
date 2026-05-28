import React, { useState, useEffect } from "react";
import { useToast } from "../../contexts/ToastContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cardSetsApi } from "../../features/cardSets/api/cardSetsApi";
import { faXmark, faSave, faSpinner, faList } from "../../utils/icons";

export default function EditSetModal({ set, onClose, onUpdate, currentTheme }) {
  const toast = useToast();
  const [title, setTitle] = useState(set?.title || "");
  const [description, setDescription] = useState(set?.description || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState(
    set?.tags ? set.tags.map((t) => t.name || t) : []
  );
  const [isPublic, setIsPublic] = useState(set?.is_public || false);
  const [loading, setLoading] = useState(false);

  // Валидация
  const [showValidation, setShowValidation] = useState(false);
  const titleValid = title.trim().length >= 3 && title.trim().length <= 100;
  const descriptionValid = !description || description.trim().length <= 500;

  useEffect(() => {
    if (set) {
      setTitle(set.title || "");
      setDescription(set.description || "");
      setTags(set.tags ? set.tags.map((t) => t.name || t) : []);
      setIsPublic(set.is_public || false);
    }
  }, [set]);

  const handleTagInput = (e) => {
    const value = e.target.value;
    
    // Проверяем разделители: запятая, точка или Enter
    const separators = /[,.\n]/;
    
    if (separators.test(value)) {
      // Разделяем по всем возможным разделителям
      const parts = value.split(separators).map(p => p.trim()).filter(p => p.length > 0);
      
      // Добавляем все части как теги с проверкой ограничений
      if (parts.length > 0 && tags.length < 10) {
        const newTags = [...tags];
        parts.forEach(part => {
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
      const response = await cardSetsApi.updateCardSet(set.id, {
        title: title.trim(),
        description: description.trim() || null,
        tags: tags,
        is_public: isPublic,
      });

      toast.success("Набор обновлен!");
      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.error("Error updating set:", error);
      toast.error(error.response?.data?.detail || "Ошибка при обновлении набора");
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
    <div className="modal-overlay card-set-overlay" onClick={handleOverlayClick}>
      <div className="modal-container card-set-modal">
        {/* Шапка */}
        <div className="modal-header card-set-header">
          <h2 className="modal-title">Редактирование набора</h2>
          <button
            onClick={onClose}
            className="modal-close-btn card-set-close-btn"
            disabled={loading}
            type="button"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Форма охватывает всё тело и футер */}
        <form onSubmit={handleSubmit}>
          {/* Тело модалки */}
          <div className="modal-body">
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
                className={`modal-form-input ${showValidation && !titleValid ? 'input-error' : ''}`}
                disabled={loading}
              />
              <div className="card-set-char-counter">
                {title.length}/100
              </div>
              {showValidation && !titleValid && (
                <div className="card-set-validation-error">
                  Название должно содержать минимум 3 символа
                </div>
              )}
            </div>

            {/* Описание */}
            <div className="modal-form-group card-set-form-group">
              <label className="modal-form-label card-set-label">Описание</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Краткое описание набора (необязательно)"
                maxLength={500}
                rows={2}
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
                id="tag-input-edit"
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

            {/* Публичный доступ */}
            <div className="card-set-toggle-group">
              <div
                className={`card-set-toggle ${isPublic ? 'active' : ''}`}
                onClick={() => !loading && setIsPublic(!isPublic)}
              >
                <div className="card-set-toggle-knob" />
              </div>
              <span className="card-set-toggle-label">
                Сделать набор публичным
              </span>
            </div>
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
              className="modal-btn-submit card-set-submit-button"
              disabled={loading}
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
  );
}
