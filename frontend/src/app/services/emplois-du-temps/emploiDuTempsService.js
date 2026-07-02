import { apiClient } from '../../core/api/apiClient.js'

const BASE_URL = '/emplois-du-temps'

const validDays = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']

function toTimeString(value) {
  if (!value) return ''
  const text = String(value).trim()
  if (!text) return ''
  if (/^\d{2}:\d{2}(?::\d{2})?$/.test(text)) {
    const [h, m] = text.split(':')
    return `${h}:${m}${text.split(':').length === 2 ? ':00' : ''}`
  }
  return text
}

function toNormalizedDay(value) {
  const day = String(value || '').trim().toLowerCase()
  if (!day) return ''
  const match = validDays.find((candidate) => day.includes(candidate))
  return match || day
}

function toInteger(value) {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number(String(value).trim())
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeString(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

export function normalizeEdtPayload(formValues = {}) {
  const payload = {
    id_classe: toInteger(formValues.id_classe),
    id_matiere: toInteger(formValues.id_matiere),
    id_enseignant: toInteger(formValues.id_enseignant),
    jour: toNormalizedDay(formValues.jour),
    heure_debut: toTimeString(formValues.heure_debut),
    heure_fin: toTimeString(formValues.heure_fin),
    salle: normalizeString(formValues.salle),
    est_publie: Boolean(formValues.est_publie),
  }

  return payload
}

export function normalizeApiResponse(response) {
  if (!response) return []
  if (Array.isArray(response)) return response

  const payload = response?.data ?? response

  if (Array.isArray(payload)) return payload
  if (payload?.data !== undefined) return payload.data

  return []
}

export async function listEmplois(filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value)
    }
  })
  const query = params.toString()
  return apiClient(`${BASE_URL}${query ? `?${query}` : ''}`)
}

export async function listMonEmploiDuTemps() {
  return apiClient('/mon-emploi-du-temps')
}

export async function showEmploi(id) {
  return apiClient(`${BASE_URL}/${id}`)
}

export async function createEmploi(payload) {
  return apiClient(BASE_URL, {
    method: 'POST',
    data: normalizeEdtPayload(payload),
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function updateEmploi(id, payload) {
  return apiClient(`${BASE_URL}/${id}`, {
    method: 'PUT',
    data: normalizeEdtPayload(payload),
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function deleteEmploi(id) {
  return apiClient(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  })
}

export async function publierEmploi(idClasse, estPublie) {
  const bodyData = {
    id_classe: Number(idClasse),
    est_publie: Boolean(estPublie),
  }
  return apiClient(`${BASE_URL}/publier`, {
    method: 'POST',
    data: bodyData,
    headers: { 'Content-Type': 'application/json' }
  })
}

// Helpers for dropdowns in forms
export async function listClasses() {
  return apiClient('/classes')
}

export async function listTeachers() {
  return apiClient('/users?role=ENSEIGNANT')
}

export async function listMatieres() {
  return apiClient('/matieres')
}