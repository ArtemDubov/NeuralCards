import React, { useState, useEffect } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useUIStore } from "../../../../shared/stores/uiStore";
import AnimatedModal from "../../../shared/components/AnimatedModal/AnimatedModal";

const CardModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitText,
  editingCard = null,
}) => {
  const { t } = useAppStore();
  const { openModal, getModalData } = useUIStore();

  const [form, setForm] = useState({
    frontText: "",
    backText: "",
    frontImage: null,
    backImage: null,
    frontAudio: null,
    backAudio: null,
    isUploading: false,
  });

  // Сброс формы при открытии модалки
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
      alert(
        t("card.validation.empty") || "Заполните хотя бы одну сторону карточки"
      );
      return;
    }

    setForm((prev) => ({ ...prev, isUploading: true }));
    onSubmit(form);
  };

  const handleBatchUploadClick = () => {
    const modalData = getModalData("addCard");
    if (modalData?.setId) {
      onClose(); // Закрываем текущую модалку
      openModal("batchUpload", {
        setId: modalData.setId,
        onSuccess: modalData.onSuccess,
      });
    }
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} size="large">
      <div className="nt-modal__header">
        <h2 className="nt-modal__title">{title}</h2>
        <button className="nt-modal__close" onClick={onClose}>
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="nt-modal__batch-upload-section nt-util__mb-md">
          <button
            type="button"
            className="nt-btn nt-btn--secondary nt-btn--icon nt-util__w-full"
            onClick={handleBatchUploadClick}
          >
            <span className="nt-btn__icon">📁</span>
            <span className="nt-btn__text">
              {t("batch.upload.button") ||
                "Создать несколько карточек из файла"}
            </span>
          </button>
          <div className="nt-util__text-xs nt-util__text-gray nt-util__mt-xs">
            {t("batch.upload.hint") ||
              "Поддерживаются .txt файлы в формате 'Слово - Перевод'"}
          </div>
        </div>

        <div className="nt-modal__cards-container">
          {/* Front Side */}
          <div className="nt-modal__card-side nt-modal__card-side--front">
            <h3 className="nt-modal__card-side-title">
              {t("cards.front") || "Лицевая сторона"}
            </h3>
            <div className="nt-modal__card-content">
              <textarea
                value={form.frontText}
                onChange={(e) => handleTextChange("frontText", e.target.value)}
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
                      ? t("card.replace.image") || "Заменить изображение"
                      : t("cards.add.image") || "Добавить изображение"}
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
                      ? t("card.replace.audio") || "Заменить аудио"
                      : t("cards.add.audio") || "Добавить аудио"}
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
                        {t("cards.remove") || "Удалить"}
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
                        {t("cards.remove") || "Удалить"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Back Side */}
          <div className="nt-modal__card-side nt-modal__card-side--back">
            <h3 className="nt-modal__card-side-title">
              {t("cards.back") || "Обратная сторона"}
            </h3>
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
                      ? t("card.replace.image") || "Заменить изображение"
                      : t("cards.add.image") || "Добавить изображение"}
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
                      ? t("card.replace.audio") || "Заменить аудио"
                      : t("cards.add.audio") || "Добавить аудио"}
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
                        {t("cards.remove") || "Удалить"}
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
                        {t("cards.remove") || "Удалить"}
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
              ⚠️{" "}
              {t("card.validation.empty") ||
                "Заполните хотя бы одну сторону карточки"}
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
              {t("cards.cancel") || "Отмена"}
            </button>
            <button
              type="submit"
              className="nt-btn nt-btn--primary"
              disabled={
                form.isUploading ||
                (!form.frontText.trim() && !form.backText.trim())
              }
            >
              {form.isUploading
                ? t("card.uploading") || "Загрузка..."
                : submitText}
            </button>
          </div>
        </div>
      </form>
    </AnimatedModal>
  );
};

export default CardModal;
