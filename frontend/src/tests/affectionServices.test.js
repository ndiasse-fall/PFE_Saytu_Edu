import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMatiereClasseAssignments } from '../app/services/affectations/affectionServices.js';

test('builds one assignment payload per selected class', () => {
  const payloads = buildMatiereClasseAssignments([2, 5], 8);

  assert.deepEqual(payloads, [
    { classe_id: 2, matiere_id: 8 },
    { classe_id: 5, matiere_id: 8 },
  ]);
});

test('throws when no class is selected', () => {
  assert.throws(() => buildMatiereClasseAssignments([], 8), /au moins une classe/i);
});
