import React, { useState, useEffect, useRef } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import AnimatedModal from "../../../shared/components/AnimatedModal/AnimatedModal";

// Компонент для ввода тегов
const SimpleTagsInput = ({
  tags = [],
  setTags,
  placeholder = "Введите теги...",
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

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

const EditSetModal = ({
  isOpen,
  onClose,
  onSubmit,
  setData,
  isSubmitting = false,
  error = null,
}) => {
  const { t } = useAppStore();

  const [form, setForm] = useState({
    title: "",
    tags: [],
  });

  // Инициализация формы
  useEffect(() => {
    if (isOpen && setData) {
      const tagsArray = [];
      if (Array.isArray(setData.tags)) {
        setData.tags.forEach((tag) => {
          if (typeof tag === "string") tagsArray.push(tag);
          else if (tag && typeof tag === "object")
            tagsArray.push(tag.name || tag.title || String(tag));
        });
      } else if (typeof setData.tags === "string") {
        tagsArray.push(
          ...setData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        );
      }

      setForm({
        title: setData.title || "",
        tags: tagsArray,
      });
    }
  }, [isOpen, setData]);

  const handleTextChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (newTags) => {
    setForm((prev) => ({ ...prev, tags: newTags }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim()) return;

    const submitData = {
      title: form.title.trim(),
      tags: form.tags,
      // description и isPublic будут undefined - сервер оставит старые значения
    };

    console.log("📤 Упрощённая отправка данных:", submitData);
    onSubmit(submitData);
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} size="medium">
      <div className="nt-modal__header">
        <h2 className="nt-modal__title">
          {t("sets.edit.title") || "Редактирование набора"}
        </h2>
        <button className="nt-modal__close" onClick={onClose}>
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="nt-modal__body">
          {/* Только название */}
          <div className="nt-form__group">
            <label className="nt-form__label">
              {t("sets.edit.name") || "Название набора"} *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTextChange("title", e.target.value)}
              className="nt-form__input"
              placeholder="Введите название набора"
              required
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          {/* Теги */}
          <div className="nt-form__group">
            <label className="nt-form__label">
              {t("sets.edit.tags") || "Теги"}
            </label>
            <SimpleTagsInput tags={form.tags} setTags={handleTagsChange} />
            <small className="nt-form__hint">
              Введите теги через запятую или нажмите Enter
            </small>
          </div>

          {/* Ошибка */}
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
              Отмена
            </button>
            <button
              type="submit"
              className="nt-btn nt-btn--primary"
              disabled={isSubmitting || !form.title.trim()}
            >
              {isSubmitting ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>
      </form>
    </AnimatedModal>
  );
};

export default EditSetModal;
