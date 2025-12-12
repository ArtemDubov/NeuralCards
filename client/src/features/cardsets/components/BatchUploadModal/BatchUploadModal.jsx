import React, { useState } from "react";
import AnimatedModal from "../../../shared/components/AnimatedModal/AnimatedModal";
import { useAppStore } from "../../../../shared/stores/appStore";

const BatchUploadModal = ({ isOpen, onClose, onSubmit, isUploading }) => {
  const { t } = useAppStore();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError("");
    setPreview([]);

    if (!selectedFile) return;

    if (selectedFile.type !== "text/plain") {
      setError(
        t("batch.upload.error.format") || "Только текстовые файлы (.txt)"
      );
      return;
    }

    // Чтение файла для предпросмотра
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      parseFileContent(content);
    };
    reader.readAsText(selectedFile);
  };

  const parseFileContent = (content) => {
    const lines = content.split("\n");
    const parsed = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Ищем разделитель " - " или просто "-"
      const separatorIndex = trimmed.indexOf(" - ");
      let front, back;

      if (separatorIndex !== -1) {
        front = trimmed.substring(0, separatorIndex).trim();
        back = trimmed.substring(separatorIndex + 3).trim();
      } else {
        // Если нет " - ", пробуем просто "-"
        const dashIndex = trimmed.indexOf("-");
        if (dashIndex !== -1) {
          front = trimmed.substring(0, dashIndex).trim();
          back = trimmed.substring(dashIndex + 1).trim();
        } else {
          // Если нет разделителя, пропускаем
          setError(
            t("batch.upload.error.invalidLine") ||
              `Строка ${index + 1}: Неверный формат`
          );
          return;
        }
      }

      if (front && back) {
        parsed.push({ front, back, line: index + 1 });
      }
    });

    setPreview(parsed);

    if (parsed.length === 0) {
      setError(
        t("batch.upload.error.noCards") ||
          "Не найдено ни одной карточки в файле"
      );
    }
  };

  const handleSubmit = () => {
    if (!file || preview.length === 0) {
      setError(t("batch.upload.error.empty") || "Загрузите файл с карточками");
      return;
    }

    const cardsData = preview.map((item) => ({
      front: item.front,
      back: item.back,
    }));

    onSubmit(cardsData);
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} size="large">
      <div className="nt-modal__header">
        <h2 className="nt-modal__title">
          {t("batch.upload.title") || "Массовое создание карточек"}
        </h2>
        <button className="nt-modal__close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="nt-modal__content">
        <div className="nt-util__mb-md">
          <p className="nt-util__mb-sm">
            {t("batch.upload.description") ||
              "Загрузите текстовый файл (.txt) с карточками в формате:"}
          </p>
          <pre className="nt-util__bg-gray nt-util__p-sm nt-util__rounded">
            {t("batch.upload.format") ||
              "Яблоко - Apple\nГруша - Pear\nДом - House"}
          </pre>
        </div>

        <div className="nt-util__mb-md">
          <label className="nt-form__file-label nt-util__block">
            <span className="nt-btn nt-btn--secondary">
              {file
                ? t("batch.upload.replaceFile") || "Заменить файл"
                : t("batch.upload.selectFile") || "Выбрать файл"}
            </span>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>

          {file && (
            <div className="nt-util__mt-sm">
              <span>📄 {file.name}</span>
              <span className="nt-util__text-sm nt-util__text-gray">
                ({preview.length} карточек)
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="nt-util__mb-md nt-form__validation-error">
            ⚠️ {error}
          </div>
        )}

        {preview.length > 0 && (
          <div className="nt-util__mb-md">
            <h4 className="nt-util__mb-sm">
              {t("batch.upload.preview") || "Предпросмотр"} ({preview.length})
            </h4>
            <div className="nt-util__max-h-60 nt-util__overflow-auto nt-util__border nt-util__rounded">
              <table className="nt-util__w-full">
                <thead className="nt-util__bg-gray-light">
                  <tr>
                    <th className="nt-util__p-2 nt-util__text-left">#</th>
                    <th className="nt-util__p-2 nt-util__text-left">
                      {t("cards.front") || "Лицевая сторона"}
                    </th>
                    <th className="nt-util__p-2 nt-util__text-left">
                      {t("cards.back") || "Обратная сторона"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((item) => (
                    <tr key={item.line} className="nt-util__border-b">
                      <td className="nt-util__p-2">{item.line}</td>
                      <td className="nt-util__p-2">{item.front}</td>
                      <td className="nt-util__p-2">{item.back}</td>
                    </tr>
                  ))}
                  {preview.length > 10 && (
                    <tr>
                      <td
                        colSpan="3"
                        className="nt-util__p-2 nt-util__text-center nt-util__text-gray"
                      >
                        ... и еще {preview.length - 10} карточек
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="nt-modal__footer">
        <div className="nt-modal__actions">
          <button
            type="button"
            className="nt-btn nt-btn--secondary"
            onClick={onClose}
            disabled={isUploading}
          >
            {t("cards.cancel") || "Отмена"}
          </button>
          <button
            type="button"
            className="nt-btn nt-btn--primary"
            onClick={handleSubmit}
            disabled={!file || preview.length === 0 || isUploading}
          >
            {isUploading
              ? t("card.uploading") || "Создание..."
              : t("batch.upload.create") ||
                `Создать ${preview.length} карточек`}
          </button>
        </div>
      </div>
    </AnimatedModal>
  );
};

export default BatchUploadModal;
