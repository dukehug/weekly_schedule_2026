import { X } from 'lucide-react';
import { useEffect, useId } from 'react';
import { shouldCloseModalOnEscape } from '../utils/modal.js';

const ModalShell = ({
  children,
  isCloseDisabled = false,
  maxWidthClass = 'max-w-md',
  onClose,
  title,
  titleDetail,
}) => {
  const titleId = useId();

  useEffect(() => {
    /** Keep Escape behavior consistent across every dialog that uses this shell. */
    const handleKeyDown = (event) => {
      if (shouldCloseModalOnEscape(event.key, isCloseDisabled)) {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCloseDisabled, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isCloseDisabled) {
          onClose();
        }
      }}
    >
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl ${maxWidthClass}`}>
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">{title}</h2>
            {titleDetail && <p className="mt-0.5 text-sm text-gray-500">{titleDetail}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isCloseDisabled}
            className="text-gray-400 transition-colors hover:text-gray-700 disabled:opacity-40"
            aria-label={`Close ${title} dialog`}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ModalShell;
