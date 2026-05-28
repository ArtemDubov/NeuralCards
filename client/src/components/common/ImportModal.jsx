import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import importExportApi from "../../features/cardSets/api/importExportApi";
import SimpleToggle from "./SimpleToggle";
import {
  faDownload,
  faHourglassHalf,
  faLanguage,
  faArrowRight,
  faFile,
  faCircleInfo,
  faUpload,
} from "../../utils/icons";

const LANG_OPTIONS = [
  { code: "auto", label: "Автоопределение" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
];

export default function ImportModal({ onClose, onImport, currentTheme }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [importMode, setImportMode] = useState("new");
  const [targetSetId, setTargetSetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const [frontLang, setFrontLang] = useState("auto");
  const [backLang, setBackLang] = useState("auto");

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content
        .split("\n")
        .filter(
          (line) =>
            line.trim() && !line.startsWith("---") && !line.startsWith("//"),
        );
      setPreview({
        name: selectedFile.name,
        size: selectedFile.size,
        linesCount: lines.length,
      });
    };
    reader.readAsText(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Выберите файл");
      return;
    }

    if (importMode === "new" && !title) {
      setError("Введите название набора");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let result;
      if (importMode === "new") {
        result = await importExportApi.importToNewSet(
          title,
          description,
          isPublic,
          file,
          frontLang,
          backLang,
        );
      } else {
        if (!targetSetId) {
          throw new Error("Выберите набор для импорта");
        }
        result = await importExportApi.importToSet(
          parseInt(targetSetId),
          file,
          frontLang,
          backLang,
        );
      }

      onImport(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const th = currentTheme;
  const fileInputId = "import-file-input";

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={{
          ...styles.modal,
          background: th.surface,
          color: th.text,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка */}
        <div style={styles.header}>
          <div style={styles.titleRow}>
            <FontAwesomeIcon
              icon={faDownload}
              style={{
                color: th.primary,
                marginRight: "8px",
                fontSize: "18px",
              }}
            />
            <h2 style={{ margin: 0, color: th.text, fontSize: "17px" }}>
              Импорт карточек
            </h2>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              ...styles.error,
              background: `${th.error}15`,
              color: th.error,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Режим: новый / существующий */}
          <div style={styles.modeRow}>
            <label
              style={{
                ...styles.modeBtn,
                background:
                  importMode === "new"
                    ? `linear-gradient(135deg, ${th.primary}22, ${th.primary}11)`
                    : th.backgroundSecondary || "var(--nt-background-secondary)",
                borderColor: importMode === "new" ? th.primary : "transparent",
                color: th.text,
              }}
            >
              <input
                type="radio"
                checked={importMode === "new"}
                onChange={() => setImportMode("new")}
              />
              <span style={styles.modeText}>В новый</span>
            </label>
            <label
              style={{
                ...styles.modeBtn,
                background:
                  importMode === "existing"
                    ? `linear-gradient(135deg, ${th.primary}22, ${th.primary}11)`
                    : th.backgroundSecondary || "var(--nt-background-secondary)",
                borderColor:
                  importMode === "existing" ? th.primary : "transparent",
                color: th.text,
              }}
            >
              <input
                type="radio"
                checked={importMode === "existing"}
                onChange={() => setImportMode("existing")}
              />
              <span style={styles.modeText}>В существующий</span>
            </label>
          </div>

          {/* Поля для нового */}
          {importMode === "new" && (
            <>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Название набора</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 32))}
                  style={{
                    ...styles.textInput,
                    background: th.background,
                    color: th.text,
                    borderColor: th.border,
                  }}
                  placeholder="Например: Испанские слова A1"
                  required
                />
                <div style={styles.counter}>
                  <span
                    style={{
                      color: title.length >= 32 ? th.error : th.textMuted,
                    }}
                  >
                    {title.length}/32
                  </span>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Описание</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 128))}
                  style={{
                    ...styles.textarea,
                    background: th.background,
                    color: th.text,
                    borderColor: th.border,
                  }}
                  placeholder="Описание набора..."
                  rows={2}
                  maxLength={128}
                />
                <div style={styles.counter}>
                  <span
                    style={{
                      color:
                        description.length >= 128 ? th.error : th.textMuted,
                    }}
                  >
                    {description.length}/128
                  </span>
                </div>
              </div>

              <div style={styles.toggleRow}>
                <span style={{ ...styles.toggleLabel, color: th.text }}>
                  Публичный набор
                </span>
                <SimpleToggle checked={isPublic} onChange={setIsPublic} currentTheme={th} />
              </div>
            </>
          )}

          {/* ID существующего */}
          {importMode === "existing" && (
            <div style={styles.field}>
              <label style={styles.fieldLabel}>ID набора</label>
              <input
                type="number"
                value={targetSetId}
                onChange={(e) => setTargetSetId(e.target.value)}
                style={{
                  ...styles.textInput,
                  background: th.background,
                  color: th.text,
                  borderColor: th.border,
                }}
                placeholder="Например: 1"
              />
              <div style={styles.hint}>
                ID можно увидеть в URL страницы набора
              </div>
            </div>
          )}

          {/* Языки */}
          <div
            style={{
              ...styles.langBox,
              background: `${th.primary}08`,
              borderColor: `${th.primary}20`,
            }}
          >
            <div style={styles.langHeader}>
              <FontAwesomeIcon
                icon={faLanguage}
                style={{
                  color: th.primary,
                  marginRight: "6px",
                  fontSize: "13px",
                }}
              />
              <span
                style={{ color: th.text, fontWeight: 600, fontSize: "13px" }}
              >
                Языки сторон
              </span>
            </div>
            <div style={styles.langRow}>
              <div style={styles.langBlock}>
                <label style={styles.langLabel}>
                  <span style={{ ...styles.langDot, background: th.primary }} />
                  Лицевая
                </label>
                <select
                  value={frontLang}
                  onChange={(e) => setFrontLang(e.target.value)}
                  style={{
                    ...styles.langSelect,
                    background: th.background,
                    color: th.text,
                    borderColor: th.border,
                  }}
                >
                  {LANG_OPTIONS.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.langArrow}>
                <FontAwesomeIcon icon={faArrowRight} />
              </div>

              <div style={styles.langBlock}>
                <label style={styles.langLabel}>
                  <span style={{ ...styles.langDot, background: th.success }} />
                  Обратная
                </label>
                <select
                  value={backLang}
                  onChange={(e) => setBackLang(e.target.value)}
                  style={{
                    ...styles.langSelect,
                    background: th.background,
                    color: th.text,
                    borderColor: th.border,
                  }}
                >
                  {LANG_OPTIONS.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Файл */}
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Файл с карточками</label>
            <div
              style={{
                ...styles.fileBox,
                borderColor: file ? th.primary : th.border,
                background: file
                  ? `${th.primary}06`
                  : th.backgroundSecondary || "var(--nt-background-secondary)",
              }}
            >
              {file ? (
                <div style={styles.fileInfo}>
                  <FontAwesomeIcon
                    icon={faFile}
                    style={{ color: th.success, fontSize: "16px" }}
                  />
                  <div>
                    <div
                      style={{
                        color: th.text,
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      {file.name}
                    </div>
                    <div style={{ color: th.textMuted, fontSize: "11px" }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    style={styles.fileRemoveBtn}
                  >
                    ✕
                  </button>
                </div>
              ) : null}

              <label
                htmlFor={fileInputId}
                style={{
                  ...styles.uploadBtn,
                  background: `linear-gradient(135deg, ${th.primary}, ${th.secondary})`,
                  color: "#fff",
                }}
              >
                <FontAwesomeIcon
                  icon={faUpload}
                  style={{ marginRight: "6px" }}
                />
                Выбрать файл
              </label>
              <input
                id={fileInputId}
                type="file"
                accept=".csv,.json,.txt"
                onChange={handleFileSelect}
                style={{ display: "none" }}
                required={!file}
              />
            </div>
          </div>

          {/* Статистика */}
          {preview && (
            <div style={styles.previewBox}>
              <FontAwesomeIcon
                icon={faCircleInfo}
                style={{
                  color: th.primary,
                  marginRight: "6px",
                  fontSize: "13px",
                }}
              />
              <span style={{ color: th.text, fontSize: "13px" }}>
                Найдено <strong>{preview.linesCount}</strong> карточек
                {file && (
                  <span style={{ color: th.textMuted }}> — {file.name}</span>
                )}
              </span>
            </div>
          )}

          {/* Кнопки */}
          <div style={styles.btnRow}>
            <button
              type="button"
              onClick={onClose}
              style={{
                ...styles.btnSecondary,
                background: th.backgroundSecondary,
                color: th.text,
              }}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              style={{
                ...styles.btnPrimary,
                background: `linear-gradient(135deg, ${th.primary}, ${th.secondary})`,
                color: "#fff",
                opacity: loading || !file ? 0.6 : 1,
              }}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon
                    icon={faHourglassHalf}
                    spin
                    style={{ marginRight: "6px" }}
                  />
                  Импорт...
                </>
              ) : (
                "Импортировать"
              )}
            </button>
          </div>
        </form>

        {/* Подсказка формата */}
        <div
          style={{
            ...styles.formatBox,
            background: `${th.primary}06`,
          }}
        >
          <FontAwesomeIcon
            icon={faCircleInfo}
            style={{
              color: th.primary,
              marginRight: "6px",
              fontSize: "12px",
              flexShrink: 0,
            }}
          />
          <div
            style={{
              fontSize: "12px",
              color: th.textSecondary,
              lineHeight: "1.5",
            }}
          >
            <strong>CSV/TXT:</strong>{" "}
            <code style={styles.code}>вопрос;ответ</code>
            {" · "}
            <strong>JSON:</strong>{" "}
            <code style={styles.code}>{`[{"front":"...","back":"..."}]`}</code>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "10px",
  },
  modal: {
    padding: "22px",
    borderRadius: "14px",
    width: "100%",
    maxWidth: "460px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "var(--nt-card-shadow, 0 20px 60px rgba(0,0,0,0.3))",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
  },
  closeBtn: {
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "8px",
    background: "rgba(0,0,0,0.06)",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#999",
    lineHeight: 1,
  },
  error: {
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "14px",
    fontWeight: 500,
    fontSize: "13px",
  },
  modeRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "14px",
  },
  modeBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "2px solid transparent",
    flex: 1,
    justifyContent: "center",
    fontWeight: 600,
  },
  modeText: {
    fontSize: "12px",
  },
  field: {
    marginBottom: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  fieldLabel: {
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--nt-text-secondary, #666)",
  },
  textInput: {
    padding: "10px 12px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  textarea: {
    padding: "10px 12px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "inherit",
    outline: "none",
  },
  counter: {
    fontSize: "11px",
    textAlign: "right",
  },
  toggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  toggleLabel: {
    fontSize: "14px",
    fontWeight: 500,
  },
  hint: {
    fontSize: "12px",
    color: "#999",
  },

  /* Языки */
  langBox: {
    border: "1px solid",
    borderRadius: "10px",
    padding: "12px",
    marginBottom: "12px",
  },
  langHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
  },
  langRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  langBlock: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  langLabel: {
    fontSize: "13px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  langDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    display: "inline-block",
  },
  langSelect: {
    padding: "8px 10px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
  },
  langArrow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#999",
    fontSize: "14px",
    flexShrink: 0,
  },

  /* Файл */
  fileBox: {
    border: "2px dashed #e0e0e0",
    borderRadius: "10px",
    padding: "14px",
    textAlign: "center",
    transition: "border-color 0.2s, background 0.2s",
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 10px",
    marginBottom: "10px",
    borderRadius: "8px",
    background: "rgba(46,204,113,0.08)",
  },
  fileRemoveBtn: {
    width: "24px",
    height: "24px",
    border: "none",
    borderRadius: "50%",
    background: "rgba(231,76,60,0.15)",
    color: "var(--nt-error)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    marginLeft: "auto",
    lineHeight: 1,
  },
  uploadBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "9px 22px",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },

  /* Превью */
  previewBox: {
    display: "flex",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "rgba(0,0,0,0.03)",
    marginBottom: "12px",
  },

  /* Кнопки */
  btnRow: {
    display: "flex",
    gap: "8px",
    justifyContent: "flex-end",
    marginBottom: "12px",
  },
  btnPrimary: {
    padding: "10px 24px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  btnSecondary: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
  },

  /* Формат */
  formatBox: {
    display: "flex",
    alignItems: "flex-start",
    padding: "10px 14px",
    borderRadius: "8px",
    gap: "8px",
  },
  code: {
    background: "rgba(0,0,0,0.06)",
    padding: "2px 6px",
    borderRadius: "4px",
    fontFamily: "monospace",
    fontSize: "12px",
  },
};
