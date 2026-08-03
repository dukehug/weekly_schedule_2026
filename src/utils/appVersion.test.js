import assert from 'node:assert/strict';
import test from 'node:test';
import packageJson from '../../package.json' with { type: 'json' };
import { APP_VERSION } from './appVersion.js';

test('uses the package version as the displayed app version', () => {
  assert.equal(APP_VERSION, packageJson.version);
});
