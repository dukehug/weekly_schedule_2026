const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const READABILITY_SAMPLE_WIDTH = 36;
const READABILITY_SAMPLE_HEIGHT = 78;

export const BACKGROUND_PICTURE_ACCEPT = SUPPORTED_IMAGE_TYPES.join(',');
export const DEFAULT_BACKGROUND_OVERLAY_OPACITY = 0.72;
export const MIN_BACKGROUND_PICTURE_ZOOM = 1;
export const MAX_BACKGROUND_PICTURE_ZOOM = 3;
export const DEFAULT_BACKGROUND_PICTURE_TRANSFORM = Object.freeze({
  zoom: MIN_BACKGROUND_PICTURE_ZOOM,
  positionX: 0.5,
  positionY: 0.5,
});

const clamp = (value, minimum, maximum) => (
  Math.min(maximum, Math.max(minimum, value))
);

/** Keep crop controls inside the range supported by the preview and exporter. */
export const normalizeBackgroundPictureTransform = (transform = {}) => ({
  zoom: clamp(
    Number(transform.zoom) || DEFAULT_BACKGROUND_PICTURE_TRANSFORM.zoom,
    MIN_BACKGROUND_PICTURE_ZOOM,
    MAX_BACKGROUND_PICTURE_ZOOM,
  ),
  positionX: clamp(
    Number.isFinite(Number(transform.positionX))
      ? Number(transform.positionX)
      : DEFAULT_BACKGROUND_PICTURE_TRANSFORM.positionX,
    0,
    1,
  ),
  positionY: clamp(
    Number.isFinite(Number(transform.positionY))
      ? Number(transform.positionY)
      : DEFAULT_BACKGROUND_PICTURE_TRANSFORM.positionY,
    0,
    1,
  ),
});

/**
 * Calculate a CSS-like cover crop. Position values choose which edge of the
 * enlarged image remains visible, so the same crop works in preview and export.
 */
export const getCoverImageDrawRect = (
  canvasWidth,
  canvasHeight,
  imageWidth,
  imageHeight,
  transform,
) => {
  const safeTransform = normalizeBackgroundPictureTransform(transform);
  const coverScale = Math.max(
    canvasWidth / imageWidth,
    canvasHeight / imageHeight,
  );
  const scale = coverScale * safeTransform.zoom;
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  const x = safeTransform.positionX === 0
    ? 0
    : (canvasWidth - width) * safeTransform.positionX;
  const y = safeTransform.positionY === 0
    ? 0
    : (canvasHeight - height) * safeTransform.positionY;

  return {
    x,
    y,
    width,
    height,
  };
};

/**
 * Move the crop in the same direction as a finger or pointer drag. Overflow is
 * used so dragging feels consistent at different image sizes and zoom levels.
 */
export const getBackgroundPictureTransformAfterDrag = ({
  canvasHeight,
  canvasWidth,
  deltaX,
  deltaY,
  imageHeight,
  imageWidth,
  transform,
}) => {
  const safeTransform = normalizeBackgroundPictureTransform(transform);
  const drawRect = getCoverImageDrawRect(
    canvasWidth,
    canvasHeight,
    imageWidth,
    imageHeight,
    safeTransform,
  );
  const horizontalOverflow = Math.max(0, drawRect.width - canvasWidth);
  const verticalOverflow = Math.max(0, drawRect.height - canvasHeight);
  let positionX = safeTransform.positionX;
  let positionY = safeTransform.positionY;

  if (horizontalOverflow > 0) {
    positionX -= deltaX / horizontalOverflow;
  }
  if (verticalOverflow > 0) {
    positionY -= deltaY / verticalOverflow;
  }

  return normalizeBackgroundPictureTransform({
    ...safeTransform,
    positionX,
    positionY,
  });
};

/** Choose light text for dark crops and dark text for bright crops. */
export const getWallpaperTextTone = (brightness) => {
  if (brightness < 0.48) {
    return 'light';
  }
  return 'dark';
};

/** Sample the visible crop at a small size so color detection stays fast. */
const getCroppedImageBrightness = (image, transform) => {
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = READABILITY_SAMPLE_WIDTH;
  sampleCanvas.height = READABILITY_SAMPLE_HEIGHT;
  const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
  const drawRect = getCoverImageDrawRect(
    sampleCanvas.width,
    sampleCanvas.height,
    image.naturalWidth,
    image.naturalHeight,
    transform,
  );

  sampleContext.drawImage(
    image,
    drawRect.x,
    drawRect.y,
    drawRect.width,
    drawRect.height,
  );

  const pixels = sampleContext.getImageData(
    0,
    0,
    sampleCanvas.width,
    sampleCanvas.height,
  ).data;
  let totalBrightness = 0;
  let visiblePixelCount = 0;

  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3];
    if (alpha === 0) {
      continue;
    }

    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    totalBrightness += (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255;
    visiblePixelCount += 1;
  }

  if (visiblePixelCount === 0) {
    return 1;
  }
  return totalBrightness / visiblePixelCount;
};

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
 * Draw a loaded image using the selected crop, then add a matching light or
 * dark veil. The returned tone tells the schedule which text palette to use.
 */
export const drawBackgroundImage = (
  context,
  canvas,
  image,
  {
    overlayOpacity = DEFAULT_BACKGROUND_OVERLAY_OPACITY,
    transform = DEFAULT_BACKGROUND_PICTURE_TRANSFORM,
  } = {},
) => {
  const brightness = getCroppedImageBrightness(image, transform);
  const textTone = getWallpaperTextTone(brightness);
  const drawRect = getCoverImageDrawRect(
    canvas.width,
    canvas.height,
    image.naturalWidth,
    image.naturalHeight,
    transform,
  );

  context.drawImage(
    image,
    drawRect.x,
    drawRect.y,
    drawRect.width,
    drawRect.height,
  );
  // Clamp external values so Canvas always receives a valid opacity.
  const safeOpacity = Math.min(1, Math.max(0, overlayOpacity));
  if (textTone === 'light') {
    context.fillStyle = `rgba(0, 0, 0, ${safeOpacity})`;
  } else {
    context.fillStyle = `rgba(255, 255, 255, ${safeOpacity})`;
  }
  context.fillRect(0, 0, canvas.width, canvas.height);
  return textTone;
};

/** Load a local file and draw it with the same options used by the preview. */
export const drawBackgroundPicture = async (context, canvas, file, options) => {
  const image = await loadLocalImage(file);
  return drawBackgroundImage(context, canvas, image, options);
};
