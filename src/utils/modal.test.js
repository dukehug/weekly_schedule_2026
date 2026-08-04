import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldCloseModalOnEscape } from './modal.js';

test('closes an available dialog when Escape is pressed', () => {
  assert.equal(shouldCloseModalOnEscape('Escape'), true);
});

test('keeps a disabled dialog open and ignores other keys', () => {
  assert.equal(shouldCloseModalOnEscape('Escape', true), false);
  assert.equal(shouldCloseModalOnEscape('Enter'), false);
});
