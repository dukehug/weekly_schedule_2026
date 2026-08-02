import { X } from 'lucide-react';

const ModalShell = ({
  children,
  isCloseDisabled = false,
  maxWidthClass = 'max-w-md',
  onClose,
  title,
  titleDetail,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:hidden"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isCloseDisabled) {
        onClose();
      }
    }}
  >
    <div className={`max-h-[90vh] w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl ${maxWidthClass}`}>
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">{title}</h2>
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

export default ModalShell;
