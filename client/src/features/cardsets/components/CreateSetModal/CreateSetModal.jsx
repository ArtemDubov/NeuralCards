import React, { useState, useEffect } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";

// Компонент для ввода тегов (скопирован из EditSetModal)
const SimpleTagsInput = ({
  tags = [],
  setTags,
  placeholder = "Введите теги...",
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = React.useRef(null);

  // Нормализуем теги при получении
  const normalizedTags = Array.isArray(tags)
    ? tags
        .map((tag) => {
          if (typeof tag === "string") return tag;
          if (tag && typeof tag === "object") {
            return tag.name || tag.title || String(tag);
          }
          return String(tag);
        })
        .filter((tag) => tag.trim() !== "")
    : [];

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (
      e.key === "Backspace" &&
      inputValue === "" &&
      normalizedTags.length > 0
    ) {
      removeTag(normalizedTags.length - 1);
    }
  };

  const addTag = (tag) => {
    if (tag && !normalizedTags.includes(tag)) {
      const newTags = [...normalizedTags, tag];
      setTags(newTags);
    }
    setInputValue("");
  };

  const removeTag = (index) => {
    const newTags = normalizedTags.filter((_, i) => i !== index);
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
        {normalizedTags.map((tag, index) => (
          <div key={index} className="nt-tag">
            <span className="nt-tag__text">{tag}</span>
            <button
              type="button"
              className="nt-tag__remove"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
            >
              ×
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          placeholder={normalizedTags.length === 0 ? placeholder : ""}
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

  const [form, setForm] = useState({
    title: "",
    tags: [],
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

    onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div className="nt-modal__overlay">
      <div className="nt-modal nt-modal--medium">
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
                placeholder={
                  t("sets.create.placeholder") || "Введите название набора"
                }
                required
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            {/* Поле тегов */}
            <div className="nt-form__group">
              <label className="nt-form__label">
                {t("sets.edit.tags") || "Теги"}
              </label>
              <SimpleTagsInput
                tags={form.tags}
                setTags={handleTagsChange}
                placeholder={
                  t("sets.edit.tags.placeholder") || "тег1, тег2, тег3"
                }
              />
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

            {/* Валидация */}
            <div className="nt-form__validation">
              {!form.title.trim() && (
                <div className="nt-form__validation-error">
                  ⚠️{" "}
                  {t("sets.edit.validation.title") || "Введите название набора"}
                </div>
              )}
            </div>
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
      </div>
    </div>
  );
};

export default CreateSetModal;
