import { Upload } from 'lucide-react';
import { useRef } from 'react';
import { BACKGROUND_PICTURE_ACCEPT } from '../utils/backgroundPicture.js';
import ModalShell from './ModalShell.jsx';

const BackgroundPictureModal = ({
  backgroundOverlayOpacity,
  backgroundPicture,
  backgroundPictureError,
  onClear,
  onClose,
  onOpacityChange,
  onSelect,
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
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            <div className="relative h-40">
              <img src={backgroundPicture.previewUrl} alt="Selected phone wallpaper background" className="h-full w-full object-cover" />
              <span
                className="wallpaper-light-overlay pointer-events-none absolute inset-0 bg-white"
                style={{ opacity: backgroundOverlayOpacity }}
                aria-hidden="true"
              />
            </div>
            <p className="truncate px-3 py-2 text-xs text-gray-600">{backgroundPicture.name}</p>
          </div>
        )}

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-4">
            <label htmlFor="background-overlay" className="text-sm font-medium text-gray-700">Light overlay opacity</label>
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
            Increase the overlay when the schedule text is difficult to read.
          </p>
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
