import React, { useEffect, useState } from "react";
import { COLOR_OPTIONS } from "../utils/avatarConstants";

/**
 * Модальное окно для выбора цвета аватара
 */
export default function ColorModal({ 
  onClose, 
  onSelect, 
  currentColor
}) {
  const [customColor, setCustomColor] = useState(currentColor);
  const [useCustom, setUseCustom] = useState(false);

  // Блокируем прокрутку при открытой модалке
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSelect = (color) => {
    onSelect(color);
    onClose();
  };

  const handleCustomSelect = () => {
    handleSelect(customColor);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn">✕</button>
        
        <h2 className="modal-title">
          <span style={{ marginRight: "8px" }}>🎨</span>
          Выберите цвет
        </h2>

        <div className="color-grid">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              onClick={() => handleSelect(color)}
              className="color-button"
              style={{
                background: color,
                borderColor: currentColor === color && !useCustom ? "#333" : undefined,
                transform: currentColor === color && !useCustom ? "scale(1.1)" : undefined,
              }}
            />
          ))}
        </div>

        <div style={{ 
          marginTop: "16px",
          paddingTop: "16px",
          borderTop: "1px solid #e0e0e0",
        }}>
          <label className="profile-label">
            Или выберите свой цвет:
          </label>
          <div style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            marginTop: "12px",
          }}>
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                setUseCustom(true);
              }}
              className="color-picker-input"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                setUseCustom(true);
              }}
              className="color-text-input"
              placeholder="#667eea"
            />
            <button
              onClick={handleCustomSelect}
              className="profile-btn-primary"
            >
              Применить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
