/** Return whether Escape should close the current dialog. */
export const shouldCloseModalOnEscape = (key, isCloseDisabled = false) => (
  key === 'Escape' && !isCloseDisabled
);
