import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { RuFlag, EnFlag, EsFlag, DeFlag, FrFlag } from "../../../../assets";

const LanguageSwitcher = () => {
  const { language, setLanguage, t, theme } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Все 5 языков
  const languages = [
    { id: "ru", name: "language.russian", flag: RuFlag },
    { id: "en", name: "language.english", flag: EnFlag },
    { id: "es", name: "language.spanish", flag: EsFlag },
    { id: "de", name: "language.german", flag: DeFlag },
    { id: "fr", name: "language.french", flag: FrFlag },
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
    setLanguage(langId);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const currentLanguage = languages.find((lang) => lang.id === language);

  return (
    <div
      className="nt-language__container"
      ref={dropdownRef}
      data-theme={theme}
    >
      <div
        className={`nt-language__dropdown ${
          isOpen ? "nt-language__dropdown--open" : ""
        }`}
      >
        <button className="nt-language__current" onClick={toggleDropdown}>
          <img
            src={currentLanguage?.flag}
            alt={t(currentLanguage?.name)}
            className="nt-language__flag"
          />
          <span className="nt-language__arrow">{isOpen ? "▲" : "▼"}</span>
        </button>

        <div
          className={`nt-language__options ${
            isOpen ? "nt-language__options--open" : ""
          }`}
        >
          {languages.map((lang) => (
            <button
              key={lang.id}
              className={`nt-language__option ${
                language === lang.id ? "nt-language__option--active" : ""
              }`}
              onClick={() => handleLanguageSwitch(lang.id)}
            >
              <img
                src={lang.flag}
                alt={t(lang.name)}
                className="nt-language__option-flag"
              />
              <span className="nt-language__option-name">{t(lang.name)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
