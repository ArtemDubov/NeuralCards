import React, { useState, useEffect } from "react";
import RegistrationForm from "../RegistrationForm/RegistrationForm";
import AuthTabs from "../AuthTabs/AuthTabs";
import LoginForm from "../LoginForm/LoginForm";
import LanguageSwitcher from "../../../shared/components/LanguageSwitcher/LanguageSwitcher";
import { useAppStore } from "../../../../shared/stores/appStore";
import ThemeSwitcher from "../../../shared/components/ThemeSwitcher/ThemeSwitcher";
import { useAuthStore } from "../../../../shared/stores/authStore";

const LoginPage = () => {
  const { login, register } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(true);
  const { t } = useAppStore();
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [errors, setErrors] = useState({});
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const [emailDomain, setEmailDomain] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Упрощенная инициализация
  useEffect(() => {
    console.log("LoginPage: монтирование");
    setIsInitialized(true);
    return () => {
      console.log("LoginPage: размонтирование");
    };
  }, []);

  const emailDomains = [
    "gmail.com",
    "mail.ru",
    "yandex.ru",
    "rambler.ru",
    "outlook.com",
    "yahoo.com",
    "icloud.com",
    "protonmail.com",
  ];

  const handleNameChange = (e) => {
    const value = e.target.value;
    let newValue = value;

    if (value.length > 16) {
      newValue = value.slice(0, 16);
    }

    if (value.startsWith(" ")) {
      newValue = value.trimStart();
    }

    if (value.includes("  ")) {
      newValue = value.replace(/  +/g, " ");
    }

    const cleanValue = newValue.replace(/[^\p{L}\s]/gu, "");
    setRegisterName(cleanValue);
    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setRegisterEmail(value);

    const atIndex = value.indexOf("@");
    if (atIndex !== -1 && value.length > atIndex + 1) {
      const currentDomain = value.substring(atIndex + 1);
      setEmailDomain(currentDomain);
      setShowDomainDropdown(true);
    } else {
      setShowDomainDropdown(false);
    }

    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handleDomainSelect = (domain) => {
    const emailWithoutDomain = registerEmail.split("@")[0];
    setRegisterEmail(`${emailWithoutDomain}@${domain}`);
    setShowDomainDropdown(false);
    setEmailDomain("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrors({ general: t("validation.required") });
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      console.log("Login successful, reloading page");
      window.location.reload();
    } else {
      setErrors({ general: result.error });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!registerName.trim()) {
      newErrors.name = t("validation.name.required");
    } else if (registerName.trim().length < 2) {
      newErrors.name = t("validation.name.minLength");
    } else if (!/^[\p{L} ]+$/u.test(registerName)) {
      newErrors.name = t("validation.name.lettersOnly");
    }

    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!registerEmail) {
      newErrors.email = t("validation.email.required");
    } else if (!emailRegex.test(registerEmail)) {
      newErrors.email = t("validation.email.invalid");
    }

    if (!registerPassword) {
      newErrors.password = t("validation.password.required");
    } else if (registerPassword.length < 6) {
      newErrors.password = t("validation.password.minLength");
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const result = await register(
      registerName,
      registerEmail,
      registerPassword
    );

    if (result.success) {
      console.log("Registration successful, reloading page");
      window.location.reload();
    } else {
      setErrors({ general: result.error });
    }
  };

  if (!isInitialized) {
    return (
      <div className="nt-auth__container">
        <div className="nt-loader">
          <div className="nt-loader__spinner"></div>
          <p>{t("loading.login_page")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nt-auth__container">
      <div className="nt-auth__header">
        <h1 className="nt-auth__title">{t("app.title")}</h1>
        <div className="nt-util__flex nt-util__gap-md nt-util__items-center">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>

      <AuthTabs isLoginForm={isLoginForm} setIsLoginForm={setIsLoginForm} />

      {isLoginForm ? (
        <div className="nt-form" style={{ maxWidth: "400px", width: "100%" }}>
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleLogin={handleLogin}
          />
          {errors.general && (
            <div className="nt-form__error--general nt-util__mt-md">
              {errors.general}
            </div>
          )}
        </div>
      ) : (
        <div style={{ maxWidth: "400px", width: "100%" }}>
          <RegistrationForm
            registerEmail={registerEmail}
            setRegisterEmail={setRegisterEmail}
            registerPassword={registerPassword}
            setRegisterPassword={setRegisterPassword}
            registerName={registerName}
            setRegisterName={setRegisterName}
            errors={errors}
            emailDomain={emailDomain}
            showDomainDropdown={showDomainDropdown}
            emailDomains={emailDomains}
            handleDomainSelect={handleDomainSelect}
            handleEmailChange={handleEmailChange}
            handleNameChange={handleNameChange}
            handleRegister={handleRegister}
          />
        </div>
      )}

      <p className="nt-util__text-muted nt-util__text-center nt-util__mt-xl nt-util__text-sm">
        {t("auth.test.credentials")}
      </p>
    </div>
  );
};

export default LoginPage;
