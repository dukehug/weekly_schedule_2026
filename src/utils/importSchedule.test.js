import assert from 'node:assert/strict';
import test from 'node:test';
import { parseImportedSchedule } from './importSchedule.js';

test('parses copied enrollment data into one event per day', () => {
  const rawText = [
    'Section',
    'Subject',
    'Units',
    '29082',
    'IT327L : APPLICATIONS DEVT LAB (290048)',
    'MTH 14:00-17:00 CL10',
    '1',
  ].join('\n');

  const events = parseImportedSchedule(rawText, 500);
  assert.deepEqual(events.map(event => event.day), ['Monday', 'Thursday']);
  assert.equal(events[0].subject, '29082');
  assert.equal(events[0].description, 'APPLICATIONS DEVT - LAB');
});

test('rejects schedules that end before they start', () => {
  const rawText = '29082\nIT327 : APPLICATIONS DEVT (290048)\nM 17:00-14:00 CL10\n3';
  assert.throws(() => parseImportedSchedule(rawText, 500), /must end after it starts/i);
});
