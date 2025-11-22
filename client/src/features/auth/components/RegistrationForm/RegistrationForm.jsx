import React from "react";
import "./RegistrationForm.css";

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
  return (
    <form onSubmit={handleRegister} className="auth-form container-tp9">
      {/* Поле имени с защитой от ошибок */}
      <div className="input-group">
        <input
          type="text"
          placeholder="Ваше имя (макс. 16 символов)"
          value={registerName}
          onChange={handleNameChange}
          className={`form-input ${errors.name ? "error" : ""}`}
          required
          maxLength={16}
        />
        <div className="input-hint">
          {registerName.length}/16 символов • Только буквы • Один пробел между
          словами
        </div>
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>

      {/* Поле email с автодополнением */}
      <div className="input-group">
        <div className="email-input-wrapper">
          <input
            type="email"
            placeholder="Email"
            value={registerEmail}
            onChange={handleEmailChange}
            className={`form-input ${errors.email ? "error" : ""}`}
            required
          />
          {showDomainDropdown && (
            <div className="domain-dropdown">
              {emailDomains
                .filter((domain) => domain.startsWith(emailDomain))
                .map((domain) => (
                  <div
                    key={domain}
                    className="domain-option"
                    onClick={() => handleDomainSelect(domain)}
                  >
                    @{domain}
                  </div>
                ))}
            </div>
          )}
        </div>
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      {/* Поле пароля */}
      <div className="input-group">
        <input
          type="password"
          placeholder="Пароль (минимум 6 символов)"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          className={`form-input ${errors.password ? "error" : ""}`}
          required
        />
        {errors.password && (
          <span className="error-text">{errors.password}</span>
        )}
      </div>

      {/* Общая ошибка */}
      {errors.general && (
        <div className="error-message general-error">{errors.general}</div>
      )}

      <button type="submit" className="btn-tp1">
        Зарегистрироваться
      </button>
    </form>
  );
};

export default RegistrationForm;
