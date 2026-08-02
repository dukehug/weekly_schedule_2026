import { Check, Moon, Sun, SunMoon } from 'lucide-react';
import { createElement, useEffect, useRef, useState } from 'react';
import { trackEvent } from '../utils/analytics.js';

const THEME_OPTIONS = [
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'system', label: 'System', Icon: SunMoon },
];

const ThemePicker = ({ theme, onThemeChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const closeMenu = (event) => {
      const clickedOutside = !menuRef.current?.contains(event.target);
      if (event.key === 'Escape' || clickedOutside) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', closeMenu);
    document.addEventListener('pointerdown', closeMenu);
    return () => {
      document.removeEventListener('keydown', closeMenu);
      document.removeEventListener('pointerdown', closeMenu);
    };
  }, [isMenuOpen]);

  const activeOption = THEME_OPTIONS.find(option => option.value === theme);
  const ActiveThemeIcon = activeOption?.Icon || SunMoon;

  const handleThemeChange = (value) => {
    onThemeChange(value);
    setIsMenuOpen(false);
    trackEvent('change_theme', { theme: value });
  };

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsMenuOpen(isOpen => !isOpen)}
        className="flex w-[calc(1lh+1rem+2px)] items-center justify-center rounded-md border border-gray-300 bg-white py-2 text-gray-700 transition-colors hover:bg-gray-50"
        aria-label={`Theme: ${theme}. Choose theme`}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        title={`Theme: ${theme}`}
      >
        <ActiveThemeIcon size={18} />
        <span aria-hidden="true" className="invisible w-0 overflow-hidden">Theme</span>
      </button>

      {isMenuOpen && (
        <div
          role="menu"
          aria-label="Theme"
          className="absolute left-0 top-full z-50 mt-2 min-w-36 overflow-hidden rounded-lg border border-gray-200 bg-white p-1.5 shadow-xl"
        >
          {THEME_OPTIONS.map(({ value, label, Icon: icon }) => (
            <button
              key={value}
              type="button"
              role="menuitemradio"
              aria-checked={theme === value}
              onClick={() => handleThemeChange(value)}
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                theme === value
                  ? 'bg-gray-100 font-medium text-gray-950'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {createElement(icon, { size: 17 })}
              <span className="flex-1">{label}</span>
              {theme === value && <Check size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemePicker;
