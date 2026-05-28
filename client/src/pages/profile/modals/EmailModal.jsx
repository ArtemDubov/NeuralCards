import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "../../../utils/icons";

/**
 * Модальное окно для смены email
 */
export default function EmailModal({
  emailForm,
  setEmailForm,
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
          <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: "8px" }} />
          Сменить email
        </h2>

        <div className="profile-form-group">
          <label className="profile-label">Новый email:</label>
          <input
            type="email"
            value={emailForm.new_email}
            onChange={(e) =>
              setEmailForm({ ...emailForm, new_email: e.target.value })
            }
            className="profile-input"
            placeholder="new@example.com"
          />
        </div>

        <div className="profile-form-group">
          <label className="profile-label">Текущий пароль:</label>
          <input
            type="password"
            value={emailForm.current_password}
            onChange={(e) =>
              setEmailForm({ ...emailForm, current_password: e.target.value })
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
            Изменить email
          </button>
        </div>
      </div>
    </div>
  );
}
