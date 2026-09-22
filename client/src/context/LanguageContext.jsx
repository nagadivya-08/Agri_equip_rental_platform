import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, LANGUAGES, DEFAULT_LANGUAGE } from '../translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('agri_lang');
      if (saved && translations[saved]) {
        return saved;
      }
    } catch {
      // LocalStorage fallback
    }
    return DEFAULT_LANGUAGE;
  });

  const changeLanguage = (langCode) => {
    if (translations[langCode]) {
      setCurrentLanguage(langCode);
      try {
        localStorage.setItem('agri_lang', langCode);
      } catch {
        // LocalStorage fallback
      }
      if (typeof document !== 'undefined') {
        document.documentElement.lang = langCode;
      }
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLanguage;
    }
  }, [currentLanguage]);

  /**
   * Translate key with nested path (e.g., 'home.heroTitle')
   * Supports interpolation params: t('browse.showingCount', { count: 12 })
   */
  const t = useCallback(
    (path, params = {}) => {
      if (!path) return '';

      const keys = path.split('.');
      const currentDict = translations[currentLanguage] || translations[DEFAULT_LANGUAGE];
      const defaultDict = translations[DEFAULT_LANGUAGE];

      let value = keys.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), currentDict);

      // Fallback to English dictionary if key is missing in active language
      if (value === undefined && currentLanguage !== DEFAULT_LANGUAGE) {
        value = keys.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), defaultDict);
      }

      // If still missing, return the key or fallback
      if (value === undefined) {
        return typeof params === 'string' ? params : path;
      }

      if (typeof value === 'string' && typeof params === 'object') {
        return Object.entries(params).reduce((str, [paramKey, paramVal]) => {
          return str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        }, value);
      }

      return value;
    },
    [currentLanguage]
  );

  const activeLangMeta = LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        t,
        languages: LANGUAGES,
        activeLangMeta,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
