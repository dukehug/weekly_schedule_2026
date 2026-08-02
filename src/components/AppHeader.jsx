import {
  Calendar,
  Download,
  ImagePlus,
  Plus,
  RotateCcw,
  Save,
  Upload,
} from 'lucide-react';
import ThemePicker from './ThemePicker.jsx';

const AppHeader = ({
  onAddEvent,
  onImport,
  onOpenBackground,
  onOpenExport,
  onReset,
  onSave,
  onThemeChange,
  theme,
}) => (
  <header className="mx-auto mb-5 flex max-w-full flex-col items-start justify-between gap-4 md:flex-row md:items-center print:hidden">
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-gray-900">
        <Calendar className="h-6 w-6 text-gray-600" />
        My Weekly Schedule
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Plan your week at a glance. At{' '}
        <a
          className="text-gray-700 underline underline-offset-2 hover:text-gray-950"
          href="https://weekly.52hz.im"
          target="_blank"
          rel="noreferrer"
        >
          https://weekly.52hz.im
        </a>
      </p>
    </div>

    <div className="flex flex-wrap gap-2">
      <ThemePicker theme={theme} onThemeChange={onThemeChange} />
      <button type="button" onClick={onAddEvent} className="flex items-center gap-2 rounded-md border border-gray-900 bg-gray-900 px-3.5 py-2 text-white transition-colors hover:bg-gray-800">
        <Plus size={18} /> Add New
      </button>
      <button type="button" onClick={onImport} className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3.5 py-2 text-gray-700 transition-colors hover:bg-gray-50">
        <Upload size={18} /> Import
      </button>
      <button type="button" onClick={onSave} className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3.5 py-2 text-gray-700 transition-colors hover:bg-gray-50">
        <Save size={18} /> Save
      </button>
      <button type="button" onClick={onOpenBackground} className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3.5 py-2 text-gray-700 transition-colors hover:bg-gray-50">
        <ImagePlus size={18} /> Set bg-pic
      </button>
      <button type="button" onClick={onOpenExport} className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3.5 py-2 text-gray-700 transition-colors hover:bg-gray-50">
        <Download size={18} /> Print
      </button>
      <button type="button" onClick={onReset} className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3.5 py-2 text-red-600 transition-colors hover:border-red-300 hover:bg-red-50">
        <RotateCcw size={18} /> Empty
      </button>
    </div>
  </header>
);

export default AppHeader;
