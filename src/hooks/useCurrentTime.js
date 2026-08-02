import { useEffect, useState } from 'react';

/** Update on minute boundaries so the current-time line never drifts between minutes. */
export const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    let minuteInterval;
    const millisecondsUntilNextMinute = 60000 - (Date.now() % 60000);
    const minuteTimeout = window.setTimeout(() => {
      setCurrentTime(new Date());
      minuteInterval = window.setInterval(() => setCurrentTime(new Date()), 60000);
    }, millisecondsUntilNextMinute);

    return () => {
      window.clearTimeout(minuteTimeout);
      window.clearInterval(minuteInterval);
    };
  }, []);

  return currentTime;
};
