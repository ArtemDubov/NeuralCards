import React, { useState, useEffect } from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";

const CardModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitText,
  editingCard = null,
}) => {
  const { t } = useLanguage();

  // Единое локальное состояние для всей формы
  const [form, setForm] = useState({
    frontText: "",
    backText: "",
    frontImage: null,
    backImage: null,
    frontAudio: null,
    backAudio: null,
    isUploading: false,
  });

  // Сбрасываем форму при закрытии и устанавливаем данные при редактировании
  useEffect(() => {
    if (isOpen) {
      if (editingCard) {
        // Заполняем форму данными редактируемой карточки
        setForm({
          frontText: editingCard.front || "",
          backText: editingCard.back || "",
          frontImage: null, // Новые файлы - null
          backImage: null,
          frontAudio: null,
          backAudio: null,
          isUploading: false,
        });
      } else {
        // Сбрасываем форму для создания новой карточки
        setForm({
          frontText: "",
          backText: "",
          frontImage: null,
          backImage: null,
          frontAudio: null,
          backAudio: null,
          isUploading: false,
        });
      }
    }
  }, [isOpen, editingCard]);

  // Обработчики изменений
  const handleTextChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, [fieldName]: file }));
    }
  };

  const removeFile = (fieldName) => {
    setForm((prev) => ({ ...prev, [fieldName]: null }));
    // Сбрасываем input file
    const fileInput = document.querySelector(
      `input[data-field="${fieldName}"]`
    );
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Валидация
    if (!form.frontText.trim() && !form.backText.trim()) {
      alert("Заполните хотя бы одну сторону карточки");
      return;
    }

    // Устанавливаем состояние загрузки
    setForm((prev) => ({ ...prev, isUploading: true }));

    // Передаем данные формы и состояние загрузки
    onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="container-tp1 modal-content card-modal">
        <h2>{title}</h2>

        <form onSubmit={handleSubmit}>
          {/* Front Side */}
          <div className="form-section">
            <h3>{t("cards.front")}</h3>
            <textarea
              value={form.frontText}
              onChange={(e) => handleTextChange("frontText", e.target.value)}
              placeholder={
                t("cards.front.placeholder") ||
                "Введите вопрос или текст для лицевой стороны"
              }
              rows="3"
            />

            <div className="file-upload-section">
              <label className="file-upload-btn">
                <span>
                  {form.frontImage
                    ? "🔄 Заменить изображение"
                    : t("cards.add.image")}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "frontImage")}
                  style={{ display: "none" }}
                  data-field="frontImage"
                />
              </label>

              <label className="file-upload-btn">
                <span>
                  {form.frontAudio ? "🔄 Заменить аудио" : t("cards.add.audio")}
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileChange(e, "frontAudio")}
                  style={{ display: "none" }}
                  data-field="frontAudio"
                />
              </label>
            </div>

            {(form.frontImage || form.frontAudio) && (
              <div className="file-preview">
                {form.frontImage && (
                  <div className="preview-item">
                    <span>📷 {form.frontImage.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile("frontImage")}
                      className="btn-tp7"
                    >
                      {t("cards.remove")}
                    </button>
                  </div>
                )}
                {form.frontAudio && (
                  <div className="preview-item">
                    <span>🎵 {form.frontAudio.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile("frontAudio")}
                      className="btn-tp7"
                    >
                      {t("cards.remove")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Back Side */}
          <div className="form-section">
            <h3>{t("cards.back")}</h3>
            <textarea
              value={form.backText}
              onChange={(e) => handleTextChange("backText", e.target.value)}
              placeholder={
                t("cards.back.placeholder") ||
                "Введите ответ или текст для обратной стороны"
              }
              rows="3"
            />

            <div className="file-upload-section">
              <label className="file-upload-btn">
                <span>
                  {form.backImage
                    ? "🔄 Заменить изображение"
                    : t("cards.add.image")}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "backImage")}
                  style={{ display: "none" }}
                  data-field="backImage"
                />
              </label>

              <label className="file-upload-btn">
                <span>
                  {form.backAudio ? "🔄 Заменить аудио" : t("cards.add.audio")}
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileChange(e, "backAudio")}
                  style={{ display: "none" }}
                  data-field="backAudio"
                />
              </label>
            </div>

            {(form.backImage || form.backAudio) && (
              <div className="file-preview">
                {form.backImage && (
                  <div className="preview-item">
                    <span>📷 {form.backImage.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile("backImage")}
                      className="btn-tp7"
                    >
                      {t("cards.remove")}
                    </button>
                  </div>
                )}
                {form.backAudio && (
                  <div className="preview-item">
                    <span>🎵 {form.backAudio.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile("backAudio")}
                      className="btn-tp7"
                    >
                      {t("cards.remove")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-validation">
            {!form.frontText.trim() && !form.backText.trim() && (
              <div className="validation-error">
                ⚠️ Заполните хотя бы одну сторону карточки
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-tp3"
              onClick={onClose}
              disabled={form.isUploading}
            >
              {t("cards.cancel")}
            </button>
            <button
              type="submit"
              className="btn-tp1"
              disabled={
                form.isUploading ||
                (!form.frontText.trim() && !form.backText.trim())
              }
            >
              {form.isUploading ? "📤 Загрузка..." : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardModal;
