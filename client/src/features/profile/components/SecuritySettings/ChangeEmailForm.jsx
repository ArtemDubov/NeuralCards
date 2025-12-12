import React, { useState } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useAuthStore } from "../../../../shared/stores/authStore";

const ChangeEmailForm = ({ currentEmail }) => {
  const { t } = useAppStore();
  const { updateUserEmail, isLoading } = useAuthStore();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    newEmail: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    newEmail: "",
    password: "",
  });

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.newEmail.trim()) {
      newErrors.newEmail = t("profile.security.emailRequired");
    } else if (!emailRegex.test(formData.newEmail)) {
      newErrors.newEmail = t("profile.security.emailInvalid");
    } else if (formData.newEmail === currentEmail) {
      newErrors.newEmail = t("profile.security.sameEmail");
    }

    if (!formData.password.trim()) {
      newErrors.password = t("profile.security.passwordRequired");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      await updateUserEmail(formData.newEmail, formData.password);
      setSuccessMessage(t("profile.security.emailUpdated"));
      setFormData({ newEmail: "", password: "" });
    } catch (error) {
      setErrorMessage(error.message || t("profile.security.updateFailed"));
    }
  };

  const resetForm = () => {
    setFormData({ newEmail: "", password: "" });
    setErrors({ newEmail: "", password: "" });
    setSuccessMessage("");
    setErrorMessage("");
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Текущий email */}
      <div className="nt-form__group nt-util__mb-lg">
        <label className="nt-form__label">
          {t("profile.security.currentEmail")}
        </label>
        <div
          style={{
            background: "var(--nt-bg-secondary)",
            padding: "var(--nt-space-md)",
            borderRadius: "var(--nt-radius-md)",
            border: "1px solid var(--nt-border-light)",
          }}
        >
          <div className="nt-util__flex nt-util__items-center nt-util__gap-sm">
            <i
              className="fas fa-envelope"
              style={{ color: "var(--nt-text-primary)" }}
            ></i>
            <span style={{ color: "var(--nt-text-primary)" }}>
              {currentEmail}
            </span>
          </div>
        </div>
      </div>

      {/* Новый email */}
      <div className="nt-form__group nt-util__mb-md">
        <label htmlFor="newEmail" className="nt-form__label">
          {t("profile.security.newEmail")}
        </label>
        <input
          type="email"
          id="newEmail"
          name="newEmail"
          value={formData.newEmail}
          onChange={handleChange}
          className={`nt-form__input ${
            errors.newEmail ? "nt-form__input--error" : ""
          }`}
          placeholder={t("profile.security.emailPlaceholder")}
          disabled={isLoading}
          style={{
            borderColor: errors.newEmail ? "var(--nt-color-error)" : undefined,
          }}
        />
        {errors.newEmail && (
          <div
            className="nt-form__error nt-util__mt-xs"
            style={{
              color: "var(--nt-color-error)",
            }}
          >
            <i className="fas fa-exclamation-circle nt-util__mr-xs"></i>
            {errors.newEmail}
          </div>
        )}
      </div>

      {/* Пароль */}
      <div className="nt-form__group nt-util__mb-lg">
        <label htmlFor="password" className="nt-form__label">
          {t("profile.security.confirmPassword")}
          <span
            className="nt-util__text-sm nt-util__ml-sm"
            style={{
              color: "var(--nt-text-muted)",
            }}
          >
            {t("profile.security.passwordHint")}
          </span>
        </label>
        <div className="nt-util__relative">
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`nt-form__input ${
              errors.password ? "nt-form__input--error" : ""
            }`}
            placeholder={t("profile.security.passwordPlaceholder")}
            disabled={isLoading}
            style={{
              borderColor: errors.password
                ? "var(--nt-color-error)"
                : undefined,
            }}
          />
          <i
            className="fas fa-lock nt-util__absolute nt-util__right-md nt-util__top-1/2 nt-util__transform -nt-util__translate-y-1/2"
            style={{
              color: "var(--nt-text-muted)",
            }}
          ></i>
        </div>
        {errors.password && (
          <div
            className="nt-form__error nt-util__mt-xs"
            style={{
              color: "var(--nt-color-error)",
            }}
          >
            <i className="fas fa-exclamation-circle nt-util__mr-xs"></i>
            {errors.password}
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
              <i className="fas fa-save nt-util__mr-sm"></i>
              {t("profile.security.updateEmail")}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ChangeEmailForm;
