import React, { useState } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useAuthStore } from "../../../../shared/stores/authStore";

const ChangeNameForm = ({ currentName }) => {
  const { t } = useAppStore();
  const { updateUserName, isLoading } = useAuthStore();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    newName: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    newName: "",
    password: "",
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newName.trim()) {
      newErrors.newName = t("profile.security.nameRequired");
    } else if (formData.newName.trim().length < 2) {
      newErrors.newName = t("profile.security.nameTooShort");
    } else if (formData.newName.trim().length > 50) {
      newErrors.newName = t("profile.security.nameTooLong");
    } else if (formData.newName.trim() === currentName) {
      newErrors.newName = t("profile.security.sameName");
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
      await updateUserName(formData.newName.trim(), formData.password);
      setSuccessMessage(t("profile.security.nameUpdated"));
      setFormData({ newName: "", password: "" });
    } catch (error) {
      setErrorMessage(error.message || t("profile.security.updateFailed"));
    }
  };

  const resetForm = () => {
    setFormData({ newName: "", password: "" });
    setErrors({ newName: "", password: "" });
    setSuccessMessage("");
    setErrorMessage("");
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Текущее имя */}
      <div className="nt-form__group nt-util__mb-lg">
        <label className="nt-form__label">
          {t("profile.security.currentName")}
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
              className="fas fa-user"
              style={{ color: "var(--nt-text-primary)" }}
            ></i>
            <span style={{ color: "var(--nt-text-primary)" }}>
              {currentName}
            </span>
          </div>
        </div>
      </div>

      {/* Новое имя */}
      <div className="nt-form__group nt-util__mb-md">
        <label htmlFor="newName" className="nt-form__label">
          {t("profile.security.newName")}
        </label>
        <input
          type="text"
          id="newName"
          name="newName"
          value={formData.newName}
          onChange={handleChange}
          className={`nt-form__input ${
            errors.newName ? "nt-form__input--error" : ""
          }`}
          placeholder={t("profile.security.namePlaceholder")}
          disabled={isLoading}
          maxLength={50}
          style={{
            borderColor: errors.newName ? "var(--nt-color-error)" : undefined,
          }}
        />
        <div className="nt-util__flex nt-util__justify-between nt-util__mt-xs">
          <div
            className="nt-util__text-xs"
            style={{
              color: "var(--nt-text-muted)",
            }}
          >
            {formData.newName.length}/50 {t("profile.security.characters")}
          </div>
          {errors.newName && (
            <div
              className="nt-form__error nt-util__text-xs"
              style={{
                color: "var(--nt-color-error)",
              }}
            >
              <i className="fas fa-exclamation-circle nt-util__mr-xs"></i>
              {errors.newName}
            </div>
          )}
        </div>
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
              {t("profile.security.updateName")}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ChangeNameForm;
