import React, { useState, useRef } from "react";

const TagsInput = ({ tags, setTags, placeholder = "Добавьте теги..." }) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  // ДОБАВЛЕНО: защита от не-массива
  const safeTags = Array.isArray(tags) ? tags : [];

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (
      e.key === "Backspace" &&
      inputValue === "" &&
      safeTags.length > 0
    ) {
      removeTag(safeTags.length - 1);
    }
  };

  const addTag = () => {
    const tag = inputValue.trim();
    if (tag && !safeTags.includes(tag)) {
      setTags([...safeTags, tag]);
    }
    setInputValue("");
  };

  const removeTag = (indexToRemove) => {
    setTags(safeTags.filter((_, index) => index !== indexToRemove));
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addTag();
    }
  };

  return (
    <div
      className="tags-input-container"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="tags-list">
        {/* ИСПОЛЬЗУЕМ safeTags вместо tags */}
        {safeTags.map((tag, index) => (
          <span key={index} className="tag">
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              className="btn-tp7"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onBlur={handleInputBlur}
        placeholder={safeTags.length === 0 ? placeholder : ""}
        className="tags-input"
      />
    </div>
  );
};

export default TagsInput;
