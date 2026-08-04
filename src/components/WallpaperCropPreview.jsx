import { useEffect, useRef, useState } from 'react';
import {
  drawBackgroundImage,
  getBackgroundPictureTransformAfterDrag,
} from '../utils/backgroundPicture.js';

const PREVIEW_WIDTH = 360;
const PREVIEW_HEIGHT = 780;
const KEYBOARD_DRAG_DISTANCE = 12;

/** Add a small schedule sample so the automatic text color is visible. */
const drawScheduleContrastSample = (context, textTone) => {
  const textColor = textTone === 'light' ? '#f8fafc' : '#10243d';
  const cardColor = textTone === 'light'
    ? 'rgba(15, 23, 42, 0.36)'
    : 'rgba(255, 255, 255, 0.42)';

  context.save();
  context.fillStyle = textColor;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = '700 20px system-ui, -apple-system, sans-serif';
  context.fillText('WEEKLY SCHEDULE', PREVIEW_WIDTH / 2, 218);

  context.beginPath();
  context.roundRect(20, 252, PREVIEW_WIDTH - 40, 76, 22);
  context.fillStyle = cardColor;
  context.fill();
  context.fillStyle = textColor;
  context.textAlign = 'left';
  context.font = '700 14px system-ui, -apple-system, sans-serif';
  context.fillText('MON', 42, 290);
  context.fillText('8:00 AM  YOUR CLASS', 104, 290);
  context.restore();
};

const WallpaperCropPreview = ({
  onTransformChange,
  overlayOpacity,
  picture,
  transform,
}) => {
  const canvasRef = useRef(null);
  const dragStateRef = useRef(null);
  const [loadedImage, setLoadedImage] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    const image = new Image();
    image.onload = () => {
      if (!isCancelled) {
        setLoadedImage(image);
      }
    };
    image.src = picture.previewUrl;

    return () => {
      isCancelled = true;
    };
  }, [picture.previewUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !loadedImage) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    const textTone = drawBackgroundImage(context, canvas, loadedImage, {
      overlayOpacity,
      transform,
    });
    drawScheduleContrastSample(context, textTone);
  }, [loadedImage, overlayOpacity, transform]);

  /** Remember the starting crop so the image follows the full pointer gesture. */
  const handlePointerDown = (event) => {
    if (!loadedImage) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    dragStateRef.current = {
      bounds,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startTransform: transform,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  /** Convert screen movement to preview pixels before updating the shared crop. */
  const handlePointerMove = (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId || !loadedImage) {
      return;
    }

    const deltaX = (event.clientX - dragState.startClientX)
      * (PREVIEW_WIDTH / dragState.bounds.width);
    const deltaY = (event.clientY - dragState.startClientY)
      * (PREVIEW_HEIGHT / dragState.bounds.height);
    const nextTransform = getBackgroundPictureTransformAfterDrag({
      canvasWidth: PREVIEW_WIDTH,
      canvasHeight: PREVIEW_HEIGHT,
      imageWidth: loadedImage.naturalWidth,
      imageHeight: loadedImage.naturalHeight,
      deltaX,
      deltaY,
      transform: dragState.startTransform,
    });
    onTransformChange(nextTransform);
  };

  const handlePointerEnd = (event) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  /** Arrow keys provide the same crop movement when a pointer is unavailable. */
  const handleKeyDown = (event) => {
    if (!loadedImage) {
      return;
    }

    let deltaX = 0;
    let deltaY = 0;
    if (event.key === 'ArrowLeft') {
      deltaX = -KEYBOARD_DRAG_DISTANCE;
    } else if (event.key === 'ArrowRight') {
      deltaX = KEYBOARD_DRAG_DISTANCE;
    } else if (event.key === 'ArrowUp') {
      deltaY = -KEYBOARD_DRAG_DISTANCE;
    } else if (event.key === 'ArrowDown') {
      deltaY = KEYBOARD_DRAG_DISTANCE;
    } else {
      return;
    }

    event.preventDefault();
    onTransformChange(getBackgroundPictureTransformAfterDrag({
      canvasWidth: PREVIEW_WIDTH,
      canvasHeight: PREVIEW_HEIGHT,
      imageWidth: loadedImage.naturalWidth,
      imageHeight: loadedImage.naturalHeight,
      deltaX,
      deltaY,
      transform,
    }));
  };

  return (
    <canvas
      ref={canvasRef}
      width={PREVIEW_WIDTH}
      height={PREVIEW_HEIGHT}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
      tabIndex="0"
      className="h-auto w-[166px] touch-none cursor-grab rounded-[1.25rem] border border-gray-300 bg-gray-100 shadow-md active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-gray-500"
      aria-label="Phone wallpaper crop preview. Drag to move the picture, or use the arrow keys."
    />
  );
};

export default WallpaperCropPreview;
