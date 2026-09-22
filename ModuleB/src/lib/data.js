import { errorMessage } from './ui.js'

const cache = new Map()

export async function loadJSON(path, friendly) {
  if (cache.has(path)) return cache.get(path)
  try {
    const res = await fetch(path)
    if (!res.ok) throw new Error(String(res.status))
    const data = await res.json()
    cache.set(path, data)
    return data
  } catch {
    errorMessage.value = friendly
    return null
  }
}
