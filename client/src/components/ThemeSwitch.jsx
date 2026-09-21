import React from 'react';

/**
 * ThemeSwitch Component
 * Vertical mechanical knife-switch lever for shifting between Light and Dark themes.
 */
const ThemeSwitch = ({ isDark, onToggle, id = 'themeSwitchInput' }) => {
  return (
    <div className="theme-toggle-dock" title={isDark ? 'Current: Dark Theme. Click switch for Light Theme' : 'Current: Light Theme. Click switch for Dark Theme'}>
      <span className="theme-dock-icon sun-icon" aria-hidden="true">☀️</span>
      <label className="theme-lever-switch" htmlFor={id}>
        <input
          type="checkbox"
          id={id}
          className="chk"
          checked={isDark}
          onChange={onToggle}
          aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        />
        <span className="slider" />
      </label>
      <span className="theme-dock-icon moon-icon" aria-hidden="true">🌙</span>
    </div>
  );
};

export default ThemeSwitch;
