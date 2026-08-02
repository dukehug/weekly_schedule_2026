import { useEffect, useState } from 'react';
import {
  createBackgroundPicture,
  DEFAULT_BACKGROUND_OVERLAY_OPACITY,
  releaseBackgroundPicture,
} from '../utils/backgroundPicture.js';
import { trackEvent } from '../utils/analytics.js';

/** Own the browser-only wallpaper preview and always release its object URL. */
export const useBackgroundPicture = () => {
  const [backgroundPicture, setBackgroundPicture] = useState(null);
  const [backgroundOverlayOpacity, setBackgroundOverlayOpacity] = useState(
    DEFAULT_BACKGROUND_OVERLAY_OPACITY,
  );
  const [backgroundPictureError, setBackgroundPictureError] = useState('');

  useEffect(() => (
    () => releaseBackgroundPicture(backgroundPicture)
  ), [backgroundPicture]);

  const selectBackgroundPicture = (file) => {
    try {
      setBackgroundPicture(createBackgroundPicture(file));
      setBackgroundPictureError('');
      trackEvent('set_wallpaper_background', { picture_type: file.type });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to use this picture.';
      setBackgroundPictureError(message);
    }
  };

  const clearBackgroundPicture = () => {
    setBackgroundPicture(null);
    setBackgroundOverlayOpacity(DEFAULT_BACKGROUND_OVERLAY_OPACITY);
    setBackgroundPictureError('');
    trackEvent('clear_wallpaper_background');
  };

  return {
    backgroundOverlayOpacity,
    backgroundPicture,
    backgroundPictureError,
    clearBackgroundPicture,
    selectBackgroundPicture,
    setBackgroundOverlayOpacity,
    setBackgroundPictureError,
  };
};
