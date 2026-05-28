import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey } from "../../../utils/icons";
import { PASSWORD_STRENGTH_LEVELS } from "../utils/passwordUtils";

/**
 * Модальное окно для смены пароля
 */
export default function PasswordModal({
  passwordForm,
  setPasswordForm,
  passwordStrength,
  onClose,
  onSubmit,
}) {
  const strengthLevel = PASSWORD_STRENGTH_LEVELS[passwordStrength];

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
          <FontAwesomeIcon icon={faKey} style={{ marginRight: "8px" }} />
          Сменить пароль
        </h2>

        <div className="profile-form-group">
          <label className="profile-label">Текущий пароль:</label>
          <input
            type="password"
            value={passwordForm.current_password}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                current_password: e.target.value,
              })
            }
            className="profile-input"
            placeholder="••••••••"
          />
        </div>

        <div className="profile-form-group">
          <label className="profile-label">Новый пароль (мин. 6 символов):</label>
          <input
            type="password"
            value={passwordForm.new_password}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, new_password: e.target.value })
            }
            className="profile-input"
            placeholder="Новый пароль"
          />

          {/* Индикатор сложности */}
          {passwordForm.new_password && (
            <div className="password-strength-container">
              <div className="password-strength-bar">
                <div
                  className="password-strength-fill"
                  style={{
                    width: `${(passwordStrength / 5) * 100}%`,
                    background: strengthLevel.color,
                  }}
                />
              </div>
              <span
                className="password-strength-label"
                style={{ color: strengthLevel.color }}
              >
                {strengthLevel.label}
              </span>
            </div>
          )}
        </div>

        <div className="profile-form-group">
          <label className="profile-label">Подтвердите пароль:</label>
          <input
            type="password"
            value={passwordForm.confirm_password}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                confirm_password: e.target.value,
              })
            }
            className="profile-input"
            placeholder="Повторите пароль"
          />
          {passwordForm.confirm_password &&
            passwordForm.confirm_password !== passwordForm.new_password && (
              <span style={{ color: "var(--nt-error, #e74c3c)", fontSize: "13px", marginTop: "4px", display: "block" }}>
                ⚠️ Пароли не совпадают
              </span>
            )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="profile-btn-secondary">
            Отмена
          </button>
          <button onClick={onSubmit} className="profile-btn-primary">
            Изменить пароль
          </button>
        </div>
      </div>
    </div>
  );
}
