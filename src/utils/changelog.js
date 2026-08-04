/**
 * Convert the small Keep a Changelog subset used by this project into data the
 * version dialog can render without duplicating release notes in JavaScript.
 */
export const parseChangelog = (markdown) => {
  const releases = [];
  let currentRelease = null;
  let currentSection = null;

  String(markdown).split('\n').forEach((line) => {
    if (line.startsWith('## ')) {
      currentRelease = {
        title: line.slice(3).trim(),
        sections: [],
      };
      releases.push(currentRelease);
      currentSection = null;
      return;
    }

    if (line.startsWith('### ') && currentRelease) {
      currentSection = {
        title: line.slice(4).trim(),
        items: [],
      };
      currentRelease.sections.push(currentSection);
      return;
    }

    if (line.startsWith('- ') && currentSection) {
      currentSection.items.push(line.slice(2).trim());
    }
  });

  return releases;
};
