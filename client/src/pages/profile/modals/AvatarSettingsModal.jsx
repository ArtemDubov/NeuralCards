import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faFont, faSmile, faXmark } from "../../../utils/icons";
import AvatarDisplay from "../../../components/common/AvatarDisplay";

/**
 * Модальное окно для комплексных настроек аватара
 * Логика: либо буква (первая буква имени), либо эмодзи, либо изображение
 */
export default function AvatarSettingsModal({
  formData,
  setFormData,
  user,
  onClose,
  onSave,
}) {
  const [localData, setLocalData] = useState({ ...formData });
  const [colorMode, setColorMode] = useState("preset"); // preset или custom
  const [customColor, setCustomColor] = useState(formData.avatar_color || "var(--nt-primary)");
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);

  // Блокируем прокрутку при открытой модалке
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Обработчик Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const presetColors = [
    "#667eea", "#f093fb", "#4facfe", "#43e97b", "#fa709a",
    "#fee140", "#30cfd0", "#a8edea", "#ff9a9e", "#ffecd2",
    "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7",
  ];

  // Получаем первую букву имени для режима "буква"
  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  // Создаём объект пользователя для AvatarDisplay
  const previewUserData = {
    id: user?.id,
    name: user?.name,
    avatar_type: localData.avatar_type || "letter",
    avatar_emoji: localData.avatar_emoji,
    avatar_color: localData.avatar_color || "var(--nt-primary)",
    avatar_url: localData.avatar_url || null,
  };

  // Обработчик выбора типа аватара
  const handleTypeSelect = (type) => {
    setLocalData(prev => {
      let newEmoji = prev.avatar_emoji;
      if (type === "letter") {
        newEmoji = "";
      } else if (type === "emoji" && !prev.avatar_emoji) {
        newEmoji = "😀";
      }

      return {
        ...prev,
        avatar_type: type,
        avatar_emoji: newEmoji,
      };
    });
  };

  // Сохранение
  const handleSave = async () => {
    await onSave(localData);
  };

  return ReactDOM.createPortal(
    <div
      style={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          ...styles.modal,
          background: "var(--nt-surface, #ffffff)",
          color: "var(--nt-text, #333)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка модалки */}
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>
            Настройки аватара
          </h2>
          <button onClick={onClose} style={styles.closeButton}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Превью аватара */}
        <div style={styles.previewContainer}>
          <AvatarDisplay
            user={previewUserData}
            size={80}
          />
        </div>

        {/* Выбор типа аватара */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Тип аватара</p>
          
          <div style={styles.typeGrid}>
            {/* Буква */}
            <button
              onClick={() => handleTypeSelect("letter")}
              style={{
                ...styles.typeCard,
                border: `2px solid ${localData.avatar_type === "letter" ? "var(--nt-primary, #667eea)" : "var(--nt-border, #e0e0e0)"}`,
                background: localData.avatar_type === "letter" ? "var(--nt-primary, #667eea)15" : "transparent",
              }}
            >
              <FontAwesomeIcon icon={faFont} style={{ fontSize: "24px", marginBottom: "8px" }} />
              <span style={{ fontSize: "13px", fontWeight: "500", marginBottom: "8px" }}>Буква</span>
              <span style={{ 
                fontSize: "28px", 
                fontWeight: "bold",
                color: localData.avatar_type === "letter" ? "var(--nt-primary, #667eea)" : "inherit"
              }}>
                {firstLetter}
              </span>
            </button>

            {/* Эмодзи */}
            <button
              onClick={() => handleTypeSelect("emoji")}
              style={{
                ...styles.typeCard,
                border: `2px solid ${localData.avatar_type === "emoji" ? "var(--nt-primary, #667eea)" : "var(--nt-border, #e0e0e0)"}`,
                background: localData.avatar_type === "emoji" ? "var(--nt-primary, #667eea)15" : "transparent",
              }}
            >
              <FontAwesomeIcon icon={faSmile} style={{ fontSize: "24px", marginBottom: "8px" }} />
              <span style={{ fontSize: "13px", fontWeight: "500", marginBottom: "8px" }}>Эмодзи</span>
              <span style={{ fontSize: "28px" }}>
                {localData.avatar_emoji || "😀"}
              </span>
            </button>

            {/* Фото */}
            <button
              onClick={() => handleTypeSelect("url")}
              style={{
                ...styles.typeCard,
                border: `2px solid ${localData.avatar_type === "url" ? "var(--nt-primary, #667eea)" : "var(--nt-border, #e0e0e0)"}`,
                background: localData.avatar_type === "url" ? "var(--nt-primary, #667eea)15" : "transparent",
              }}
            >
              <FontAwesomeIcon icon={faUpload} style={{ fontSize: "24px", marginBottom: "8px" }} />
              <span style={{ fontSize: "13px", fontWeight: "500", marginBottom: "8px" }}>Фото</span>
              {localData.avatar_url ? (
                <img 
                  src={localData.avatar_url} 
                  alt="" 
                  style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: "12px", color: "var(--nt-text-secondary, #999)" }}>Нет</span>
              )}
            </button>
          </div>
        </div>

        {/* Загрузка фото (только если выбран тип url) */}
        {localData.avatar_type === "url" && (
          <div style={styles.section}>
            {!localData.avatar_url ? (
              <>
                <p style={styles.sectionTitle}>Загрузите фотографию</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith("image/")) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setLocalData(prev => ({
                          ...prev,
                          avatar_url: reader.result,
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ display: "none" }}
                  id="avatar-photo-input-modal"
                />
                <label 
                  htmlFor="avatar-photo-input-modal"
                  style={styles.uploadArea}
                >
                  <FontAwesomeIcon 
                    icon={faUpload} 
                    style={{ fontSize: "32px", color: "var(--nt-text-secondary, #999)", marginBottom: "8px" }}
                  />
                  <p style={{ fontSize: "14px", fontWeight: "500", margin: 0, color: "var(--nt-text-secondary, #666)" }}>
                    Нажмите для загрузки
                  </p>
                </label>
              </>
            ) : (
              <>
                <p style={styles.sectionTitle}>Фото загружено</p>
                <div style={styles.buttonGroup}>
                  <button
                    onClick={() => {
                      document.getElementById("avatar-photo-input-modal")?.click();
                    }}
                    className="profile-btn-primary"
                  >
                    Заменить
                  </button>
                  <button
                    onClick={() => {
                      setLocalData(prev => ({
                        ...prev,
                        avatar_url: "",
                        avatar_type: "letter",
                      }));
                    }}
                    className="profile-btn-danger-outline"
                  >
                    Удалить
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Выбор эмодзи (только если выбран тип emoji) */}
        {localData.avatar_type === "emoji" && (
          <div style={styles.section}>
            <p style={styles.sectionTitle}>Выберите эмодзи</p>
            
            <div style={{
              ...styles.emojiGrid,
              gridTemplateColumns: "repeat(10, 1fr)",
              maxHeight: "150px",
            }}>
              {["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", 
                "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩",
                "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪",
                "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨",
                "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥",
                "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕",
                "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯",
                "🤠", "🥳", "😎", "🤓", "🧐", "😕", "😟", "🙁",
                "☹️", "😮", "😯", "😲", "😳", "🥺", "😦", "😧",
                "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣",
                "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠",
                "🤬", "😈", "👿", "💀", "☠️", "💩", "🤡", "👹",
                "👺", "👻", "👽", "👾", "🤖"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setLocalData(prev => ({ ...prev, avatar_emoji: emoji }))}
                  style={{
                    ...styles.emojiButton,
                    fontSize: "20px",
                    border: localData.avatar_emoji === emoji ? "2px solid var(--nt-primary, #667eea)" : "2px solid transparent",
                    background: localData.avatar_emoji === emoji ? "var(--nt-primary, #667eea)15" : "transparent",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Выбор цвета фона (для letter и emoji) */}
        {(localData.avatar_type === "letter" || localData.avatar_type === "emoji") && (
          <div style={styles.section}>
            <p style={styles.sectionTitle}>Цвет фона</p>
            
            <div style={styles.colorGrid}>
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setLocalData(prev => ({ ...prev, avatar_color: color }));
                    setColorMode("preset");
                  }}
                  style={{
                    ...styles.colorButton,
                    background: color,
                    border: localData.avatar_color === color && colorMode === "preset" ? "2px solid #333" : "2px solid transparent",
                  }}
                />
              ))}
              {/* Кнопка кастомного цвета - показывает выбранный цвет или белый с + */}
              <button
                onClick={() => setShowCustomColorPicker(true)}
                style={{
                  ...styles.colorButton,
                  background: colorMode === "custom" ? customColor : "var(--nt-surface)",
                  border: colorMode === "custom" ? "2px solid var(--nt-text)" : "2px solid var(--nt-border, #e0e0e0)",
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: colorMode === "custom" ? '#fff' : '#000',
                  textShadow: colorMode === "custom" ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                }}>+</span>
              </button>
            </div>
          </div>
        )}

        {/* Кастомный color picker по центру экрана */}
        {showCustomColorPicker && (
          <div 
            style={styles.customColorOverlay}
            onClick={() => setShowCustomColorPicker(false)}
          >
            <div 
              style={styles.customColorPickerContainer}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setLocalData(prev => ({ ...prev, avatar_color: e.target.value }));
                  setColorMode("custom");
                }}
                autoFocus
                onBlur={() => setShowCustomColorPicker(false)}
                style={styles.fullScreenColorInput}
              />
            </div>
          </div>
        )}

        {/* Кнопки действий */}
        <div style={styles.actions}>
          <button 
            onClick={onClose} 
            style={styles.cancelButton}
          >
            Отмена
          </button>
          <button 
            onClick={handleSave} 
            style={styles.saveButton}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>,
    document.body
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
    zIndex: 10000,
  },
  modal: {
    position: "relative",
    padding: "20px",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "480px",
    maxHeight: "75vh",
    overflow: "auto",
    boxShadow: "var(--nt-card-shadow, 0 8px 32px rgba(0,0,0,0.3))",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid var(--nt-border, #e0e0e0)",
  },
  closeButton: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(0,0,0,0.08)",
    color: "var(--nt-text-secondary, #666)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    transition: "background 0.2s",
  },
  previewContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  section: {
    marginBottom: "20px",
  },
  sectionTitle: {
    textAlign: "center",
    marginBottom: "10px",
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--nt-text, #333)",
  },
  typeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
  },
  typeCard: {
    padding: "14px 10px",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  uploadArea: {
    padding: "20px",
    border: "2px dashed var(--nt-border, #ddd)",
    borderRadius: "10px",
    cursor: "pointer",
    textAlign: "center",
    transition: "border-color 0.2s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
  },
  emojiGrid: {
    display: "grid",
    gap: "6px",
    padding: "6px",
    overflowY: "auto",
  },
  emojiButton: {
    width: "100%",
    aspectRatio: "1",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  colorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(9, 1fr)",
    gap: "6px",
    padding: "6px",
  },
  colorButton: {
    width: "100%",
    aspectRatio: "1",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "transform 0.2s, border 0.2s",
  },
  customColorOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 11000,
  },
  customColorPickerContainer: {
    padding: "20px",
    background: "var(--nt-surface, #ffffff)",
    borderRadius: "16px",
    boxShadow: "var(--nt-card-shadow, 0 8px 32px rgba(0,0,0,0.3))",
  },
  fullScreenColorInput: {
    width: "200px",
    height: "200px",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    background: "transparent",
  },
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    paddingTop: "12px",
    borderTop: "1px solid var(--nt-border, #e0e0e0)",
  },
  cancelButton: {
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    background: "var(--nt-background-secondary, #f0f0f0)",
    color: "var(--nt-text, #333)",
    transition: "all 0.2s",
  },
  saveButton: {
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    background: "linear-gradient(135deg, var(--nt-primary, #667eea), var(--nt-secondary, #764ba2))",
    color: "#fff",
    transition: "all 0.2s",
  },
  customColorOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10001,
  },
  customColorPickerContainer: {
    background: "var(--nt-surface, #ffffff)",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "var(--nt-card-shadow, 0 8px 32px rgba(0,0,0,0.3))",
  },
  fullScreenColorInput: {
    width: "100%",
    height: "50px",
    border: "none",
    cursor: "pointer",
    background: "transparent",
  },
};