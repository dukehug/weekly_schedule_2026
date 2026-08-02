import { useEffect, useState } from 'react';

export const THEME_STORAGE_KEY = 'themePreference';
export const THEME_VALUES = ['dark', 'light', 'system'];

export const loadThemePreference = (storage = localStorage) => {
  try {
    const savedTheme = storage.getItem(THEME_STORAGE_KEY);
    return THEME_VALUES.includes(savedTheme) ? savedTheme : 'system';
  } catch {
    return 'system';
  }
};

/** Synchronize the chosen theme with the document and the operating-system preference. */
export const useTheme = ({ storage = localStorage } = {}) => {
  const [theme, setTheme] = useState(() => loadThemePreference(storage));

  useEffect(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const useDarkTheme = theme === 'dark' || (theme === 'system' && systemTheme.matches);
      document.documentElement.classList.toggle('dark', useDarkTheme);
      document.documentElement.style.colorScheme = useDarkTheme ? 'dark' : 'light';
    };

    applyTheme();
    try {
      storage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // The theme still works for the current session when storage is unavailable.
    }

    if (theme === 'system') {
      systemTheme.addEventListener('change', applyTheme);
    }

    return () => systemTheme.removeEventListener('change', applyTheme);
  }, [storage, theme]);

  return { theme, setTheme };
};
