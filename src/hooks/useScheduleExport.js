import { useState } from 'react';
import { trackEvent } from '../utils/analytics.js';
import { exportSchedule } from '../utils/printSchedule.js';

/** Coordinate asynchronous downloads while exposing simple UI-ready status. */
export const useScheduleExport = ({
  events,
  backgroundPicture,
  backgroundOverlayOpacity,
  backgroundPictureTransform,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const clearExportError = () => setExportError('');

  const exportScheduleFile = async (format, options) => {
    setIsExporting(true);
    setExportError('');

    try {
      await exportSchedule(format, events, {
        ...options,
        backgroundPictureFile: backgroundPicture?.file,
        backgroundOverlayOpacity,
        backgroundPictureTransform,
      });
      trackEvent('export_schedule', {
        export_format: format,
        time_format: options.timeFormat,
        ...(format === 'wallpaper'
          ? { wallpaper_background: backgroundPicture ? 'custom' : options.wallpaperTheme }
          : {}),
        session_count: events.length,
      });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to export the schedule.';
      setExportError(message);
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  return { clearExportError, exportError, exportScheduleFile, isExporting };
};
