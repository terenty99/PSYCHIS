import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeString } from '../src/utils/nodeSanitizer.js';

test('string sanitization preserves strings, empty strings and primitive values', () => {
  assert.equal(sanitizeString(' hello '), 'hello');
  assert.equal(sanitizeString('', 'fallback'), '');
  assert.equal(sanitizeString(null), '');
  assert.equal(sanitizeString(undefined), '');
  assert.equal(sanitizeString(null, null), null);
  assert.equal(sanitizeString(42), '42');
  assert.equal(sanitizeString(false), 'false');
});

test('objects and arrays cannot leak renderable objects', () => {
  assert.equal(sanitizeString({ title: ' Name ' }), 'Name');
  assert.equal(sanitizeString({ unknown: true }, 'fallback'), 'fallback');
  assert.equal(sanitizeString({ title: { nested: true } }), '');
  assert.equal(sanitizeString({ title: { text: 'Nested name' } }), 'Nested name');
  assert.equal(sanitizeString({ title: {}, description: 'Description' }), 'Description');
  assert.equal(sanitizeString(['hello', { text: 'world' }, {}, null, 0, false]), 'hello, world, 0, false');
  assert.equal(sanitizeString({}, {}), '');
  const cyclic = {}; cyclic.title = cyclic;
  assert.equal(sanitizeString(cyclic), '');
});
