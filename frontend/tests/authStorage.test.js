import assert from 'node:assert/strict'
import { afterEach, before, test } from 'node:test'

class MemoryStorage {
  constructor() {
    this.values = new Map()
  }

  getItem(key) {
    return this.values.get(key) ?? null
  }

  setItem(key, value) {
    this.values.set(key, String(value))
  }

  removeItem(key) {
    this.values.delete(key)
  }

  clear() {
    this.values.clear()
  }
}

globalThis.localStorage = new MemoryStorage()
globalThis.sessionStorage = new MemoryStorage()

let authStorage

before(async () => {
  authStorage = await import('../src/app/core/storage/authStorage.js')
})

afterEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

test('stores a remembered session in localStorage', () => {
  authStorage.storeAuth('token-local', { id: 1 }, true)

  assert.equal(authStorage.getStoredToken(), 'token-local')
  assert.deepEqual(authStorage.getStoredUser(), { id: 1 })
  assert.equal(sessionStorage.getItem('saytou_edu_token'), null)
})

test('stores a temporary session in sessionStorage', () => {
  authStorage.storeAuth('token-session', { id: 2 }, false)

  assert.equal(authStorage.getStoredToken(), 'token-session')
  assert.deepEqual(authStorage.getStoredUser(), { id: 2 })
  assert.equal(localStorage.getItem('saytou_edu_token'), null)
})

test('clears corrupted authentication data', () => {
  localStorage.setItem('saytou_edu_token', 'invalid-token')
  localStorage.setItem('saytou_edu_user', '{invalid-json')

  assert.equal(authStorage.getStoredUser(), null)
  assert.equal(authStorage.getStoredToken(), null)
})
