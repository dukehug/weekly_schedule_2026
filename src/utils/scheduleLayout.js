/** Mirror the body scroll position while keeping the separate time header stationary. */
export const getScheduleHeaderTransform = (scrollLeft) => {
  const safeScrollLeft = Math.max(0, scrollLeft);
  return `translateX(-${safeScrollLeft}px)`;
};
