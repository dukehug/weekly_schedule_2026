const DAY_NAMES = {
  M: 'Monday',
  T: 'Tuesday',
  W: 'Wednesday',
  TH: 'Thursday',
  F: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
};

const DAY_CODES = ['SUN', 'SAT', 'TH', 'M', 'T', 'W', 'F'];

const IMPORT_COLORS = [
  'bg-blue-100 border-blue-300 text-blue-800',
  'bg-green-100 border-green-300 text-green-800',
  'bg-yellow-100 border-yellow-300 text-yellow-800',
  'bg-red-100 border-red-300 text-red-800',
  'bg-teal-100 border-teal-300 text-teal-800',
  'bg-purple-100 border-purple-300 text-purple-800',
  'bg-indigo-100 border-indigo-300 text-indigo-800',
  'bg-orange-100 border-orange-300 text-orange-800',
  'bg-pink-100 border-pink-300 text-pink-800',
  'bg-slate-200 border-slate-500 text-slate-900',
];

const cleanLine = (line) => line
  .trim()
  .replace(/^\*\*(.*?)\*\*$/, '$1')
  .trim();

const parseDays = (value) => {
  const compactValue = value.toUpperCase().replace(/[\s,/&+-]+/g, '');
  const days = [];
  let remaining = compactValue;

  while (remaining) {
    const code = DAY_CODES.find(candidate => remaining.startsWith(candidate));
    if (!code) {
      throw new Error(`Unrecognized day code "${value}".`);
    }

    days.push(DAY_NAMES[code]);
    remaining = remaining.slice(code.length);
  }

  return [...new Set(days)];
};

const courseFamily = (subject) => subject.replace(/L$/i, '');

const colorForCourse = (subject, colorByCourse) => {
  const family = courseFamily(subject);
  if (!colorByCourse.has(family)) {
    colorByCourse.set(family, IMPORT_COLORS[colorByCourse.size % IMPORT_COLORS.length]);
  }
  return colorByCourse.get(family);
};

const normalizeDescription = (value) => value
  .replace(/\s+(LAB|LEC)$/i, ' - $1')
  .replace(/\s+/g, ' ')
  .trim();

const normalizeTime = (value) => {
  const [hours, minutes] = value.split(':');
  return `${hours.padStart(2, '0')}:${minutes}`;
};

/**
 * Convert copied enrollment data into the event objects used by the schedule.
 */
export const parseImportedSchedule = (rawText, idSeed = Date.now()) => {
  const lines = rawText
    .split(/\r?\n/)
    .map(cleanLine)
    .filter(Boolean)
    .filter(line => !['Section', 'Subject', 'Units'].includes(line));

  if (lines.length === 0) {
    throw new Error('Paste your schedule data before importing.');
  }

  const records = [];
  for (let index = 0; index < lines.length;) {
    if (!/^\d+$/.test(lines[index])) {
      throw new Error(`Expected a section number, but found "${lines[index]}".`);
    }

    if (index + 3 >= lines.length) {
      throw new Error(`Section ${lines[index]} is missing subject, schedule, or units data.`);
    }

    records.push({
      section: lines[index],
      subjectLine: lines[index + 1],
      scheduleLine: lines[index + 2],
      units: lines[index + 3],
    });
    index += 4;
  }

  const colorByCourse = new Map();
  let eventIndex = 0;

  return records.flatMap((record) => {
    if (!/^\d+(?:\.\d+)?$/.test(record.units)) {
      throw new Error(`Section ${record.section} has an invalid units value.`);
    }

    const subjectMatch = record.subjectLine.match(/^([^:]+?)\s*:\s*(.*?)(?:\s+\(\d+\))?$/);
    if (!subjectMatch) {
      throw new Error(`Section ${record.section} has an invalid subject line.`);
    }

    const scheduleMatch = record.scheduleLine.match(
      /^(.+?)\s+(\d{1,2}:\d{2})\s*[-–—]\s*(\d{1,2}:\d{2})\s+(.+)$/,
    );
    if (!scheduleMatch) {
      throw new Error(`Section ${record.section} has an invalid schedule line.`);
    }

    const [, subjectValue, descriptionValue] = subjectMatch;
    const [, dayCodes, startValue, endValue, roomValue] = scheduleMatch;
    const subject = subjectValue.trim();
    const start = normalizeTime(startValue);
    const end = normalizeTime(endValue);

    if (start >= end) {
      throw new Error(`Section ${record.section} must end after it starts.`);
    }

    const eventBase = {
      subject,
      description: normalizeDescription(descriptionValue),
      room: roomValue.trim(),
      start,
      end,
      color: colorForCourse(subject, colorByCourse),
    };

    return parseDays(dayCodes).map(day => ({
      id: `${idSeed}${eventIndex++}`,
      day,
      ...eventBase,
    }));
  });
};
