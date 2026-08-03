import { Fragment, useRef } from 'react';
import {
  DAYS,
  END_HOUR,
  HOUR_HEIGHT,
  START_HOUR,
} from '../constants/schedule.js';
import { useCurrentTime } from '../hooks/useCurrentTime.js';
import {
  getCurrentWeekDates,
  isSameCalendarDay,
} from '../utils/scheduleDates.js';
import { getScheduleHeaderTransform } from '../utils/scheduleLayout.js';
import { formatCurrentTime, getCurrentTimeIndicator } from '../utils/time.js';
import ScheduleDayHeader from './ScheduleDayHeader.jsx';
import ScheduleEventCard from './ScheduleEventCard.jsx';

const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: '80px repeat(7, 1fr)',
};

const ScheduleGrid = ({ events, onEditEvent }) => {
  const scheduleHeaderRef = useRef(null);
  const currentTime = useCurrentTime();
  const weekDates = getCurrentWeekDates(currentTime);
  const todayColumnIndex = weekDates.findIndex((date) => (
    isSameCalendarDay(date, currentTime)
  ));
  const currentTimeIndicator = getCurrentTimeIndicator(
    currentTime,
    START_HOUR,
    END_HOUR,
    HOUR_HEIGHT,
  );

  const syncScheduleHeader = (event) => {
    if (scheduleHeaderRef.current) {
      scheduleHeaderRef.current.style.transform = getScheduleHeaderTransform(
        event.currentTarget.scrollLeft,
      );
    }
  };

  return (
    <main className="mx-auto max-w-full rounded-lg border border-gray-200 bg-white shadow-sm print:w-full print:shadow-none">
      <div className="sticky top-0 z-30 overflow-hidden rounded-t-lg bg-gray-50 shadow-[0_1px_0_0_#e5e7eb] print:static print:shadow-none">
        <div ref={scheduleHeaderRef} style={GRID_STYLE} className="min-w-[1000px] bg-gray-50 will-change-transform">
          <div aria-hidden="true" className="flex items-center justify-center border-r border-gray-200 p-4 text-center text-sm font-medium text-gray-400">
            Time
          </div>
          {DAYS.map((day, dayIndex) => (
            <ScheduleDayHeader
              key={day}
              date={weekDates[dayIndex]}
              day={day}
              isToday={dayIndex === todayColumnIndex}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 z-40 flex w-[80px] items-center justify-center border-r border-gray-200 bg-gray-50 p-4 text-center text-sm font-medium text-gray-400">
          Time
        </div>
      </div>

      <div className="overflow-x-auto rounded-b-lg" onScroll={syncScheduleHeader}>
        <div className="relative min-w-[1000px]">
          <div className="relative" style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}>
            <div className="absolute inset-0" style={GRID_STYLE}>
              {Array.from({ length: END_HOUR - START_HOUR }).map((_, index) => {
                const hour = START_HOUR + index;
                return (
                  <Fragment key={hour}>
                    <div
                      className="sticky left-0 z-20 flex flex-col items-center justify-start border-b border-r border-gray-100 bg-gray-50 pt-1 text-xs font-medium text-gray-500"
                      style={{ height: `${HOUR_HEIGHT}px` }}
                    >
                      <span>{hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}</span>
                    </div>
                    {DAYS.map((day, columnIndex) => {
                      let columnClasses = 'border-b border-r border-gray-100';
                      if (columnIndex === todayColumnIndex) {
                        columnClasses += ' bg-blue-50/20 shadow-[inset_1px_0_0_rgb(96_165_250_/_0.3),inset_-1px_0_0_rgb(96_165_250_/_0.3)] dark:bg-blue-950/10';
                      }
                      if (columnIndex === DAYS.length - 1) {
                        columnClasses += ' border-r-0';
                      }

                      return (
                        <div
                          key={`${day}-${hour}`}
                          className={columnClasses}
                          style={{ height: `${HOUR_HEIGHT}px` }}
                        />
                      );
                    })}
                  </Fragment>
                );
              })}
            </div>

            {events.map(event => (
              <ScheduleEventCard key={event.id} event={event} onClick={onEditEvent} />
            ))}

            {currentTimeIndicator.isVisible && (
              <div
                className="pointer-events-none absolute inset-x-0 z-20 print:hidden"
                style={{ top: `${currentTimeIndicator.top}px` }}
                aria-label={`Current time: ${formatCurrentTime(currentTime)}`}
              >
                <div className="relative h-0 border-t-2 border-gray-950 shadow-[0_1px_3px_rgba(3,7,18,0.32)]">
                  {currentTime.getMinutes() !== 0 && (
                    <time
                      dateTime={`${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`}
                      className="sticky left-0 z-30 flex w-[80px] -translate-y-1/2 justify-center"
                    >
                      <span className="rounded-full bg-gray-950 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white shadow-sm">
                        {formatCurrentTime(currentTime)}
                      </span>
                    </time>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ScheduleGrid;
