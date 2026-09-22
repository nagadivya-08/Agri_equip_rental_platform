import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector = ({ className = '' }) => {
  const { currentLanguage, changeLanguage, languages, activeLangMeta } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`lang-selector-dropdown-wrapper ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`lang-dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select language"
        title="Select platform language"
      >
        <span className="lang-globe-icon" aria-hidden="true">🌐</span>
        <span className="lang-trigger-label">{activeLangMeta.nativeName}</span>
        <span className={`lang-arrow ${isOpen ? 'arrow-up' : 'arrow-down'}`}>▾</span>
      </button>

      {isOpen && (
        <div className="lang-dropdown-menu" role="listbox" tabIndex={-1}>
          <div className="lang-dropdown-title">
            <span>🌐 Select Language</span>
          </div>
          {languages.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`lang-menu-item ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
              >
                <div className="lang-item-names">
                  <span className="lang-item-native">{lang.nativeName}</span>
                  <span className="lang-item-english">({lang.name})</span>
                </div>
                {isSelected && <span className="lang-item-checkmark">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
