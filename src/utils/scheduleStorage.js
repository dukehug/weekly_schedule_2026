import {
  INITIAL_EVENTS,
  LEGACY_GRAY_COLOR,
  SCHEDULE_STORAGE_KEY,
  SLATE_COLOR,
} from '../constants/schedule.js';

/** Read the saved schedule defensively and migrate the retired gray color in memory. */
export const loadStoredEvents = (storage = localStorage) => {
  try {
    const savedSchedule = storage.getItem(SCHEDULE_STORAGE_KEY);
    if (!savedSchedule) {
      return INITIAL_EVENTS;
    }

    const savedEvents = JSON.parse(savedSchedule);
    if (!Array.isArray(savedEvents)) {
      return INITIAL_EVENTS;
    }

    return savedEvents.map((event) => {
      if (event.color === LEGACY_GRAY_COLOR) {
        return { ...event, color: SLATE_COLOR };
      }
      return event;
    });
  } catch {
    storage.removeItem(SCHEDULE_STORAGE_KEY);
    return INITIAL_EVENTS;
  }
};

export const persistEvents = (events, storage = localStorage) => {
  storage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(events));
};

export const clearStoredEvents = (storage = localStorage) => {
  storage.removeItem(SCHEDULE_STORAGE_KEY);
};
