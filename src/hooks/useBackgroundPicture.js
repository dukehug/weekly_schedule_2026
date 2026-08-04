import { useEffect, useState } from 'react';
import {
  createBackgroundPicture,
  DEFAULT_BACKGROUND_OVERLAY_OPACITY,
  DEFAULT_BACKGROUND_PICTURE_TRANSFORM,
  normalizeBackgroundPictureTransform,
  releaseBackgroundPicture,
} from '../utils/backgroundPicture.js';
import { trackEvent } from '../utils/analytics.js';

/** Own the browser-only wallpaper preview and always release its object URL. */
export const useBackgroundPicture = () => {
  const [backgroundPicture, setBackgroundPicture] = useState(null);
  const [backgroundOverlayOpacity, setBackgroundOverlayOpacity] = useState(
    DEFAULT_BACKGROUND_OVERLAY_OPACITY,
  );
  const [backgroundPictureTransform, setBackgroundPictureTransform] = useState(
    DEFAULT_BACKGROUND_PICTURE_TRANSFORM,
  );
  const [backgroundPictureError, setBackgroundPictureError] = useState('');

  useEffect(() => (
    () => releaseBackgroundPicture(backgroundPicture)
  ), [backgroundPicture]);

  const selectBackgroundPicture = (file) => {
    try {
      setBackgroundPicture(createBackgroundPicture(file));
      setBackgroundPictureTransform(DEFAULT_BACKGROUND_PICTURE_TRANSFORM);
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
    setBackgroundPictureTransform(DEFAULT_BACKGROUND_PICTURE_TRANSFORM);
    setBackgroundPictureError('');
    trackEvent('clear_wallpaper_background');
  };

  /** Merge one or more crop controls while keeping every value in range. */
  const updateBackgroundPictureTransform = (changes) => {
    setBackgroundPictureTransform(currentTransform => (
      normalizeBackgroundPictureTransform({
        ...currentTransform,
        ...changes,
      })
    ));
  };

  return {
    backgroundOverlayOpacity,
    backgroundPicture,
    backgroundPictureError,
    backgroundPictureTransform,
    clearBackgroundPicture,
    selectBackgroundPicture,
    setBackgroundOverlayOpacity,
    setBackgroundPictureError,
    updateBackgroundPictureTransform,
  };
};
