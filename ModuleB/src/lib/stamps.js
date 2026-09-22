const KEY = 'wsc2026-stamps'

export function codeOf(session) {
  return String(session.code).trim().toLowerCase()
}

export function loadCollected() {
  return new Set(JSON.parse(localStorage.getItem(KEY) || '[]'))
}

export function saveCollected(set) {
  localStorage.setItem(KEY, JSON.stringify([...set]))
}
