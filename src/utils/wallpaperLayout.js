export const WALLPAPER_SCHEDULE_OFFSET_Y = 730;

/**
 * Keeps the wallpaper schedule below the phone lock-screen clock while leaving
 * the footer anchored near the bottom edge of the image.
 */
export const getWallpaperScheduleLayout = () => ({
  titleY: 134 + WALLPAPER_SCHEDULE_OFFSET_Y,
  dateRangeY: 194 + WALLPAPER_SCHEDULE_OFFSET_Y,
  dividerY: 236 + WALLPAPER_SCHEDULE_OFFSET_Y,
  cardsTop: 310 + WALLPAPER_SCHEDULE_OFFSET_Y,
  emptyCardY: 340 + WALLPAPER_SCHEDULE_OFFSET_Y,
  emptyMessageY: 545 + WALLPAPER_SCHEDULE_OFFSET_Y,
});
