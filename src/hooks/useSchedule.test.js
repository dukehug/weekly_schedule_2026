import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SCHEDULE_STORAGE_KEY } from '../constants/schedule.js';
import { useSchedule } from './useSchedule.js';

const ScheduleProbe = ({ storage }) => {
  const schedule = useSchedule({ storage, track: () => {} });
  return createElement('output', null, JSON.stringify({
    actionCount: [
      schedule.deleteEvent,
      schedule.importSchedule,
      schedule.resetSchedule,
      schedule.saveEvent,
      schedule.saveSchedule,
    ].filter(action => typeof action === 'function').length,
    events: schedule.events,
  }));
};

test('initializes schedule state from the configured storage and exposes its actions', () => {
  const savedEvents = [{ id: 'stored', day: 'Friday' }];
  const storage = {
    getItem: key => (key === SCHEDULE_STORAGE_KEY ? JSON.stringify(savedEvents) : null),
    setItem: () => {},
    removeItem: () => {},
  };

  const markup = renderToStaticMarkup(createElement(ScheduleProbe, { storage }));
  assert.match(markup, /&quot;id&quot;:&quot;stored&quot;/);
  assert.match(markup, /&quot;actionCount&quot;:5/);
});
