import {
  formatLocalCalendarDate,
  formatHeaderDate,
} from '../utils/scheduleDates.js';

const ScheduleDayHeader = ({ date, day, isToday }) => {
  let headerClasses = 'border-r border-gray-200 px-2 py-3 text-center';
  let dayClasses = 'block truncate text-sm font-semibold text-gray-700';
  let dateClasses = 'mt-0.5 block truncate text-[11px] font-medium text-gray-400';

  if (isToday) {
    headerClasses += ' bg-blue-50 shadow-[inset_0_-2px_0_#60a5fa] dark:bg-blue-950/30';
    dayClasses = 'block truncate text-sm font-bold text-blue-900 dark:text-blue-200';
    dateClasses = 'mt-0.5 block truncate text-[11px] font-semibold text-blue-600 dark:text-blue-300';
  }

  return (
    <div className={headerClasses}>
      <span className={dayClasses}>{day}</span>
      <time className={dateClasses} dateTime={formatLocalCalendarDate(date)}>
        {formatHeaderDate(date)}
      </time>
    </div>
  );
};

export default ScheduleDayHeader;
