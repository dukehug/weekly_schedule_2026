import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useCurrentTime } from './useCurrentTime.js';

const CurrentTimeProbe = () => {
  const currentTime = useCurrentTime();
  return createElement('output', null, String(currentTime instanceof Date));
};

test('initializes the current-time hook with a Date value', () => {
  const markup = renderToStaticMarkup(createElement(CurrentTimeProbe));
  assert.match(markup, />true</);
});
