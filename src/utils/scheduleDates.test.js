import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatLocalCalendarDate,
  formatHeaderDate,
  getCurrentWeekDates,
  isSameCalendarDay,
} from './scheduleDates.js';

test('builds the local Monday-to-Sunday dates for the current week', () => {
  const currentDate = new Date(2026, 7, 5, 14, 30);
  const weekDates = getCurrentWeekDates(currentDate);

  assert.deepEqual(
    weekDates.map(formatLocalCalendarDate),
    [
      '2026-08-03',
      '2026-08-04',
      '2026-08-05',
      '2026-08-06',
      '2026-08-07',
      '2026-08-08',
      '2026-08-09',
    ],
  );
});

test('handles month and year boundaries without overflowing the date', () => {
  const currentDate = new Date(2026, 11, 31, 23, 30);
  const weekDates = getCurrentWeekDates(currentDate);

  assert.equal(formatLocalCalendarDate(weekDates[0]), '2026-12-28');
  assert.equal(formatLocalCalendarDate(weekDates[6]), '2027-01-03');
});

test('formats header dates and compares local calendar days', () => {
  const morning = new Date(2026, 7, 3, 8, 0);
  const evening = new Date(2026, 7, 3, 20, 0);
  const nextDay = new Date(2026, 7, 4, 8, 0);

  assert.equal(formatHeaderDate(morning), 'AUG 3');
  assert.equal(isSameCalendarDay(morning, evening), true);
  assert.equal(isSameCalendarDay(morning, nextDay), false);
});
