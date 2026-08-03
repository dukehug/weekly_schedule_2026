import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getWallpaperScheduleLayout,
  WALLPAPER_SCHEDULE_OFFSET_Y,
} from './wallpaperLayout.js';

test('moves all top wallpaper schedule content down by 730 pixels', () => {
  const layout = getWallpaperScheduleLayout();

  assert.equal(WALLPAPER_SCHEDULE_OFFSET_Y, 730);
  assert.equal(layout.titleY - 134, 730);
  assert.equal(layout.dateRangeY - 194, 730);
  assert.equal(layout.dividerY - 236, 730);
  assert.equal(layout.cardsTop - 310, 730);
});

test('moves the empty schedule message down by the same offset', () => {
  const layout = getWallpaperScheduleLayout();

  assert.equal(layout.emptyCardY - 340, 730);
  assert.equal(layout.emptyMessageY - 545, 730);
});
