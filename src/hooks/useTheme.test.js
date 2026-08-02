import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadThemePreference, useTheme } from './useTheme.js';

const createStorage = value => ({
  getItem: () => value,
  setItem: () => {},
});

const ThemeProbe = ({ storage }) => {
  const { theme, setTheme } = useTheme({ storage });
  return createElement('output', null, `${theme}:${typeof setTheme}`);
};

test('accepts known preferences and rejects unknown ones', () => {
  assert.equal(loadThemePreference(createStorage('dark')), 'dark');
  assert.equal(loadThemePreference(createStorage('unknown')), 'system');
});

test('initializes the theme hook from storage', () => {
  const markup = renderToStaticMarkup(createElement(ThemeProbe, {
    storage: createStorage('light'),
  }));
  assert.match(markup, /light:function/);
});
