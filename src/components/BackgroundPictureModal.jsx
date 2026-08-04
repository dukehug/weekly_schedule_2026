import { Upload } from 'lucide-react';
import { useRef } from 'react';
import {
  BACKGROUND_PICTURE_ACCEPT,
  DEFAULT_BACKGROUND_OVERLAY_OPACITY,
  DEFAULT_BACKGROUND_PICTURE_TRANSFORM,
  MAX_BACKGROUND_PICTURE_ZOOM,
  MIN_BACKGROUND_PICTURE_ZOOM,
} from '../utils/backgroundPicture.js';
import ModalShell from './ModalShell.jsx';
import WallpaperCropPreview from './WallpaperCropPreview.jsx';

const BackgroundPictureModal = ({
  backgroundOverlayOpacity,
  backgroundPicture,
  backgroundPictureError,
  backgroundPictureTransform,
  onClear,
  onClose,
  onOpacityChange,
  onSelect,
  onTransformChange,
}) => {
  const fileInputRef = useRef(null);

  const handlePictureChange = (event) => {
    const [file] = event.target.files;
    if (file) {
      onSelect(file);
    }
    event.target.value = '';
  };

  return (
    <ModalShell title="Phone wallpaper background" onClose={onClose}>
      <div className="p-6">
        <p className="text-sm text-gray-600">You can select your picture for Phone wallpaper background.</p>

        {backgroundPicture && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-center text-xs font-medium text-gray-600">
              Drag the picture to move it. Use Zoom to get the crop just right.
            </p>
            <div className="flex justify-center">
              <WallpaperCropPreview
                picture={backgroundPicture}
                overlayOpacity={backgroundOverlayOpacity}
                transform={backgroundPictureTransform}
                onTransformChange={onTransformChange}
              />
            </div>
            <p className="mt-3 truncate text-center text-xs text-gray-600">{backgroundPicture.name}</p>

            <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label htmlFor="background-zoom" className="text-sm font-medium text-gray-700">Zoom</label>
                  <output htmlFor="background-zoom" className="text-sm tabular-nums text-gray-600">
                    {Math.round(backgroundPictureTransform.zoom * 100)}%
                  </output>
                </div>
                <input
                  id="background-zoom"
                  type="range"
                  min={MIN_BACKGROUND_PICTURE_ZOOM * 100}
                  max={MAX_BACKGROUND_PICTURE_ZOOM * 100}
                  step="1"
                  value={Math.round(backgroundPictureTransform.zoom * 100)}
                  onChange={event => onTransformChange({
                    zoom: Number(event.target.value) / 100,
                  })}
                  className="w-full accent-gray-900"
                />
              </div>

              <button
                type="button"
                onClick={() => onTransformChange(DEFAULT_BACKGROUND_PICTURE_TRANSFORM)}
                className="text-sm font-medium text-gray-600 underline underline-offset-2 transition-colors hover:text-gray-900"
              >
                Reset crop
              </button>

              <p className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800">
                When you&apos;re happy with the crop, return to Print and choose Phone wallpaper to download it.
              </p>
            </div>
          </div>
        )}

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-4">
            <label htmlFor="background-overlay" className="text-sm font-medium text-gray-700">Contrast strength</label>
            <output htmlFor="background-overlay" className="text-sm tabular-nums text-gray-600">
              {Math.round(backgroundOverlayOpacity * 100)}%
            </output>
          </div>
          <input
            id="background-overlay"
            type="range"
            min="0"
            max="100"
            step="1"
            value={Math.round(backgroundOverlayOpacity * 100)}
            onChange={event => onOpacityChange(Number(event.target.value) / 100)}
            disabled={!backgroundPicture}
            className="w-full accent-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
            aria-describedby="background-overlay-help"
          />
          <p id="background-overlay-help" className="mt-1 text-xs text-gray-500">
            Auto contrast checks your crop, picks light or dark schedule text, and adds a matching veil. 65% or more is recommended.
          </p>
          {backgroundPicture && backgroundOverlayOpacity < 0.65 && (
            <p className="mt-2 text-xs font-medium text-amber-700">
              Text may be difficult to read at this level.
            </p>
          )}
          {backgroundPicture && backgroundOverlayOpacity !== DEFAULT_BACKGROUND_OVERLAY_OPACITY && (
            <button
              type="button"
              onClick={() => onOpacityChange(DEFAULT_BACKGROUND_OVERLAY_OPACITY)}
              className="mt-2 text-sm font-medium text-gray-600 underline underline-offset-2 transition-colors hover:text-gray-900"
            >
              Restore recommended contrast
            </button>
          )}
        </div>

        {backgroundPictureError && (
          <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {backgroundPictureError}
          </div>
        )}

        <input ref={fileInputRef} type="file" accept={BACKGROUND_PICTURE_ACCEPT} onChange={handlePictureChange} className="hidden" />

        <div className="mt-5 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-800">
            <Upload size={16} /> Select pic
          </button>
          <button type="button" onClick={onClear} disabled={!backgroundPicture} className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
            Clear
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default BackgroundPictureModal;
