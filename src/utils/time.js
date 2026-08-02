/** Convert a 24-hour time string into minutes after midnight for layout calculations. */
export const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const formatTime12Hour = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const formatCurrentTime = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/** Keep all current-time positioning rules together so the grid only renders the result. */
export const getCurrentTimeIndicator = (date, startHour, endHour, hourHeight) => {
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const scheduleStartMinutes = startHour * 60;
  const scheduleEndMinutes = endHour * 60;

  return {
    isVisible: currentMinutes >= scheduleStartMinutes && currentMinutes <= scheduleEndMinutes,
    top: ((currentMinutes - scheduleStartMinutes) / 60) * hourHeight,
  };
};
