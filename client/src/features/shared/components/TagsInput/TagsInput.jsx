import React, { useState, useEffect, useRef } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";

const TagsInput = ({ tags = [], setTags, placeholder }) => {
  const { t } = useAppStore();
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

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

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    if (inputValue.trim()) {
      addTag(inputValue.trim());
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  // Используем переданный placeholder или перевод по умолчанию
  const actualPlaceholder = placeholder || t("tags.input.placeholder");

  return (
    <div
      className={`nt-tags-input ${isFocused ? "nt-tags-input--focused" : ""}`}
      onClick={handleContainerClick}
    >
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
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={normalizedTags.length === 0 ? actualPlaceholder : ""}
          className="nt-tags-input__input"
        />
      </div>
    </div>
  );
};

export default TagsInput;
