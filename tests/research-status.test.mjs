import test from 'node:test';
import assert from 'node:assert/strict';
import { researchStatusLabel } from '../src/utils/researchStatus.js';

test('legacy verification and numeric confidence labels are not endorsed', () => {
  for (const status of ['peer reviewed', 'crawled live', 'VERIFIED', 'empirically proven', '99.1% confidence']) {
    assert.equal(researchStatusLabel(status), 'Unverified status');
  }
  assert.equal(researchStatusLabel('Illustrative example'), 'Illustrative example');
  assert.equal(researchStatusLabel('live web retrieval'), 'live web retrieval');
  assert.equal(researchStatusLabel(undefined), 'Research artifact');
});
