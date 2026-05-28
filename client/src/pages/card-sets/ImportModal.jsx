import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faUpload } from "../../utils/icons";
import { LanguageSelector } from "../../features/cardSets/components/CardSideEditor";

export default function ImportModal({ isOpen, onClose, onImport, existingSets = [] }) {
  const [file, setFile] = useState(null);
  const [importMode, setImportMode] = useState("new"); // 'new' или 'existing'
  const [selectedSetId, setSelectedSetId] = useState("");
  const [setName, setSetName] = useState("");
  const [description, setDescription] = useState("");
  const [frontLang, setFrontLang] = useState("ru");
  const [backLang, setBackLang] = useState("ru");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showValidation, setShowValidation] = useState(false);

  // Валидация
  const nameValid = setName.trim().length >= 3 && setName.trim().length <= 100;
  const descriptionValid = !description || description.trim().length <= 500;

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validTypes = [
      "text/csv",
      "text/plain",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const validExtensions = [".csv", ".txt", ".xls", ".xlsx"];
    const hasValidExtension = validExtensions.some((ext) =>
      selectedFile.name.toLowerCase().endsWith(ext),
    );

    if (!hasValidExtension && !validTypes.includes(selectedFile.type)) {
      setError("Поддерживаются только файлы CSV, TXT, XLS, XLSX");
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  const handleImport = async () => {
    if (!file) {
      setError("Выберите файл");
      return;
    }

    // Валидация в зависимости от режима
    if (importMode === "new") {
      if (!nameValid) {
        setShowValidation(true);
        setError("Название должно быть от 3 до 100 символов");
        return;
      }
      if (!descriptionValid) {
        setShowValidation(true);
        setError("Описание не должно превышать 500 символов");
        return;
      }
    }

    if (importMode === "existing" && !selectedSetId) {
      setError("Выберите набор");
      return;
    }

    setShowValidation(false);
    setLoading(true);
    setError("");

    try {
      await onImport({
        file,
        importMode,
        setId: selectedSetId || null,
        setName: setName.trim(),
        description: description.trim(),
        frontLang,
        backLang,
      });
      resetForm();
      onClose();
    } catch (err) {
      setError(err.message || "Ошибка при импорте");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setImportMode("new");
    setSelectedSetId("");
    setSetName("");
    setDescription("");
    setFrontLang("ru");
    setBackLang("ru");
    setError("");
    setShowValidation(false);
  };

  return (
    <div className="modal-overlay card-set-overlay" onClick={onClose}>
      <div className="modal-container card-set-modal" onClick={(e) => e.stopPropagation()}>
        {/* Шапка */}
        <div className="modal-header card-set-header">
          <div className="card-set-header-left">
            <h2 className="modal-title">Импорт</h2>
            <div className="import-modal-tabs">
              <button
                type="button"
                onClick={() => setImportMode("new")}
                className={`import-modal-tab ${importMode === "new" ? "active" : ""}`}
              >
                Новый набор
              </button>
              <button
                type="button"
                onClick={() => setImportMode("existing")}
                className={`import-modal-tab ${importMode === "existing" ? "active" : ""}`}
              >
                В существующий
              </button>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn card-set-close-btn">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Тело модалки */}
        <div className="modal-body">
          {/* Загрузка файла */}
          <div className="modal-form-group card-set-form-group">
            <label className="modal-form-label card-set-label">Файл с карточками</label>
            <div className="card-set-upload-area">
              <input
                type="file"
                accept=".csv,.txt,.xls,.xlsx"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="import-file-input"
              />
              <label htmlFor="import-file-input" style={{ cursor: "pointer", display: "block" }}>
                <FontAwesomeIcon icon={faUpload} className="card-set-upload-icon" />
                <div className="card-set-upload-text">
                  Нажмите для выбора файла или перетащите сюда
                </div>
                {file && <div className="card-set-file-name">{file.name}</div>}
              </label>
            </div>
          </div>

          {/* Выбор существующего набора */}
          {importMode === "existing" && existingSets.length > 0 && (
            <div className="modal-form-group card-set-form-group">
              <label className="modal-form-label card-set-label">Выберите набор *</label>
              <select
                value={selectedSetId}
                onChange={(e) => setSelectedSetId(e.target.value)}
                className="modal-form-input card-set-select"
              >
                <option value="">-- Выберите набор --</option>
                {existingSets.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Название набора (только для нового режима) */}
          {importMode === "new" && (
            <div className="modal-form-group card-set-form-group">
              <label className="modal-form-label card-set-label">
                Название набора *
                {showValidation && !nameValid && (
                  <span className="card-set-validation-error"> (мин. 3 символа)</span>
                )}
              </label>
              <input
                type="text"
                value={setName}
                onChange={(e) => {
                  setSetName(e.target.value);
                  setShowValidation(false);
                }}
                placeholder="Введите название набора"
                maxLength={100}
                className={`modal-form-input ${showValidation && !nameValid ? 'input-error' : ''}`}
              />
              <div className="card-set-char-counter">
                {setName.length}/100
              </div>
            </div>
          )}

          {/* Описание (только для нового режима) */}
          {importMode === "new" && (
            <div className="modal-form-group card-set-form-group">
              <label className="modal-form-label card-set-label">
                Описание
                {showValidation && !descriptionValid && (
                  <span className="card-set-validation-error"> (макс. 500 символов)</span>
                )}
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setShowValidation(false);
                }}
                placeholder="Необязательно"
                rows={2}
                maxLength={500}
                className={`modal-form-textarea ${showValidation && !descriptionValid ? 'input-error' : ''}`}
              />
              <div className="card-set-char-counter">
                {description.length}/500
              </div>
            </div>
          )}

          {/* Языки озвучки */}
          <div className="modal-form-group card-set-form-group">
            <label className="modal-form-label card-set-label">Языки озвучки</label>
            <div className="card-set-lang-row">
              <div>
                <label className="card-set-lang-side-label">
                  Основная сторона
                </label>
                <LanguageSelector 
                  value={frontLang} 
                  onChange={setFrontLang}
                />
              </div>
              <div className="card-set-lang-divider"></div>
              <div>
                <label className="card-set-lang-side-label">
                  Обратная сторона
                </label>
                <LanguageSelector 
                  value={backLang} 
                  onChange={setBackLang}
                />
              </div>
            </div>
          </div>

          {/* Ошибка */}
          {error && <div className="card-set-error">{error}</div>}
        </div>

        {/* Футер с кнопками */}
        <div className="modal-footer card-set-actions">
          <button onClick={onClose} className="modal-btn-cancel card-set-cancel-button">
            Отмена
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="modal-btn-submit card-set-import-button"
          >
            {loading ? "Импортируется..." : "Импортировать"}
          </button>
        </div>
      </div>
    </div>
  );
}
