import assert from 'node:assert/strict';
import test from 'node:test';
import {
  INITIAL_EVENTS,
  LEGACY_GRAY_COLOR,
  SCHEDULE_STORAGE_KEY,
  SLATE_COLOR,
} from '../constants/schedule.js';
import {
  clearStoredEvents,
  loadStoredEvents,
  persistEvents,
} from './scheduleStorage.js';

const createMemoryStorage = (initialValue = null) => {
  const values = new Map();
  if (initialValue !== null) {
    values.set(SCHEDULE_STORAGE_KEY, initialValue);
  }

  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
};

test('uses example data when no saved schedule exists', () => {
  assert.deepEqual(loadStoredEvents(createMemoryStorage()), INITIAL_EVENTS);
});

test('loads saved events and migrates the legacy gray color', () => {
  const storage = createMemoryStorage(JSON.stringify([{ id: '1', color: LEGACY_GRAY_COLOR }]));
  assert.deepEqual(loadStoredEvents(storage), [{ id: '1', color: SLATE_COLOR }]);
});

test('cleans invalid data and falls back safely', () => {
  const storage = createMemoryStorage('{invalid json');
  assert.deepEqual(loadStoredEvents(storage), INITIAL_EVENTS);
  assert.equal(storage.getItem(SCHEDULE_STORAGE_KEY), null);
});

test('persists and clears events with the existing storage key', () => {
  const storage = createMemoryStorage();
  const events = [{ id: 'saved' }];

  persistEvents(events, storage);
  assert.equal(storage.getItem(SCHEDULE_STORAGE_KEY), JSON.stringify(events));

  clearStoredEvents(storage);
  assert.equal(storage.getItem(SCHEDULE_STORAGE_KEY), null);
});
