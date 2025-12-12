// features/cardSets/components/CreateSetModal/CreateSetModal.jsx
import React, { useState, useEffect } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import AnimatedModal from "../../../shared/components/AnimatedModal/AnimatedModal";

const SimpleTagsInput = ({
  tags = [],
  setTags,
  placeholder = "Введите теги...",
}) => {
  const [inputValue, setInputValue] = useState("");

  // ВАЖНО: Оставляем старую логику - теги как массив строк
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue.trim());
    }
  };

  const addTag = (tag) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setInputValue("");
  };

  const removeTag = (index) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue.trim());
    }
  };

  return (
    <div className="nt-tags-input">
      <div className="nt-tags-input__tags">
        {tags.map((tag, index) => (
          <div key={index} className="nt-tag">
            <span className="nt-tag__text">{tag}</span>
            <button
              type="button"
              className="nt-tag__remove"
              onClick={() => removeTag(index)}
            >
              ×
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="nt-tags-input__input"
        />
      </div>
    </div>
  );
};

const CreateSetModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  error = null,
}) => {
  const { t } = useAppStore();

  // ВАЖНО: Оставляем старую структуру состояния
  const [form, setForm] = useState({
    title: "",
    tags: [], // Массив строк как было
  });

  // Сброс формы при открытии модалки
  useEffect(() => {
    if (isOpen) {
      setForm({
        title: "",
        tags: [],
      });
    }
  }, [isOpen]);

  const handleTextChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (newTags) => {
    setForm((prev) => ({ ...prev, tags: newTags }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      return;
    }

    // ВАЖНО: Передаем form как есть, без изменений
    onSubmit(form);
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} size="medium">
      <div className="nt-modal__header">
        <h2 className="nt-modal__title">
          {t("sets.create.title") || "Создание набора"}
        </h2>
        <button className="nt-modal__close" onClick={onClose}>
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="nt-modal__body">
          {/* Поле названия */}
          <div className="nt-form__group">
            <label className="nt-form__label">
              {t("sets.edit.name") || "Название набора"}
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTextChange("title", e.target.value)}
              className="nt-form__input"
              placeholder={t("sets.create.placeholder")}
              required
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          {/* Поле тегов - старая логика */}
          <div className="nt-form__group">
            <label className="nt-form__label">
              {t("sets.edit.tags") || "Теги"}
            </label>
            <SimpleTagsInput tags={form.tags} setTags={handleTagsChange} />
            <small className="nt-form__hint">
              {t("sets.edit.tags.hint") ||
                "Введите теги через запятую или нажмите Enter"}
            </small>
          </div>

          {/* Отображение ошибок */}
          {error && (
            <div className="nt-form__validation-error">
              ⚠️ {error.message || error}
            </div>
          )}
        </div>

        <div className="nt-modal__footer">
          <div className="nt-modal__actions">
            <button
              type="button"
              className="nt-btn nt-btn--secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t("sets.edit.cancel") || "Отмена"}
            </button>
            <button
              type="submit"
              className="nt-btn nt-btn--primary"
              disabled={isSubmitting || !form.title.trim()}
            >
              {isSubmitting
                ? t("sets.create.saving") || "Создание..."
                : t("sets.create.button") || "Создать набор"}
            </button>
          </div>
        </div>
      </form>
    </AnimatedModal>
  );
};

export default CreateSetModal;
