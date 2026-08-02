import { useState } from 'react';
import { trackEvent } from '../utils/analytics.js';
import { parseImportedSchedule } from '../utils/importSchedule.js';
import { removeScheduleEvent, upsertScheduleEvents } from '../utils/scheduleEvents.js';
import {
  clearStoredEvents,
  loadStoredEvents,
  persistEvents,
} from '../utils/scheduleStorage.js';

/** Own schedule state and keep persistence/analytics rules out of UI components. */
export const useSchedule = ({ storage = localStorage, track = trackEvent } = {}) => {
  const [events, setEvents] = useState(() => loadStoredEvents(storage));

  const saveSchedule = () => {
    persistEvents(events, storage);
    track('save_schedule', { session_count: events.length });
  };

  const importSchedule = (rawText) => {
    const importedEvents = parseImportedSchedule(rawText);
    setEvents(importedEvents);
    persistEvents(importedEvents, storage);
    track('import_schedule', { session_count: importedEvents.length });
  };

  const saveEvent = (eventDetails) => {
    const updatedEvents = upsertScheduleEvents({ events, ...eventDetails });
    setEvents(updatedEvents);
    track('save_class', {
      operation: eventDetails.editingEvent ? 'edit' : 'create',
      session_count: updatedEvents.length,
    });
  };

  const deleteEvent = (eventId) => {
    const updatedEvents = removeScheduleEvent(events, eventId);
    setEvents(updatedEvents);
    persistEvents(updatedEvents, storage);
    track('delete_class', { session_count: updatedEvents.length });
  };

  const resetSchedule = () => {
    setEvents([]);
    clearStoredEvents(storage);
    track('reset_schedule');
  };

  return {
    events,
    deleteEvent,
    importSchedule,
    resetSchedule,
    saveEvent,
    saveSchedule,
  };
};
