const DAYS_IN_WEEK = 7;
const MONDAY_OFFSET = 6;

const HEADER_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

/** Build the Monday-to-Sunday dates around the browser's current local date. */
export const getCurrentWeekDates = (currentDate) => {
  const monday = new Date(currentDate);
  const daysSinceMonday = (monday.getDay() + MONDAY_OFFSET) % DAYS_IN_WEEK;

  // setDate handles month and year boundaries without manual overflow checks.
  monday.setDate(monday.getDate() - daysSinceMonday);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: DAYS_IN_WEEK }, (_, dayIndex) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + dayIndex);
    return date;
  });
};

export const formatHeaderDate = (date) => HEADER_DATE_FORMATTER.format(date).toUpperCase();

export const formatLocalCalendarDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isSameCalendarDay = (firstDate, secondDate) => (
  firstDate.getFullYear() === secondDate.getFullYear()
  && firstDate.getMonth() === secondDate.getMonth()
  && firstDate.getDate() === secondDate.getDate()
);
