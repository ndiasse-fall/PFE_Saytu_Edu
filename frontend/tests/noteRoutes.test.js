import assert from 'node:assert/strict';
import test from 'node:test';

import { buildClasseResultsPath } from '../src/app/util/noteRoutes.js';

test('buildClasseResultsPath returns a valid route for a class id', () => {
  assert.equal(buildClasseResultsPath(42), '/notes/resultats/classe/42');
});

test('buildClasseResultsPath handles empty class ids safely', () => {
  assert.equal(buildClasseResultsPath(''), '/notes/resultats/classe/');
});
