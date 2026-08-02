import assert from 'node:assert/strict';
import test from 'node:test';
import { getScheduleHeaderTransform } from './scheduleLayout.js';

test('moves the day header in the opposite direction of horizontal scrolling', () => {
  assert.equal(getScheduleHeaderTransform(240), 'translateX(-240px)');
});

test('guards against invalid negative scroll offsets', () => {
  assert.equal(getScheduleHeaderTransform(-20), 'translateX(-0px)');
});
