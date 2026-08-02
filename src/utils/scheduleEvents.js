/** Build the next event list without mutating the current schedule. */
export const upsertScheduleEvents = ({
  events,
  editingEvent,
  eventData,
  selectedDays,
  isContinuous,
  idSeed = Date.now(),
}) => {
  let nextEvents = editingEvent
    ? events.filter(event => event.id !== editingEvent.id)
    : [...events];

  if (!isContinuous) {
    const eventId = editingEvent?.id || String(idSeed);
    return [...nextEvents, { id: eventId, day: selectedDays[0], ...eventData }];
  }

  if (selectedDays.length === 0) {
    throw new Error('Please select at least one day.');
  }

  const newEvents = selectedDays.map((day, index) => ({
    id: `${idSeed}-${index}`,
    day,
    ...eventData,
  }));

  nextEvents = [...nextEvents, ...newEvents];
  return nextEvents;
};

export const removeScheduleEvent = (events, eventId) => (
  events.filter(event => event.id !== eventId)
);

/** Calculate event geometry and density once, independently of its JSX presentation. */
export const getScheduleEventLayout = (event, dayIndex, totalColumns) => {
  const startMinutes = timeToMinutes(event.start);
  const endMinutes = timeToMinutes(event.end);
  const durationMinutes = endMinutes - startMinutes;

  return {
    isTiny: durationMinutes < 60,
    isCompact: durationMinutes >= 60 && durationMinutes < 120,
    top: ((startMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT,
    height: (durationMinutes / 60) * HOUR_HEIGHT,
    left: `calc(80px + ${(dayIndex * 100) / totalColumns}% - ${(dayIndex * 80) / totalColumns}px + 2px)`,
    width: `calc((100% - 80px) / ${totalColumns} - 4px)`,
  };
};
import { HOUR_HEIGHT, START_HOUR } from '../constants/schedule.js';
import { timeToMinutes } from './time.js';
