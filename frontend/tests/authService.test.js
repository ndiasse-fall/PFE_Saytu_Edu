import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeAuthenticatedUser } from '../src/app/services/auth/authService.js'

test('unwraps nested auth payloads and normalizes role values', () => {
  const normalized = normalizeAuthenticatedUser({
    data: {
      id: 7,
      prenom: 'Alice',
      nom: 'Durand',
      role: { value: 'ENSEIGNANT' },
    },
  })

  assert.equal(normalized.id, 7)
  assert.equal(normalized.role, 'ENSEIGNANT')
  assert.equal(normalized.prenom, 'Alice')
})

test('keeps already-raw user payloads intact', () => {
  const normalized = normalizeAuthenticatedUser({
    id: 8,
    prenom: 'Bob',
    nom: 'Martin',
    role: 'ELEVE',
  })

  assert.equal(normalized.id, 8)
  assert.equal(normalized.role, 'ELEVE')
})
