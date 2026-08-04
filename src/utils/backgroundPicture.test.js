import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getBackgroundPictureTransformAfterDrag,
  getCoverImageDrawRect,
  getWallpaperTextTone,
  normalizeBackgroundPictureTransform,
} from './backgroundPicture.js';

test('centers a cover crop at the default zoom', () => {
  const drawRect = getCoverImageDrawRect(100, 200, 200, 100);

  assert.deepEqual(drawRect, {
    x: -150,
    y: 0,
    width: 400,
    height: 200,
  });
});

test('applies zoom and selected crop position', () => {
  const drawRect = getCoverImageDrawRect(100, 200, 200, 100, {
    zoom: 2,
    positionX: 1,
    positionY: 0,
  });

  assert.deepEqual(drawRect, {
    x: -700,
    y: 0,
    width: 800,
    height: 400,
  });
});

test('clamps crop controls to their supported limits', () => {
  assert.deepEqual(normalizeBackgroundPictureTransform({
    zoom: 8,
    positionX: -1,
    positionY: 2,
  }), {
    zoom: 3,
    positionX: 0,
    positionY: 1,
  });
});

test('moves the crop with a pointer drag and ignores an axis without overflow', () => {
  const transform = getBackgroundPictureTransformAfterDrag({
    canvasWidth: 100,
    canvasHeight: 200,
    imageWidth: 200,
    imageHeight: 100,
    deltaX: 30,
    deltaY: 50,
    transform: { zoom: 1, positionX: 0.5, positionY: 0.5 },
  });

  assert.equal(transform.positionX, 0.4);
  assert.equal(transform.positionY, 0.5);
});

test('chooses a readable text tone from crop brightness', () => {
  assert.equal(getWallpaperTextTone(0.2), 'light');
  assert.equal(getWallpaperTextTone(0.8), 'dark');
});
