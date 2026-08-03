import packageJson from '../../package.json' with { type: 'json' };

// Keep the displayed version in sync with the package used for each release.
export const APP_VERSION = packageJson.version;
