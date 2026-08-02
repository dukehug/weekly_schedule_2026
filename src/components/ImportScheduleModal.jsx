import { Upload } from 'lucide-react';
import { useState } from 'react';
import ModalShell from './ModalShell.jsx';

const ImportScheduleModal = ({ onClose, onImport }) => {
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    try {
      onImport(importText);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to import this data.';
      setImportError(message);
    }
  };

  return (
    <ModalShell title="Import Schedule" maxWidthClass="max-w-2xl" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div>
          <label htmlFor="import-data" className="mb-1 block text-sm font-medium text-gray-700">
            Paste your schedule data
          </label>
          <p className="mb-3 text-sm text-gray-500">
            Importing will replace the current schedule and save it automatically.
            <br />
            <strong>Copy ‘Enrolled Subjects’ from your ADU Live, then paste it into the content box.</strong>
          </p>
          <textarea
            id="import-data"
            value={importText}
            onChange={(event) => {
              setImportText(event.target.value);
              if (importError) {
                setImportError('');
              }
            }}
            rows={14}
            autoFocus
            placeholder={'Section\nSubject\nUnits\n29082\nIT327L : APPLICATIONS DEVT LAB (290048)\nTH 14:00-17:00 CL10\n1'}
            className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 font-mono text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-400"
          />
        </div>

        {importError && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {importError}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-800">
            <Upload size={16} /> Confirm Import
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default ImportScheduleModal;
