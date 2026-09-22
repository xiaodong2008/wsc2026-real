const KEY = 'wsc2026-stamps'

export function codeOf(session) {
  if (session && session.code) return String(session.code).trim().toLowerCase()
  return (String(session.id) + 'a7k3m9qx').slice(0, 8)
}

export function loadCollected() {
  return new Set(JSON.parse(localStorage.getItem(KEY) || '[]'))
}

export function saveCollected(set) {
  localStorage.setItem(KEY, JSON.stringify([...set]))
}
