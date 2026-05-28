import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignature } from "../../../utils/icons";

/**
 * Модальное окно для смены имени
 */
export default function NameModal({
  nameForm,
  setNameForm,
  onClose,
  onSubmit,
}) {
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
          <FontAwesomeIcon icon={faSignature} style={{ marginRight: "8px" }} />
          Сменить имя
        </h2>

        <div className="profile-form-group">
          <label className="profile-label">Новое имя:</label>
          <input
            type="text"
            value={nameForm.new_name}
            onChange={(e) =>
              setNameForm({ ...nameForm, new_name: e.target.value })
            }
            className="profile-input"
            placeholder="Ваше имя"
            autoFocus
          />
        </div>

        <div className="profile-form-group">
          <label className="profile-label">Текущий пароль:</label>
          <input
            type="password"
            value={nameForm.current_password}
            onChange={(e) =>
              setNameForm({ ...nameForm, current_password: e.target.value })
            }
            className="profile-input"
            placeholder="••••••••"
          />
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="profile-btn-secondary">
            Отмена
          </button>
          <button onClick={onSubmit} className="profile-btn-primary">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
