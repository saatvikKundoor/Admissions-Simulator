// sound.js
// Persisted SFX volume only. Actual playback now lives in uiSfx.js, which
// wraps the real uisfx audio library and reads/writes this value.

const STORAGE_KEY_VOLUME = 'sfxVolume'
const DEFAULT_VOLUME = 0.7

export function getSfxVolume() {
  if (typeof window === 'undefined') return DEFAULT_VOLUME
  const stored = localStorage.getItem(STORAGE_KEY_VOLUME)
  return stored === null ? DEFAULT_VOLUME : Number(stored)
}

export function setSfxVolume(value) {
  if (typeof window === 'undefined') return
  const clamped = Math.min(1, Math.max(0, value))
  localStorage.setItem(STORAGE_KEY_VOLUME, String(clamped))
}