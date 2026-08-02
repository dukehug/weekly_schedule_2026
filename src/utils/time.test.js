import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatCurrentTime,
  formatTime12Hour,
  getCurrentTimeIndicator,
  timeToMinutes,
} from './time.js';

test('converts and formats schedule times', () => {
  assert.equal(timeToMinutes('14:30'), 870);
  assert.equal(formatTime12Hour('00:05'), '12:05 AM');
  assert.equal(formatTime12Hour('14:30'), '2:30 PM');
});

test('formats a browser Date as a 12-hour time', () => {
  const date = new Date(2026, 7, 2, 9, 7);
  assert.equal(formatCurrentTime(date), '9:07 AM');
});

test('calculates current-time visibility and vertical position', () => {
  const visibleDate = new Date(2026, 7, 2, 8, 30);
  assert.deepEqual(getCurrentTimeIndicator(visibleDate, 7, 22, 80), {
    isVisible: true,
    top: 120,
  });

  const hiddenDate = new Date(2026, 7, 2, 23, 0);
  assert.equal(getCurrentTimeIndicator(hiddenDate, 7, 22, 80).isVisible, false);
});
