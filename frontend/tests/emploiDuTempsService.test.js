import test from 'node:test'
import assert from 'node:assert/strict'

import { normalizeEdtPayload, normalizeApiResponse } from '../src/app/services/emplois-du-temps/emploiDuTempsService.js'

test('normalizeEdtPayload converts form values to backend payload', () => {
  const payload = normalizeEdtPayload({
    id_classe: '12',
    id_matiere: '3',
    id_enseignant: '8',
    jour: '  MARDI  ',
    heure_debut: '08:30',
    heure_fin: '10:00',
    salle: '  B12  '
  })

  assert.deepEqual(payload, {
    id_classe: 12,
    id_matiere: 3,
    id_enseignant: 8,
    jour: 'mardi',
    heure_debut: '08:30:00',
    heure_fin: '10:00:00',
    salle: 'B12',
    est_publie: false,
  })
})

test('normalizeApiResponse unwraps nested API payloads', () => {
  assert.deepEqual(normalizeApiResponse({ data: { data: [{ id: 1 }] } }), [{ id: 1 }])
  assert.deepEqual(normalizeApiResponse({ data: { success: true, data: { id: 2 } } }), { id: 2 })
  assert.deepEqual(normalizeApiResponse({ success: true, data: [{ id: 3 }] }), [{ id: 3 }])
})
