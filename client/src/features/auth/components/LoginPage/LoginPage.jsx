import React, { useState } from "react";
import RegistrationForm from "../RegistrationForm/RegistrationForm";
import AuthTabs from "../AuthTabs/AuthTabs";
import LoginForm from "../LoginForm/LoginForm";
import LanguageSwitcher from "../../../shared/components/LanguageSwitcher/LanguageSwitcher";
import { useLanguage } from "../../../../contexts/LanguageContext";
import ThemeSwitcher from "../../../shared/components/ThemeSwitcher/ThemeSwitcher";
import { useAuth } from "../../../../hooks/useAuth";

const LoginPage = ({ onAuthSuccess }) => {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(true);
  const { t } = useLanguage();
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [errors, setErrors] = useState({});
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const [emailDomain, setEmailDomain] = useState("");

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

  // Умная валидация имени БЕЗ работы с DOM
  const handleNameChange = (e) => {
    const value = e.target.value;

    let newValue = value;

    // Проверка длины
    if (value.length > 16) {
      newValue = value.slice(0, 16);
    }

    // Проверка на пробел в начале
    if (value.startsWith(" ")) {
      newValue = value.trimStart();
    }

    // Проверка на два пробела подряд
    if (value.includes("  ")) {
      newValue = value.replace(/  +/g, " ");
    }

    // Проверка на запрещённые символы (только буквы и пробелы)
    const cleanValue = newValue.replace(/[^\p{L}\s]/gu, "");

    setRegisterName(cleanValue);
    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setRegisterEmail(value);

    // Показываем dropdown если есть @ и текст после него
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
    console.log("🟡 [LoginPage] Обработчик входа вызван");

    if (!email || !password) {
      console.log("❌ [LoginPage] Email или пароль не заполнены");
      return;
    }

    console.log("🟡 [LoginPage] Вызываем auth.login...");
    const result = await auth.login(email, password);

    if (result.success) {
      console.log("✅ [LoginPage] Вход успешен, вызываем onAuthSuccess");
      onAuthSuccess();
    } else {
      console.error("❌ [LoginPage] Ошибка входа:", result.error);
      setErrors({ general: result.error });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log("🟡 [LoginPage] Обработчик регистрации вызван");

    // Полная валидация
    const newErrors = {};
    console.log("🟡 [LoginPage] Выполняем валидацию...");

    // Валидация имени
    if (!registerName.trim()) {
      newErrors.name = t("validation.name.required");
      console.log("❌ [LoginPage] Ошибка валидации: имя не заполнено");
    } else if (registerName.trim().length < 2) {
      newErrors.name = t("validation.name.minLength");
      console.log("❌ [LoginPage] Ошибка валидации: имя слишком короткое");
    } else if (!/^[\p{L} ]+$/u.test(registerName)) {
      newErrors.name = t("validation.name.lettersOnly");
      console.log(
        "❌ [LoginPage] Ошибка валидации: имя содержит запрещенные символы"
      );
    }

    // Валидация email
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!registerEmail) {
      newErrors.email = t("validation.email.required");
      console.log("❌ [LoginPage] Ошибка валидации: email не заполнен");
    } else if (!emailRegex.test(registerEmail)) {
      newErrors.email = t("validation.email.invalid");
      console.log("❌ [LoginPage] Ошибка валидации: email невалиден");
    }

    // Валидация пароля
    if (!registerPassword) {
      newErrors.password = t("validation.password.required");
      console.log("❌ [LoginPage] Ошибка валидации: пароль не заполнен");
    } else if (registerPassword.length < 6) {
      newErrors.password = t("validation.password.minLength");
      console.log("❌ [LoginPage] Ошибка валидации: пароль слишком короткий");
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      console.log("❌ [LoginPage] Валидация не пройдена, отмена регистрации");
      return;
    }

    console.log("✅ [LoginPage] Валидация пройдена, вызываем auth.register...");
    const result = await auth.register(
      registerName,
      registerEmail,
      registerPassword
    );

    if (result.success) {
      console.log("✅ [LoginPage] Регистрация успешна, вызываем onAuthSuccess");
      onAuthSuccess();
    } else {
      console.error("❌ [LoginPage] Ошибка регистрации:", result.error);
      setErrors({ general: result.error });
    }
  };

  return (
    <div className="app login-container">
      <div className="login-header">
        <h1>{t("app.title")}</h1>
        <div className="login-switchers">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>

      <AuthTabs isLoginForm={isLoginForm} setIsLoginForm={setIsLoginForm} />

      {isLoginForm ? (
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handleLogin={handleLogin}
        />
      ) : (
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
      )}

      <p className="test-credentials">{t("auth.test.credentials")}</p>
    </div>
  );
};

export default LoginPage;
