import { FileText, LoaderCircle, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { useScheduleExport } from '../hooks/useScheduleExport.js';
import { WALLPAPER_THEMES } from '../utils/printSchedule.js';
import ModalShell from './ModalShell.jsx';

const TIME_FORMAT_OPTIONS = [
  { value: '12-hour', label: '12-hour', example: '2:00 PM' },
  { value: '24-hour', label: '24-hour', example: '14:00' },
];

const ExportScheduleModal = ({
  backgroundOverlayOpacity,
  backgroundPicture,
  backgroundPictureTransform,
  events,
  onClose,
}) => {
  const [timeFormat, setTimeFormat] = useState('12-hour');
  const [wallpaperTheme, setWallpaperTheme] = useState(WALLPAPER_THEMES[0].id);
  const {
    exportError,
    exportScheduleFile,
    isExporting,
  } = useScheduleExport({
    events,
    backgroundPicture,
    backgroundOverlayOpacity,
    backgroundPictureTransform,
  });

  const handleExport = async (format) => {
    const didExport = await exportScheduleFile(format, { timeFormat, wallpaperTheme });
    if (didExport) {
      onClose();
    }
  };

  return (
    <ModalShell
      title="Export schedule"
      titleDetail="Choose the size you want to download."
      maxWidthClass="max-w-lg"
      onClose={onClose}
    >
      <div className="grid gap-3 p-6 sm:grid-cols-2">
        <fieldset className="mb-2 sm:col-span-2">
          <legend className="text-sm font-medium text-gray-700">Time system</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {TIME_FORMAT_OPTIONS.map(option => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${timeFormat === option.value ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}
              >
                <input
                  type="radio"
                  name="export-time-format"
                  value={option.value}
                  checked={timeFormat === option.value}
                  onChange={() => setTimeFormat(option.value)}
                  disabled={isExporting}
                  className="accent-gray-950"
                />
                <span>
                  <span className="block text-sm font-medium text-gray-900">{option.label}</span>
                  <span className="block text-xs text-gray-500">{option.example}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button type="button" onClick={() => handleExport('a4')} disabled={isExporting} className="group rounded-xl border border-gray-200 p-5 text-left transition-colors hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:cursor-wait disabled:opacity-50">
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-gray-700 group-hover:bg-white"><FileText size={22} /></span>
          <span className="block font-semibold text-gray-900">A4</span>
          <span className="mt-1 block text-sm text-gray-500">Landscape · PDF</span>
        </button>

        <button type="button" onClick={() => handleExport('wallpaper')} disabled={isExporting} className="group rounded-xl border border-gray-200 p-5 text-left transition-colors hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:cursor-wait disabled:opacity-50">
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-gray-700 group-hover:bg-white"><Smartphone size={22} /></span>
          <span className="block font-semibold text-gray-900">Phone wallpaper</span>
          <span className="mt-1 block text-sm text-gray-500">1440 × 3120 · JPG</span>
        </button>

        <fieldset className="mt-2 sm:col-span-2">
          <legend className="text-sm font-medium text-gray-700">Wallpaper background</legend>
          <p className="mb-3 mt-1 text-xs text-gray-500">
            Curated from{' '}
            <a href="https://uigradients.com/" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-gray-800">uiGradients</a>
            {' '}for clear, dark schedule text.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {WALLPAPER_THEMES.map(theme => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setWallpaperTheme(theme.id)}
                disabled={isExporting || Boolean(backgroundPicture)}
                aria-pressed={wallpaperTheme === theme.id}
                className={`rounded-lg border p-1.5 text-left transition focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 ${wallpaperTheme === theme.id ? 'border-gray-800 ring-1 ring-gray-800' : 'border-gray-200 hover:border-gray-400'}`}
              >
                <span className="block h-10 rounded-md border border-black/5" style={{ background: `linear-gradient(135deg, ${theme.colors.join(', ')})` }} />
                <span className="mt-1.5 block truncate text-[11px] font-medium text-gray-700">{theme.name}</span>
              </button>
            ))}
          </div>
          {backgroundPicture && <p className="mt-2 text-xs text-red-500">Your custom picture is active. Clear it to use a gradient.</p>}
        </fieldset>
      </div>

      {(isExporting || exportError) && (
        <div className="px-6 pb-5">
          {isExporting && (
            <div className="flex items-center gap-2 text-sm text-gray-600" role="status">
              <LoaderCircle size={16} className="animate-spin" /> Preparing your download…
            </div>
          )}
          {exportError && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{exportError}</div>
          )}
        </div>
      )}
    </ModalShell>
  );
};

export default ExportScheduleModal;
