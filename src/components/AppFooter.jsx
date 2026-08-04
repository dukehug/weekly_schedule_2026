import { useState } from 'react';
import { APP_VERSION } from '../utils/appVersion.js';
import ChangelogModal from './ChangelogModal.jsx';

const AppFooter = () => {
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  return (
    <>
      <footer className="mx-auto mt-4 flex w-full max-w-full flex-col gap-1 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <p>
          Made with ❤️ by{' '}
          <a
            className="text-gray-400 underline underline-offset-2 transition-colors hover:text-gray-400"
            href="https://www.facebook.com/DukeHsuPh"
            target="_blank"
            rel="noreferrer"
          >
            DukeHsu
          </a>{' '}
          For all klasmeyts.
        </p>

        <button
          type="button"
          onClick={() => setIsChangelogOpen(true)}
          className="w-fit rounded underline decoration-dotted underline-offset-4 transition-colors hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label={`See what is new in version ${APP_VERSION}`}
        >
          v{APP_VERSION}
        </button>
      </footer>

      {isChangelogOpen && (
        <ChangelogModal onClose={() => setIsChangelogOpen(false)} />
      )}
    </>
  );
};

export default AppFooter;
