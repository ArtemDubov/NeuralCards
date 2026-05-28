import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faCheck } from "../../../utils/icons";

/**
 * Модальное окно для загрузки фото аватара
 */
export default function ImageModal({
  imagePreview,
  onImageSelect,
  onClose,
  onSubmit,
}) {
  const fileInputRef = useRef(null);

  // Блокируем прокрутку при открытой модалке
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn">✕</button>
        
        <h2 className="modal-title">
          <FontAwesomeIcon icon={faImage} style={{ marginRight: "8px" }} />
          Загрузить фото на аватар
        </h2>
        
        <p style={{ 
          fontSize: "14px",
          marginBottom: "20px",
          lineHeight: "1.6"
        }}>
          💡 Фото будет автоматически обрезано в квадрат и оптимизировано. 
          Поддерживаются форматы: JPG, PNG, WebP
        </p>

        {!imagePreview ? (
          <>
            <div className="image-preview-container">
              <div className="image-placeholder">
                <div style={{ textAlign: "center" }}>
                  <FontAwesomeIcon
                    icon={faImage}
                    style={{ fontSize: "48px", color: "#ccc" }}
                  />
                  <p style={{ color: "#999", marginTop: "12px" }}>
                    Выберите изображение для аватара
                  </p>
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onImageSelect}
              style={{ display: "none" }}
            />

            <div className="modal-actions">
              <button onClick={onClose} className="profile-btn-secondary">
                Отмена
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="profile-btn-primary"
              >
                <FontAwesomeIcon
                  icon={faImage}
                  style={{ marginRight: "8px" }}
                />
                Выбрать файл
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="image-preview-container">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="image-preview"
              />
            </div>

            <div className="modal-actions">
              <button onClick={onClose} className="profile-btn-secondary">
                Отмена
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="select-button"
              >
                Другое фото
              </button>
              <button
                onClick={onSubmit}
                className="profile-btn-primary"
              >
                <FontAwesomeIcon
                  icon={faCheck}
                  style={{ marginRight: "8px" }}
                />
                Загрузить
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onImageSelect}
              style={{ display: "none" }}
            />
          </>
        )}
      </div>
    </div>
  );
}
