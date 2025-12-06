import React, { useState, useEffect } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";

const CardModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitText,
  editingCard = null,
}) => {
  const { t } = useAppStore();

  const [form, setForm] = useState({
    frontText: "",
    backText: "",
    frontImage: null,
    backImage: null,
    frontAudio: null,
    backAudio: null,
    isUploading: false,
  });

  useEffect(() => {
    if (isOpen) {
      if (editingCard) {
        setForm({
          frontText: editingCard.front || "",
          backText: editingCard.back || "",
          frontImage: null,
          backImage: null,
          frontAudio: null,
          backAudio: null,
          isUploading: false,
        });
      } else {
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
    const fileInput = document.querySelector(
      `input[data-field="${fieldName}"]`
    );
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.frontText.trim() && !form.backText.trim()) {
      alert(t("card.validation.empty"));
      return;
    }

    setForm((prev) => ({ ...prev, isUploading: true }));
    onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div className="nt-modal__overlay">
      <div className="nt-modal">
        <div className="nt-modal__header">
          <h2 className="nt-modal__title">{title}</h2>
          <button className="nt-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="nt-modal__cards-container">
            {/* Front Side */}
            <div className="nt-modal__card-side nt-modal__card-side--front">
              <h3 className="nt-modal__card-side-title">{t("cards.front")}</h3>
              <div className="nt-modal__card-content">
                <textarea
                  value={form.frontText}
                  onChange={(e) =>
                    handleTextChange("frontText", e.target.value)
                  }
                  placeholder={
                    t("cards.front.placeholder") ||
                    "Введите вопрос или текст для лицевой стороны"
                  }
                  rows="3"
                  className="nt-modal__card-textarea"
                />

                <div className="nt-form__file-wrapper">
                  <label className="nt-form__file-label">
                    <span>
                      {form.frontImage
                        ? t("card.replace.image")
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

                  <label className="nt-form__file-label">
                    <span>
                      {form.frontAudio
                        ? t("card.replace.audio")
                        : t("cards.add.audio")}
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
                  <div className="nt-form__file-preview nt-util__mt-sm">
                    {form.frontImage && (
                      <div className="nt-util__flex nt-util__items-center nt-util__gap-sm">
                        <span>📷 {form.frontImage.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile("frontImage")}
                          className="nt-btn nt-btn--danger nt-btn--small"
                        >
                          {t("cards.remove")}
                        </button>
                      </div>
                    )}
                    {form.frontAudio && (
                      <div className="nt-util__flex nt-util__items-center nt-util__gap-sm">
                        <span>🎵 {form.frontAudio.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile("frontAudio")}
                          className="nt-btn nt-btn--danger nt-btn--small"
                        >
                          {t("cards.remove")}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Back Side */}
            <div className="nt-modal__card-side nt-modal__card-side--back">
              <h3 className="nt-modal__card-side-title">{t("cards.back")}</h3>
              <div className="nt-modal__card-content">
                <textarea
                  value={form.backText}
                  onChange={(e) => handleTextChange("backText", e.target.value)}
                  placeholder={
                    t("cards.back.placeholder") ||
                    "Введите ответ или текст для обратной стороны"
                  }
                  rows="3"
                  className="nt-modal__card-textarea"
                />

                <div className="nt-form__file-wrapper">
                  <label className="nt-form__file-label">
                    <span>
                      {form.backImage
                        ? t("card.replace.image")
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

                  <label className="nt-form__file-label">
                    <span>
                      {form.backAudio
                        ? t("card.replace.audio")
                        : t("cards.add.audio")}
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
                  <div className="nt-form__file-preview nt-util__mt-sm">
                    {form.backImage && (
                      <div className="nt-util__flex nt-util__items-center nt-util__gap-sm">
                        <span>📷 {form.backImage.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile("backImage")}
                          className="nt-btn nt-btn--danger nt-btn--small"
                        >
                          {t("cards.remove")}
                        </button>
                      </div>
                    )}
                    {form.backAudio && (
                      <div className="nt-util__flex nt-util__items-center nt-util__gap-sm">
                        <span>🎵 {form.backAudio.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile("backAudio")}
                          className="nt-btn nt-btn--danger nt-btn--small"
                        >
                          {t("cards.remove")}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="nt-form__validation">
            {!form.frontText.trim() && !form.backText.trim() && (
              <div className="nt-form__validation-error">
                ⚠️ {t("card.validation.empty")}
              </div>
            )}
          </div>

          <div className="nt-modal__footer">
            <div className="nt-modal__actions">
              <button
                type="button"
                className="nt-btn nt-btn--secondary"
                onClick={onClose}
                disabled={form.isUploading}
              >
                {t("cards.cancel")}
              </button>
              <button
                type="submit"
                className="nt-btn nt-btn--primary"
                disabled={
                  form.isUploading ||
                  (!form.frontText.trim() && !form.backText.trim())
                }
              >
                {form.isUploading ? t("card.uploading") : submitText}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardModal;
