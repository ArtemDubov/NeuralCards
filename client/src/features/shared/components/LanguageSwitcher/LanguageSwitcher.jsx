import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import "./LanguageSwitcher.css";

// Импортируем SVG флаги
import { RuFlag, EnFlag, EsFlag } from "../../../../assets";

const LanguageSwitcher = () => {
  const { language, switchLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { id: "ru", name: "language.russian", flag: RuFlag },
    { id: "en", name: "language.english", flag: EnFlag },
    { id: "es", name: "language.spanish", flag: EsFlag },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageSwitch = (langId) => {
    switchLanguage(langId);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const currentLanguage = languages.find((lang) => lang.id === language);

  return (
    <div className="language-switcher-container" ref={dropdownRef}>
      <div className="language-switcher-dropdown">
        <button className="language-current btn-tp7" onClick={toggleDropdown}>
          <img
            src={currentLanguage?.flag}
            alt={t(currentLanguage?.name)}
            className="language-flag"
          />
          <span className="language-arrow">{isOpen ? "▲" : "▼"}</span>
        </button>

        <div className={`language-options ${isOpen ? "open" : ""}`}>
          {languages.map((lang) => (
            <button
              key={lang.id}
              className={`language-option ${
                language === lang.id ? "active" : ""
              }`}
              onClick={() => handleLanguageSwitch(lang.id)}
            >
              <img
                src={lang.flag}
                alt={t(lang.name)}
                className="language-option-flag"
              />
              <span className="text-primary dropdown-text-active">
                {t(lang.name)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
