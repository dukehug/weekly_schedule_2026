import { APP_VERSION } from '../utils/appVersion.js';

const AppFooter = () => (
  <footer className="mx-auto mt-4 flex w-full max-w-full flex-col gap-1 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between print:hidden">
    <p>
      Made by{' '}
      <a
        className="text-gray-400 underline underline-offset-2 transition-colors hover:text-gray-400"
        href="https://www.facebook.com/DukeHsuPh"
        target="_blank"
        rel="noreferrer"
      >
        DukeHsu
      </a>{' '}
      with ❤️ for klasmeyt
    </p>

    <p aria-label={`Version ${APP_VERSION}`}>v{APP_VERSION}</p>
  </footer>
);

export default AppFooter;
