// src/context/LanguageContext.js
import React, { createContext, useState, useContext } from 'react';

const availableLanguages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  // ...add your local languages
];

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Try localStorage first
    return localStorage.getItem('language') || availableLanguages[0].code;
  });

  const switchLanguage = (code) => {
    setLanguage(code);
    localStorage.setItem('language', code);
    // TODO: integrate with i18n library (e.g. react-i18next)
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook
export function useLanguage() {
  return useContext(LanguageContext);
}
