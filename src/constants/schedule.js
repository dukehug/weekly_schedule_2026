export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const START_HOUR = 7;
export const END_HOUR = 22;
export const HOUR_HEIGHT = 80;
export const SCHEDULE_STORAGE_KEY = 'mySchedule';

export const SLATE_COLOR = 'bg-slate-200 border-slate-500 text-slate-900';
export const LEGACY_GRAY_COLOR = 'bg-gray-100 border-gray-300 text-gray-800';

export const COLOR_OPTIONS = [
  { name: 'Blue', value: 'bg-blue-100 border-blue-300 text-blue-800', bg: 'bg-blue-100' },
  { name: 'Green', value: 'bg-green-100 border-green-300 text-green-800', bg: 'bg-green-100' },
  { name: 'Purple', value: 'bg-purple-100 border-purple-300 text-purple-800', bg: 'bg-purple-100' },
  { name: 'Yellow', value: 'bg-yellow-100 border-yellow-300 text-yellow-800', bg: 'bg-yellow-100' },
  { name: 'Red', value: 'bg-red-100 border-red-300 text-red-800', bg: 'bg-red-100' },
  { name: 'Indigo', value: 'bg-indigo-100 border-indigo-300 text-indigo-800', bg: 'bg-indigo-100' },
  { name: 'Pink', value: 'bg-pink-100 border-pink-300 text-pink-800', bg: 'bg-pink-100' },
  { name: 'Orange', value: 'bg-orange-100 border-orange-300 text-orange-800', bg: 'bg-orange-100' },
  { name: 'Teal', value: 'bg-teal-100 border-teal-300 text-teal-800', bg: 'bg-teal-100' },
  { name: 'Slate', value: SLATE_COLOR, bg: 'bg-slate-300' },
];

export const INITIAL_EVENTS = [
  {
    id: '1',
    subject: 'IT226L',
    description: 'EXAMPLE COURSE',
    day: 'Wednesday',
    start: '14:00',
    end: '17:00',
    room: 'TBA',
    color: COLOR_OPTIONS[0].value,
  },
];
