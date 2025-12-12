import React, { useState } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useAuthStore } from "../../../../shared/stores/authStore";

const ChangePasswordForm = () => {
  const { t } = useAppStore();
  const { updateUserPassword, isLoading } = useAuthStore();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = t("profile.security.currentPasswordRequired");
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = t("profile.security.newPasswordRequired");
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = t("profile.security.passwordTooShort");
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = t("profile.security.samePassword");
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = t("profile.security.confirmPasswordRequired");
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = t("profile.security.passwordsDontMatch");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      await updateUserPassword(formData.currentPassword, formData.newPassword);
      setSuccessMessage(t("profile.security.passwordUpdated"));
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setErrorMessage(error.message || t("profile.security.updateFailed"));
    }
  };

  const resetForm = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setSuccessMessage("");
    setErrorMessage("");
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = [
      t("profile.security.weak"),
      t("profile.security.fair"),
      t("profile.security.good"),
      t("profile.security.strong"),
      t("profile.security.excellent"),
    ];

    const colors = [
      "var(--nt-color-error)",
      "var(--nt-color-warning)",
      "var(--nt-color-info)",
      "var(--nt-color-success)",
      "var(--nt-color-primary)",
    ];

    return {
      score,
      label: labels[score],
      color: colors[score],
    };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <form onSubmit={handleSubmit}>
      {/* Текущий пароль */}
      <div className="nt-form__group nt-util__mb-md">
        <label htmlFor="currentPassword" className="nt-form__label">
          {t("profile.security.currentPassword")}
        </label>
        <div className="nt-util__relative">
          <input
            type={showPasswords.current ? "text" : "password"}
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className={`nt-form__input ${
              errors.currentPassword ? "nt-form__input--error" : ""
            }`}
            placeholder={t("profile.security.currentPasswordPlaceholder")}
            disabled={isLoading}
            autoComplete="current-password"
            style={{
              borderColor: errors.currentPassword
                ? "var(--nt-color-error)"
                : undefined,
            }}
          />
          <button
            type="button"
            className="nt-util__absolute nt-util__right-sm nt-util__top-1/2 nt-util__transform -nt-util__translate-y-1/2"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--nt-text-muted)",
              cursor: "pointer",
              padding: "var(--nt-space-xs)",
            }}
            onClick={() => togglePasswordVisibility("current")}
            tabIndex="-1"
          >
            <i
              className={`fas fa-${
                showPasswords.current ? "eye-slash" : "eye"
              }`}
            ></i>
          </button>
        </div>
        {errors.currentPassword && (
          <div
            className="nt-form__error nt-util__mt-xs"
            style={{
              color: "var(--nt-color-error)",
            }}
          >
            <i className="fas fa-exclamation-circle nt-util__mr-xs"></i>
            {errors.currentPassword}
          </div>
        )}
      </div>

      {/* Новый пароль */}
      <div className="nt-form__group nt-util__mb-md">
        <label htmlFor="newPassword" className="nt-form__label">
          {t("profile.security.newPassword")}
        </label>
        <div className="nt-util__relative">
          <input
            type={showPasswords.new ? "text" : "password"}
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className={`nt-form__input ${
              errors.newPassword ? "nt-form__input--error" : ""
            }`}
            placeholder={t("profile.security.newPasswordPlaceholder")}
            disabled={isLoading}
            autoComplete="new-password"
            style={{
              borderColor: errors.newPassword
                ? "var(--nt-color-error)"
                : undefined,
            }}
          />
          <button
            type="button"
            className="nt-util__absolute nt-util__right-sm nt-util__top-1/2 nt-util__transform -nt-util__translate-y-1/2"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--nt-text-muted)",
              cursor: "pointer",
              padding: "var(--nt-space-xs)",
            }}
            onClick={() => togglePasswordVisibility("new")}
            tabIndex="-1"
          >
            <i
              className={`fas fa-${showPasswords.new ? "eye-slash" : "eye"}`}
            ></i>
          </button>
        </div>

        {/* Индикатор сложности пароля */}
        {formData.newPassword && (
          <div className="nt-util__mt-sm">
            <div className="nt-util__flex nt-util__justify-between nt-util__mb-xs">
              <span className="nt-util__text-sm">
                {t("profile.security.passwordStrength")}:
              </span>
              <span
                className="nt-util__text-sm"
                style={{ color: passwordStrength.color }}
              >
                {passwordStrength.label}
              </span>
            </div>
            <div
              style={{
                background: "var(--nt-bg-secondary)",
                height: "4px",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${passwordStrength.score * 25}%`,
                  backgroundColor: passwordStrength.color,
                  transition: "width 0.3s ease",
                }}
              ></div>
            </div>
          </div>
        )}

        {errors.newPassword && (
          <div
            className="nt-form__error nt-util__mt-xs"
            style={{
              color: "var(--nt-color-error)",
            }}
          >
            <i className="fas fa-exclamation-circle nt-util__mr-xs"></i>
            {errors.newPassword}
          </div>
        )}

        {/* Требования к паролю */}
        <div
          className="nt-util__mt-sm"
          style={{
            background: "var(--nt-bg-secondary)",
            padding: "var(--nt-space-sm)",
            borderRadius: "var(--nt-radius-sm)",
          }}
        >
          <p
            className="nt-util__text-sm nt-util__mb-xs"
            style={{
              color: "var(--nt-text-muted)",
            }}
          >
            {t("profile.security.passwordRequirements")}:
          </p>
          <ul
            className="nt-util__text-xs"
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            <li
              className="nt-util__mb-1"
              style={{
                color:
                  formData.newPassword.length >= 8
                    ? "var(--nt-color-success)"
                    : "var(--nt-text-muted)",
              }}
            >
              <i
                className={`fas fa-${
                  formData.newPassword.length >= 8 ? "check" : "times"
                } nt-util__mr-xs`}
              ></i>
              {t("profile.security.minLength")}
            </li>
            <li
              className="nt-util__mb-1"
              style={{
                color: /[A-Z]/.test(formData.newPassword)
                  ? "var(--nt-color-success)"
                  : "var(--nt-text-muted)",
              }}
            >
              <i
                className={`fas fa-${
                  /[A-Z]/.test(formData.newPassword) ? "check" : "times"
                } nt-util__mr-xs`}
              ></i>
              {t("profile.security.uppercaseLetter")}
            </li>
            <li
              className="nt-util__mb-1"
              style={{
                color: /[0-9]/.test(formData.newPassword)
                  ? "var(--nt-color-success)"
                  : "var(--nt-text-muted)",
              }}
            >
              <i
                className={`fas fa-${
                  /[0-9]/.test(formData.newPassword) ? "check" : "times"
                } nt-util__mr-xs`}
              ></i>
              {t("profile.security.number")}
            </li>
            <li
              style={{
                color: /[^A-Za-z0-9]/.test(formData.newPassword)
                  ? "var(--nt-color-success)"
                  : "var(--nt-text-muted)",
              }}
            >
              <i
                className={`fas fa-${
                  /[^A-Za-z0-9]/.test(formData.newPassword) ? "check" : "times"
                } nt-util__mr-xs`}
              ></i>
              {t("profile.security.specialChar")}
            </li>
          </ul>
        </div>
      </div>

      {/* Подтверждение пароля */}
      <div className="nt-form__group nt-util__mb-lg">
        <label htmlFor="confirmPassword" className="nt-form__label">
          {t("profile.security.confirmPassword")}
        </label>
        <div className="nt-util__relative">
          <input
            type={showPasswords.confirm ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`nt-form__input ${
              errors.confirmPassword ? "nt-form__input--error" : ""
            }`}
            placeholder={t("profile.security.confirmPasswordPlaceholder")}
            disabled={isLoading}
            autoComplete="new-password"
            style={{
              borderColor: errors.confirmPassword
                ? "var(--nt-color-error)"
                : undefined,
            }}
          />
          <button
            type="button"
            className="nt-util__absolute nt-util__right-sm nt-util__top-1/2 nt-util__transform -nt-util__translate-y-1/2"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--nt-text-muted)",
              cursor: "pointer",
              padding: "var(--nt-space-xs)",
            }}
            onClick={() => togglePasswordVisibility("confirm")}
            tabIndex="-1"
          >
            <i
              className={`fas fa-${
                showPasswords.confirm ? "eye-slash" : "eye"
              }`}
            ></i>
          </button>
        </div>
        {errors.confirmPassword && (
          <div
            className="nt-form__error nt-util__mt-xs"
            style={{
              color: "var(--nt-color-error)",
            }}
          >
            <i className="fas fa-exclamation-circle nt-util__mr-xs"></i>
            {errors.confirmPassword}
          </div>
        )}
      </div>

      {/* Сообщения */}
      {successMessage && (
        <div
          className="nt-util__p-md nt-util__mb-md"
          style={{
            background: "var(--nt-color-success)",
            color: "var(--nt-color-white)",
            borderRadius: "var(--nt-radius-md)",
          }}
        >
          <div className="nt-util__flex nt-util__items-center nt-util__gap-sm">
            <i className="fas fa-check-circle"></i>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          className="nt-util__p-md nt-util__mb-md"
          style={{
            background: "var(--nt-color-error)",
            color: "var(--nt-color-white)",
            borderRadius: "var(--nt-radius-md)",
          }}
        >
          <div className="nt-util__flex nt-util__items-center nt-util__gap-sm">
            <i className="fas fa-exclamation-circle"></i>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Кнопки */}
      <div className="nt-util__flex nt-util__gap-md nt-util__mt-xl">
        <button
          type="button"
          className="nt-btn nt-btn--secondary nt-util__flex-1"
          onClick={resetForm}
          disabled={isLoading}
        >
          {t("common.reset")}
        </button>
        <button
          type="submit"
          className="nt-btn nt-btn--primary nt-util__flex-1"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="nt-loader-small nt-util__mr-sm"></span>
              {t("common.saving")}
            </>
          ) : (
            <>
              <i className="fas fa-key nt-util__mr-sm"></i>
              {t("profile.security.updatePassword")}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
