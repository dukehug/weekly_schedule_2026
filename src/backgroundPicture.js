const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 15 * 1024 * 1024;

export const BACKGROUND_PICTURE_ACCEPT = SUPPORTED_IMAGE_TYPES.join(',');
export const DEFAULT_BACKGROUND_OVERLAY_OPACITY = 0.72;

/**
 * Validate a local image and create the small object used by the UI.
 * The file remains in the browser and is never uploaded.
 */
export const createBackgroundPicture = (file) => {
  if (!file) {
    throw new Error('Please select a picture.');
  }

  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Please select a JPG, PNG, or WebP picture.');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Please select a picture smaller than 15 MB.');
  }

  return {
    file,
    name: file.name,
    previewUrl: URL.createObjectURL(file),
  };
};

export const releaseBackgroundPicture = (picture) => {
  if (picture?.previewUrl) {
    URL.revokeObjectURL(picture.previewUrl);
  }
};

const loadLocalImage = (file) => new Promise((resolve, reject) => {
  const imageUrl = URL.createObjectURL(file);
  const image = new Image();

  image.onload = () => {
    URL.revokeObjectURL(imageUrl);
    resolve(image);
  };

  image.onerror = () => {
    URL.revokeObjectURL(imageUrl);
    reject(new Error('Unable to read the selected picture.'));
  };

  image.src = imageUrl;
});

/**
 * Draw the picture with CSS-like "cover" cropping, then add a light veil.
 * The veil keeps the schedule's dark text readable on arbitrary photos.
 */
export const drawBackgroundPicture = async (
  context,
  canvas,
  file,
  overlayOpacity = DEFAULT_BACKGROUND_OVERLAY_OPACITY,
) => {
  const image = await loadLocalImage(file);
  const scale = Math.max(
    canvas.width / image.naturalWidth,
    canvas.height / image.naturalHeight,
  );
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const x = (canvas.width - drawWidth) / 2;
  const y = (canvas.height - drawHeight) / 2;

  context.drawImage(image, x, y, drawWidth, drawHeight);
  // Clamp external values so Canvas always receives a valid opacity.
  const safeOpacity = Math.min(1, Math.max(0, overlayOpacity));
  context.fillStyle = `rgba(255, 255, 255, ${safeOpacity})`;
  context.fillRect(0, 0, canvas.width, canvas.height);
};
