import React, { useState, useRef } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useAuthStore } from "../../../../shared/stores/authStore";
import ImageCropper from "../../ImageCropper/ImageCropper";

const AvatarPicker = ({ currentAvatar, onClose }) => {
  const { t } = useAppStore();
  const { updateAvatar, uploadAvatar } = useAuthStore();
  const [activeTab, setActiveTab] = useState("emoji");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(
    currentAvatar?.avatarEmoji || null
  );
  const [selectedColor, setSelectedColor] = useState(
    currentAvatar?.avatarColor || null
  );
  const fileInputRef = useRef(null);

  // Популярные эмодзи
  const popularEmojis = [
    "😀",
    "😎",
    "🤓",
    "🧠",
    "🎓",
    "📚",
    "✏️",
    "🌟",
    "⭐",
    "⚡",
    "🔥",
    "💎",
    "👑",
    "🎭",
    "🎨",
    "🎵",
    "🚀",
    "🌈",
    "🌊",
    "🌙",
    "🌲",
    "🌅",
    "☀️",
    "🐱",
    "🦊",
    "🐶",
    "🦉",
    "🦋",
    "🌸",
    "🍎",
    "⚽",
    "🎮",
    "🎸",
    "🎬",
    "💻",
    "📱",
    "🔒",
    "🔑",
    "💡",
    "❤️",
  ];

  // Расширенная палитра цветов (24 цвета + прозрачный)
  const colorOptions = [
    // Основные цвета
    { name: "Синий", value: "#4FC3F7" },
    { name: "Фиолетовый", value: "#7C3AED" },
    { name: "Зеленый", value: "#10B981" },
    { name: "Оранжевый", value: "#F97316" },
    { name: "Розовый", value: "#EC4899" },
    { name: "Красный", value: "#EF4444" },
    { name: "Желтый", value: "#F59E0B" },
    { name: "Серый", value: "#6B7280" },

    // Дополнительные цвета
    { name: "Голубой", value: "#06B6D4" },
    { name: "Индиго", value: "#6366F1" },
    { name: "Лаймовый", value: "#84CC16" },
    { name: "Бирюзовый", value: "#0D9488" },
    { name: "Персиковый", value: "#FB923C" },
    { name: "Фуксия", value: "#D946EF" },
    { name: "Розово-лавандовый", value: "#F472B6" },
    { name: "Коричневый", value: "#92400E" },

    // Пастельные цвета
    { name: "Нежно-голубой", value: "#93C5FD" },
    { name: "Нежно-розовый", value: "#F9A8D4" },
    { name: "Нежно-зеленый", value: "#A7F3D0" },
    { name: "Нежно-желтый", value: "#FDE68A" },
    { name: "Нежно-фиолетовый", value: "#D8B4FE" },
    { name: "Нежно-оранжевый", value: "#FED7AA" },
    { name: "Нежно-синий", value: "#BFDBFE" },
    { name: "Нежно-красный", value: "#FECACA" },
  ];

  const handleEmojiSelect = (emoji) => {
    setSelectedEmoji(emoji);
    // Цвет остается выбранным!
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleTransparentSelect = () => {
    setSelectedColor("transparent");
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(t("profile.avatar.invalid_type"));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert(t("profile.avatar.too_large"));
      return;
    }

    // Показываем редактор обрезки
    const imageUrl = URL.createObjectURL(file);
    setSelectedFile({ file, preview: imageUrl });
    setShowCropper(true);
    event.target.value = ""; // Сбрасываем input
  };

  const handleCropComplete = async (cropData) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", selectedFile.file);
      formData.append("cropData", JSON.stringify(cropData));

      const result = await uploadAvatar(formData);

      if (result.success) {
        setShowCropper(false);
        setSelectedFile(null);
        onClose();
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      alert(error.message || t("profile.avatar.upload_error"));
    } finally {
      setUploading(false);
    }
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    setSelectedFile(null);
    if (selectedFile?.preview) {
      URL.revokeObjectURL(selectedFile.preview);
    }
  };

  const handleSave = async () => {
    try {
      console.log("Сохранение аватара:", {
        цвет: selectedColor,
        эмодзи: selectedEmoji,
      });

      // ПОДГОТОВКА ДАННЫХ ДЛЯ ОТПРАВКИ
      const dataToSend = {};

      // 1. Если выбран цвет - отправляем его отдельным полем
      //    цвет может быть "transparent", hex или null
      if (selectedColor !== undefined) {
        dataToSend.color = selectedColor;
        // Если выбрали цвет, сбрасываем изображение
        dataToSend.imageUrl = null;
      }

      // 2. Эмодзи (может быть null для сброса)
      if (selectedEmoji !== undefined) {
        dataToSend.emoji = selectedEmoji;
      }

      console.log("Отправляем на сервер:", dataToSend);

      // Отправляем на сервер если есть что отправлять
      if (Object.keys(dataToSend).length > 0) {
        const result = await updateAvatar(dataToSend);
        if (result.success) {
          console.log("✅ Аватар успешно сохранен");
          onClose();
          return;
        } else {
          console.error("❌ Ошибка сохранения:", result.error);
          alert(result.error || "Ошибка сохранения аватара");
          return;
        }
      }

      // Если ничего не выбрано, просто закрываем
      onClose();
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      alert(error.message || "Ошибка сохранения аватара");
    }
  };

  const handleRemoveAvatar = async () => {
    if (window.confirm(t("profile.avatar.confirm_remove"))) {
      const result = await updateAvatar({
        emoji: null,
        imageUrl: null,
        color: null,
      });
      if (result.success) {
        onClose();
      }
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <div className="nt-avatar-picker">
        <div className="nt-avatar-picker__header">
          <h3>{t("profile.avatar.change_title")}</h3>
          <button className="nt-btn nt-btn--text" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="nt-avatar-picker__tabs">
          <button
            className={`nt-avatar-picker__tab ${
              activeTab === "emoji" ? "nt-avatar-picker__tab--active" : ""
            }`}
            onClick={() => setActiveTab("emoji")}
          >
            {t("profile.avatar.tab_emoji")}
          </button>
          <button
            className={`nt-avatar-picker__tab ${
              activeTab === "upload" ? "nt-avatar-picker__tab--active" : ""
            }`}
            onClick={() => setActiveTab("upload")}
          >
            {t("profile.avatar.tab_upload")}
          </button>
        </div>

        <div className="nt-avatar-picker__content">
          {activeTab === "emoji" ? (
            <>
              <div className="nt-avatar-picker__section">
                <h4>{t("profile.avatar.select_emoji")}</h4>
                <div className="nt-avatar-picker__emoji-grid">
                  {/* Кнопка "Без эмодзи" */}
                  <button
                    className={`nt-avatar-picker__emoji ${
                      selectedEmoji === null
                        ? "nt-avatar-picker__emoji--selected"
                        : ""
                    }`}
                    onClick={() => setSelectedEmoji(null)}
                    title="Без эмодзи"
                  >
                    ❌
                  </button>

                  {/* Список эмодзи */}
                  {popularEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      className={`nt-avatar-picker__emoji ${
                        selectedEmoji === emoji
                          ? "nt-avatar-picker__emoji--selected"
                          : ""
                      }`}
                      onClick={() => handleEmojiSelect(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="nt-avatar-picker__section">
                <h4>{t("profile.avatar.select_color")}</h4>
                <div className="nt-avatar-picker__color-grid">
                  {/* Кнопка "Прозрачный фон" */}
                  <button
                    className={`nt-avatar-picker__color ${
                      selectedColor === "transparent"
                        ? "nt-avatar-picker__color--selected"
                        : ""
                    }`}
                    onClick={handleTransparentSelect}
                    title="Прозрачный фон"
                    style={{
                      backgroundColor: "#f5f5f5",
                      backgroundImage:
                        "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)",
                      backgroundSize: "8px 8px",
                      backgroundPosition: "0 0, 4px 4px",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#666" }}>×</span>
                  </button>

                  {/* Цвета */}
                  {colorOptions.map((color, index) => (
                    <button
                      key={index}
                      className={`nt-avatar-picker__color ${
                        selectedColor === color.value
                          ? "nt-avatar-picker__color--selected"
                          : ""
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleColorSelect(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="nt-avatar-picker__upload-section">
              <h4>{t("profile.avatar.upload_title")}</h4>
              <p className="nt-avatar-picker__upload-hint">
                {t("profile.avatar.upload_hint")}
              </p>

              <div className="nt-avatar-picker__upload-zone">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <button
                  className="nt-btn nt-btn--primary nt-btn--large"
                  onClick={handleUploadClick}
                  disabled={uploading || showCropper}
                >
                  {uploading
                    ? t("profile.avatar.uploading")
                    : t("profile.avatar.choose_file")}
                </button>

                <p className="nt-avatar-picker__upload-info">
                  JPG, PNG, GIF, WEBP • {t("profile.avatar.max_size")}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="nt-avatar-picker__footer">
          <div className="nt-avatar-picker__actions">
            <button className="nt-btn nt-btn--outline" onClick={onClose}>
              {t("common.cancel")}
            </button>
            <button
              className="nt-btn nt-btn--primary"
              onClick={handleSave}
              disabled={!selectedEmoji && !selectedColor && !selectedFile}
            >
              {t("common.save")}
            </button>
          </div>
          {(currentAvatar?.avatarEmoji ||
            currentAvatar?.avatarUrl ||
            currentAvatar?.avatarColor) && (
            <button
              className="nt-btn nt-btn--text nt-btn--danger nt-avatar-picker__remove-btn"
              onClick={handleRemoveAvatar}
            >
              {t("profile.avatar.remove")}
            </button>
          )}
        </div>
      </div>

      {/* МОДАЛКА ОБРЕЗКИ ИЗОБРАЖЕНИЯ */}
      {showCropper && selectedFile && (
        <div className="nt-modal__overlay" style={{ zIndex: 10060 }}>
          <div
            className="nt-modal__content"
            onClick={(e) => e.stopPropagation()}
          >
            <ImageCropper
              imageSrc={selectedFile.preview}
              onCropComplete={handleCropComplete}
              onCancel={handleCancelCrop}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AvatarPicker;
