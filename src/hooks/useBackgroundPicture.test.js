import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DEFAULT_BACKGROUND_OVERLAY_OPACITY } from '../utils/backgroundPicture.js';
import { useBackgroundPicture } from './useBackgroundPicture.js';

const BackgroundPictureProbe = () => {
  const pictureState = useBackgroundPicture();
  return createElement('output', null, JSON.stringify({
    actionCount: [
      pictureState.clearBackgroundPicture,
      pictureState.selectBackgroundPicture,
      pictureState.setBackgroundOverlayOpacity,
      pictureState.updateBackgroundPictureTransform,
    ].filter(action => typeof action === 'function').length,
    opacity: pictureState.backgroundOverlayOpacity,
    picture: pictureState.backgroundPicture,
    transform: pictureState.backgroundPictureTransform,
  }));
};

test('initializes wallpaper state and exposes its actions', () => {
  const markup = renderToStaticMarkup(createElement(BackgroundPictureProbe));
  assert.match(markup, new RegExp(`&quot;opacity&quot;:${DEFAULT_BACKGROUND_OVERLAY_OPACITY}`));
  assert.match(markup, /&quot;picture&quot;:null/);
  assert.match(markup, /&quot;actionCount&quot;:4/);
  assert.match(markup, /&quot;zoom&quot;:1/);
  assert.match(markup, /&quot;positionX&quot;:0.5/);
  assert.match(markup, /&quot;positionY&quot;:0.5/);
});
