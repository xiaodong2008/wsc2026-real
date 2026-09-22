const KEY = 'wsc2026-stamps'
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'

export function hashCode(id) {
  let hash = 2166136261
  const src = `wsc2026-session-${id}`
  for (let i = 0; i < src.length; i += 1) {
    hash ^= src.charCodeAt(i)
    hash = Math.imul(hash, 16777619) >>> 0
  }
  let out = ''
  for (let i = 0; i < 8; i += 1) {
    hash = Math.imul(hash ^ (hash >>> 15), 2246822507) >>> 0
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909) >>> 0
    out += ALPHABET[hash % 36]
  }
  return out
}

export function codeOf(session) {
  if (session && session.code) return String(session.code).trim().toLowerCase()
  return hashCode(session.id)
}

export function loadCollected() {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY)) || [])
  } catch {
    return new Set()
  }
}

export function saveCollected(set) {
  localStorage.setItem(KEY, JSON.stringify([...set]))
}
