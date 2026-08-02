import { Clock, MapPin } from 'lucide-react';
import { DAYS } from '../constants/schedule.js';
import { getScheduleEventLayout } from '../utils/scheduleEvents.js';
import { formatTime12Hour } from '../utils/time.js';

const ScheduleEventCard = ({ event, onClick }) => {
  const dayIndex = DAYS.indexOf(event.day);
  if (dayIndex === -1) {
    return null;
  }

  const layout = getScheduleEventLayout(event, dayIndex, DAYS.length);
  let densityClasses = 'flex flex-col gap-1 p-2';
  if (layout.isTiny) {
    densityClasses = 'flex flex-col justify-center gap-0.5 px-1.5 py-1';
  } else if (layout.isCompact) {
    densityClasses = 'grid grid-rows-4 px-1.5 py-1';
  }

  return (
    <button
      type="button"
      onClick={() => onClick(event)}
      className={`absolute z-10 m-1 overflow-hidden rounded-md border-l-4 text-left text-xs leading-tight transition-colors hover:brightness-95 hover:ring-1 hover:ring-black/10 print:border ${densityClasses} ${event.color}`}
      style={{
        top: `${layout.top}px`,
        height: `${layout.height - 2}px`,
        left: layout.left,
        width: layout.width,
      }}
    >
      {layout.isTiny && (
        <>
          <span className="truncate text-[10px] font-bold leading-[12px]">{event.subject}</span>
          <span className="truncate text-[9px] leading-[11px] opacity-90">{event.description}</span>
        </>
      )}

      {layout.isCompact && (
        <>
          <span className="flex min-h-0 items-center truncate text-[11px] font-bold leading-none">{event.subject}</span>
          <span className="flex min-h-0 items-center truncate text-[10px] leading-none opacity-90">{event.description}</span>
          <span className="flex min-h-0 min-w-0 items-center gap-1 text-[9px] leading-none opacity-80">
            <Clock size={9} className="shrink-0" />
            <span className="truncate">{formatTime12Hour(event.start)}–{formatTime12Hour(event.end)}</span>
          </span>
          <span className="flex min-h-0 min-w-0 items-center gap-1 text-[9px] leading-none opacity-80">
            <MapPin size={9} className="shrink-0" />
            <span className="truncate">{event.room || '—'}</span>
          </span>
        </>
      )}

      {!layout.isTiny && !layout.isCompact && (
        <>
          <span className="shrink-0 truncate text-sm font-bold">{event.subject}</span>
          <span className="shrink-0 truncate opacity-90">{event.description}</span>
          <span className="mt-auto flex flex-col gap-0.5 text-[10px] opacity-75">
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {formatTime12Hour(event.start)} - {formatTime12Hour(event.end)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              {event.room}
            </span>
          </span>
        </>
      )}
    </button>
  );
};

export default ScheduleEventCard;
