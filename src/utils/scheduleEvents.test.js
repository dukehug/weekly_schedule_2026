import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getScheduleEventLayout,
  removeScheduleEvent,
  upsertScheduleEvents,
} from './scheduleEvents.js';

const existingEvent = {
  id: 'existing',
  day: 'Monday',
  subject: 'IT101',
  start: '08:00',
  end: '09:00',
};

test('adds one event without mutating the current list', () => {
  const events = [existingEvent];
  const result = upsertScheduleEvents({
    events,
    editingEvent: null,
    eventData: { subject: 'IT202', start: '10:00', end: '11:00' },
    selectedDays: ['Tuesday'],
    isContinuous: false,
    idSeed: 100,
  });

  assert.equal(events.length, 1);
  assert.deepEqual(result[1], {
    id: '100',
    day: 'Tuesday',
    subject: 'IT202',
    start: '10:00',
    end: '11:00',
  });
});

test('replaces an edited event and preserves its id', () => {
  const result = upsertScheduleEvents({
    events: [existingEvent],
    editingEvent: existingEvent,
    eventData: { subject: 'IT101', start: '09:00', end: '10:00' },
    selectedDays: ['Wednesday'],
    isContinuous: false,
    idSeed: 200,
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'existing');
  assert.equal(result[0].day, 'Wednesday');
});

test('creates one event for every selected continuous day', () => {
  const result = upsertScheduleEvents({
    events: [],
    editingEvent: null,
    eventData: { subject: 'IT303', start: '13:00', end: '14:00' },
    selectedDays: ['Monday', 'Friday'],
    isContinuous: true,
    idSeed: 300,
  });

  assert.deepEqual(result.map(event => event.id), ['300-0', '300-1']);
  assert.deepEqual(result.map(event => event.day), ['Monday', 'Friday']);
});

test('requires a day for continuous events', () => {
  assert.throws(() => upsertScheduleEvents({
    events: [],
    editingEvent: null,
    eventData: {},
    selectedDays: [],
    isContinuous: true,
  }), /select at least one day/i);
});

test('removes an event and calculates grid layout', () => {
  assert.deepEqual(removeScheduleEvent([existingEvent], 'existing'), []);

  const layout = getScheduleEventLayout(existingEvent, 0, 7);
  assert.equal(layout.isCompact, true);
  assert.equal(layout.isTiny, false);
  assert.equal(layout.top, 80);
  assert.equal(layout.height, 80);
});
