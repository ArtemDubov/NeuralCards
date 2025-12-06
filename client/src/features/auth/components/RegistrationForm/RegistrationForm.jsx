import React from "react";
import { useAppStore } from "../../../../shared/stores/appStore";

const RegistrationForm = ({
  registerEmail,
  setRegisterEmail,
  registerPassword,
  setRegisterPassword,
  registerName,
  setRegisterName,
  errors,
  emailDomain,
  showDomainDropdown,
  emailDomains,
  handleDomainSelect,
  handleEmailChange,
  handleNameChange,
  handleRegister,
}) => {
  const { t } = useAppStore();

  return (
    <form onSubmit={handleRegister} className="nt-form">
      <div className="nt-form__group">
        <div className="nt-auth__email-wrapper">
          <input
            type="text"
            placeholder={t("auth.name")}
            value={registerName}
            onChange={handleNameChange}
            className={`nt-form__input ${
              errors.name ? "nt-form__input--error" : ""
            }`}
            required
            maxLength={16}
          />
          <div className="nt-form__hint">
            {registerName.length}/16 {t("auth.name.hint")}
          </div>
          {errors.name && <span className="nt-form__error">{errors.name}</span>}
        </div>
      </div>

      <div className="nt-form__group">
        <div className="nt-auth__email-wrapper">
          <input
            type="email"
            placeholder={t("auth.email")}
            value={registerEmail}
            onChange={handleEmailChange}
            className={`nt-form__input ${
              errors.email ? "nt-form__input--error" : ""
            }`}
            required
          />
          {showDomainDropdown && (
            <div className="nt-auth__domain-dropdown">
              {emailDomains
                .filter((domain) => domain.startsWith(emailDomain))
                .map((domain) => (
                  <div
                    key={domain}
                    className="nt-auth__domain-option"
                    onClick={() => handleDomainSelect(domain)}
                  >
                    @{domain}
                  </div>
                ))}
            </div>
          )}
          {errors.email && (
            <span className="nt-form__error">{errors.email}</span>
          )}
        </div>
      </div>

      <div className="nt-form__group">
        <input
          type="password"
          placeholder={t("auth.password")}
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          className={`nt-form__input ${
            errors.password ? "nt-form__input--error" : ""
          }`}
          required
        />
        {errors.password && (
          <span className="nt-form__error">{errors.password}</span>
        )}
      </div>

      {errors.general && (
        <div className="nt-form__error--general">{errors.general}</div>
      )}

      <button type="submit" className="nt-btn nt-btn--primary nt-btn--full">
        {t("auth.signup")}
      </button>
    </form>
  );
};

export default RegistrationForm;
