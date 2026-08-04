import changelogMarkdown from '../../CHANGELOG.md?raw';
import { parseChangelog } from '../utils/changelog.js';
import ModalShell from './ModalShell.jsx';

const releases = parseChangelog(changelogMarkdown);

const ChangelogModal = ({ onClose }) => (
  <ModalShell
    title="What’s new"
    titleDetail="A quick, friendly look at each update."
    maxWidthClass="max-w-lg"
    onClose={onClose}
  >
    <div className="space-y-7 p-6">
      {releases.map((release, releaseIndex) => (
        <section key={release.title} aria-labelledby={`release-${releaseIndex}`}>
          <h3
            id={`release-${releaseIndex}`}
            className="border-b border-gray-200 pb-2 text-base font-semibold text-gray-900"
          >
            {release.title}
          </h3>
          <div className="mt-3 space-y-4">
            {release.sections.map(section => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold text-gray-700">{section.title}</h4>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-6 text-gray-600">
                  {section.items.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  </ModalShell>
);

export default ChangelogModal;
